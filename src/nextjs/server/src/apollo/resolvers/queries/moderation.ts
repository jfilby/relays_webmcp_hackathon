import { prisma } from '@/db'
import { ModerationQueryService } from '@/services/moderation/query-service'

// Services
const moderationQueryService = new ModerationQueryService()

// GraphQL args are schema-validated before the resolver runs
interface GetModerationQueueArgs {
  userProfileId: string
}

// Code
export async function getModerationQueue(
  _parent: unknown,
  { userProfileId }: GetModerationQueueArgs) {

  // Query
  return moderationQueryService.getModerationQueue(
    prisma,
    userProfileId)
}
