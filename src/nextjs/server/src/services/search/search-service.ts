import { Prisma, PrismaClient } from '@/generated/prisma/client'
import { DEFAULT_SEARCH_WEIGHTS } from '@/types/search-types'
import type { ScoredSearchHit, SearchWeights } from '@/types/search-types'
import { EmbeddingService } from './embedding-service'

// Thresholds used when deciding which rows are candidates: a row must clear
// at least one technique's threshold (or match the full-text query) to be
// scored and ranked.
const TRIGRAM_MATCH_THRESHOLD = 0.1
const SEMANTIC_MATCH_THRESHOLD = 0.3
const DEFAULT_SEARCH_LIMIT = 50

// Configuration for one entity's hybrid search. The SQL fragments are code
// constants (never user input); the user query is always passed as a bound
// parameter. The tsvector/trigram expressions must be kept in sync with the
// matching expression indexes in prisma/search-setup.sql.
export interface HybridSearchConfig {

  // FROM clause, e.g. `public."profile" p` (may include joins)
  fromSql: string

  // The id column selected from fromSql, e.g. `p.id`
  idColumn: string

  // Full-text sources. Each entry is a to_tsvector(...) expression that must
  // be computable from a single table (so it can be expression-indexed); a
  // join across tables is expressed as two entries.
  tsvectorExpressions: string[]

  // Column expressions scored with pg_trgm similarity, e.g. `p.display_name`
  trigramFieldsSql: string[]

  // The vector column holding row embeddings, e.g. `p.embedding`
  embeddingColumn: string | undefined

  // Entity-specific constraints ANDed into the WHERE clause. Values must be
  // bound via Prisma.sql fragments so they stay parameterised.
  filterSql?: Prisma.Sql

  limit?: number
  weights?: SearchWeights
}

interface HybridSearchRow {
  id: string
  score: number
  full_text: number
  trigram: number
  semantic: number | null
}

// Weighted hybrid search across three techniques: pgvector semantic
// similarity, Postgres full-text search and pg_trgm trigram similarity.
//
// Each technique produces a score normalised to 0..1 (full-text is divided by
// the best rank in the candidate set, trigram and cosine similarity are
// already 0..1). The final score is the weighted sum, with the semantic
// weight renormalised away for rows (or queries) without embeddings:
//
//   score = (0.45 * semantic + 0.35 * full_text + 0.20 * trigram) /
//           ((semantic IS NOT NULL ? 0.45 : 0) + 0.35 + 0.20)
export class SearchService {

  // Consts
  clName = 'SearchService'

  // Services
  embeddingService = new EmbeddingService()

  // Code
  // Build a to_tsvector() expression over the given column expressions. The
  // result must match the corresponding expression index in
  // prisma/search-setup.sql.
  static toTsvectorSql(fieldExpressions: string[]): string {
    return `to_tsvector('english', ${
      fieldExpressions.map(field => `coalesce(${field}, '')`).join(` || ' ' || `)
    })`
  }

  // Run one hybrid search. Returns hits ordered by descending combined
  // score; callers load the full records by id and restore this order.
  async hybridSearch(
    prisma: PrismaClient,
    query: string,
    config: HybridSearchConfig): Promise<ScoredSearchHit[]> {

    // Debug
    const fnName = `${this.clName}.hybridSearch()`

    // Config
    const weights = config.weights ?? DEFAULT_SEARCH_WEIGHTS
    const limit = config.limit ?? DEFAULT_SEARCH_LIMIT
    const queryText = query.trim()

    // The query embedding enables the semantic leg; without one (no provider
    // configured, or the request failed) every row's semantic score is null
    // and its weight renormalises away.
    const queryEmbedding = await
      this.embeddingService.embed(queryText)

    const vectorLiteral = queryEmbedding != null ?
      `[${queryEmbedding.join(',')}]` :
      null

    const hasEmbeddings = config.embeddingColumn != null &&
      vectorLiteral != null
    const embeddingColumn = config.embeddingColumn != null ?
      Prisma.raw(config.embeddingColumn) :
      undefined

    // Full-text: one ts_rank_cd() per tsvector source, summed. The websearch
    // syntax tolerates free-form user queries.
    const ftsRanks = Prisma.join(
      config.tsvectorExpressions.map(expression =>
        Prisma.sql`ts_rank_cd(${Prisma.raw(expression)}, websearch_to_tsquery('english', ${queryText}))`),
      ' + ')
    const tsqueryMatch = Prisma.join(
      config.tsvectorExpressions.map(expression =>
        Prisma.sql`(${Prisma.raw(expression)}) @@ websearch_to_tsquery('english', ${queryText})`),
      ' OR ')

    // Trigram: the best character-level similarity across the scored fields
    const trigramScore = Prisma.sql`GREATEST(${Prisma.join(
      config.trigramFieldsSql.map(field =>
        Prisma.sql`similarity(${Prisma.raw(field)}, ${queryText})`),
      ', ')})`

    // Semantic: cosine similarity of the row embedding (null when either the
    // row or the query has no embedding)
    const semanticSelect = hasEmbeddings && embeddingColumn != null ?
      Prisma.sql`1 - (${embeddingColumn} <=> ${vectorLiteral}::vector)` :
      Prisma.sql`NULL::float8`

    // Candidates: match the full-text query, clear the trigram threshold or
    // clear the semantic threshold
    const candidateFilter = hasEmbeddings && embeddingColumn != null ?
      Prisma.sql`(${tsqueryMatch}) OR (${trigramScore}) > ${TRIGRAM_MATCH_THRESHOLD} OR (${embeddingColumn} IS NOT NULL AND 1 - (${embeddingColumn} <=> ${vectorLiteral}::vector) > ${SEMANTIC_MATCH_THRESHOLD})` :
      Prisma.sql`(${tsqueryMatch}) OR (${trigramScore}) > ${TRIGRAM_MATCH_THRESHOLD}`

    const whereClause = config.filterSql != null ?
      Prisma.sql`(${config.filterSql}) AND (${candidateFilter})` :
      Prisma.sql`(${candidateFilter})`

    // Query
    try {
      const rows = await prisma.$queryRaw<HybridSearchRow[]>(Prisma.sql`
        SELECT
          id,
          (${weights.semantic}::float8 * COALESCE(semantic, 0) +
           ${weights.fullText}::float8 * full_text +
           ${weights.trigram}::float8 * trigram) /
          (CASE WHEN semantic IS NOT NULL THEN ${weights.semantic}::float8 ELSE 0::float8 END +
           ${weights.fullText}::float8 + ${weights.trigram}::float8) AS score,
          full_text,
          trigram,
          semantic
        FROM (
          SELECT
            id,
            COALESCE(fts_rank / NULLIF(MAX(fts_rank) OVER (), 0), 0) AS full_text,
            COALESCE(trigram, 0) AS trigram,
            semantic
          FROM (
            SELECT
              ${Prisma.raw(config.idColumn)} AS id,
              ${ftsRanks} AS fts_rank,
              ${trigramScore} AS trigram,
              ${semanticSelect} AS semantic
            FROM ${Prisma.raw(config.fromSql)}
            WHERE ${whereClause}
          ) scored
        ) normalised
        ORDER BY score DESC, id
        LIMIT ${limit}`)

      // Return
      return rows.map(row => ({
        id: row.id,
        score: Number(row.score),
        techniqueScores: {
          semantic: row.semantic == null ? null : Number(row.semantic),
          fullText: Number(row.full_text),
          trigram: Number(row.trigram)
        }
      }))
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }
}
