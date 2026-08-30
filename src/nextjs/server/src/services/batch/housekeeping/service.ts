import { PrismaClient } from '@/generated/prisma/client'
import { autoApproveConnections } from './auto-approve-connections'
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

    // Auto-approve all pending connections in demo mode (IS_DEMO_MODE)
    await autoApproveConnections(prisma)

    // Backfill NULL search embeddings for profiles and projects
    await backfillEmbeddings(prisma)
  }
}
