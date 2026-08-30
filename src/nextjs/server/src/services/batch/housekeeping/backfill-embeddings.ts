// Backfill NULL search embeddings for profiles and projects.
//
// Run as a housekeeping job from HousekeepingService.run(), which BatchService
// calls on its 15m interval. Requires EMBEDDINGS_API_KEY (and optionally
// EMBEDDINGS_BASE_URL / EMBEDDINGS_MODEL) to be set. Without a provider every
// row would keep its NULL embedding and this job is a no-op.

import { Prisma, PrismaClient } from '@/generated/prisma/client'
import { EmbeddingService } from '@/services/search/embedding-service'

// Services
const embeddingService = new EmbeddingService()

// Code
// Backfill profile embeddings. The vector column is not filterable through
// the Prisma schema, so NULL ids are collected with raw SQL.
async function backfillProfiles(prisma: PrismaClient): Promise<void> {

  // Debug
  const fnName = 'backfillProfiles()'

  // Rows to embed
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`SELECT id FROM public."profile" WHERE embedding IS NULL`)

  console.log(`${fnName}: ${rows.length} profiles to embed`)

  // Embed each row
  var count = 0

  for (const { id } of rows) {
    const profile = await prisma.profile.findUnique({
      where: {
        id: id
      }
    })

    if (profile == null) {
      continue
    }

    // Best effort: on failure the embedding stays NULL
    await embeddingService.syncProfileEmbedding(prisma, profile)
    count++

    if (count % 20 === 0) {
      console.log(`${fnName}: ${count}/${rows.length} profiles embedded`)
    }
  }

  // Report
  console.log(`${fnName}: profiles done: ${count} processed`)
}

// Backfill project embeddings. The instance name must be fetched along with
// each row because the project name lives on the project's instance.
async function backfillProjects(prisma: PrismaClient): Promise<void> {

  // Debug
  const fnName = 'backfillProjects()'

  // Rows to embed
  const rows = await prisma.$queryRaw<Array<{ id: string; name: string }>>(
    Prisma.sql`SELECT p.id, i.name
      FROM public."project" p
      JOIN public."instance" i ON i.id = p.instance_id
      WHERE p.embedding IS NULL`)

  console.log(`${fnName}: ${rows.length} projects to embed`)

  // Embed each row
  var count = 0

  for (const row of rows) {
    const project = await prisma.project.findUnique({
      where: {
        id: row.id
      }
    })

    if (project == null) {
      continue
    }

    // Best effort: on failure the embedding stays NULL
    await embeddingService.syncProjectEmbedding(prisma, project, row.name)
    count++

    if (count % 20 === 0) {
      console.log(`${fnName}: ${count}/${rows.length} projects embedded`)
    }
  }

  // Report
  console.log(`${fnName}: projects done: ${count} processed`)
}

// Report how many rows are still NULL after the backfill (failed embedding
// requests are swallowed by the sync services).
async function reportRemainingNulls(prisma: PrismaClient): Promise<void> {

  // Debug
  const fnName = 'reportRemainingNulls()'

  // Counts
  const profileResult = await prisma.$queryRaw<Array<{ count: number }>>(
    Prisma.sql`SELECT count(*)::int AS count FROM public."profile"
      WHERE embedding IS NULL`)

  const projectResult = await prisma.$queryRaw<Array<{ count: number }>>(
    Prisma.sql`SELECT count(*)::int AS count FROM public."project"
      WHERE embedding IS NULL`)

  // Report
  console.log(
    `${fnName}: profiles still NULL: ${profileResult[0]?.count ?? '?'}, ` +
    `projects still NULL: ${projectResult[0]?.count ?? '?'}`)
}

// Backfill NULL search embeddings for profiles and projects
export async function backfillEmbeddings(
  prisma: PrismaClient): Promise<void> {

  // Backfill
  await backfillProfiles(prisma)
  await backfillProjects(prisma)
  // await reportRemainingNulls(prisma)
}
