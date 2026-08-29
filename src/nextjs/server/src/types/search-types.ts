// Weights applied to each search technique when combining per-technique
// scores into a single ranking score:
//
//   score = semantic * semantic_similarity +
//           fullText * full_text_score +
//           trigram * trigram_similarity
//
// The defaults sum to 1.0. Every technique score is normalised to 0..1.
export interface SearchWeights {
  semantic: number    // pgvector cosine similarity
  fullText: number    // Postgres full-text search (ts_rank_cd)
  trigram: number     // pg_trgm similarity
}

export const DEFAULT_SEARCH_WEIGHTS: SearchWeights = {
  semantic: 0.45,
  fullText: 0.35,
  trigram: 0.20
}

// Per-technique scores for one result. A null semantic score means no
// embedding was available for the row (or for the query); in that case the
// semantic weight is renormalised away for that row.
export interface SearchTechniqueScores {
  semantic: number | null
  fullText: number
  trigram: number
}

// One ranked search result: the record id plus its combined and
// per-technique scores.
export interface ScoredSearchHit {
  id: string
  score: number
  techniqueScores: SearchTechniqueScores
}
