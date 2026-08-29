import { PrismaClient } from '@/generated/prisma/client'
import { backfillEmbeddings } from './backfill-embeddings'

// Code
export class HousekeepingService {

  // Consts
  clName = 'HousekeepingService'

  // Code
  // Run housekeeping. Called by BatchService on its 15m interval.
  async run(prisma: PrismaClient) {

    // Debug
    const fnName = 'run()'

    // Backfill NULL search embeddings for profiles and projects
    await backfillEmbeddings(prisma)
  }
}
