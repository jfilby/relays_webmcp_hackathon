import { prisma } from '@/db'
import { ActivityQueryService } from '@/services/activity/query-service'

// Services
const activityQueryService = new ActivityQueryService()

// GraphQL args are schema-validated before the resolver runs
interface GetLatestActivityArgs {
  userProfileId?: string | null
  take?: number | null
}

// Code
export async function getLatestActivity(
  _parent: unknown,
  { userProfileId, take }: GetLatestActivityArgs) {

  // Query
  return activityQueryService.getLatest(
    prisma,
    userProfileId ?? undefined,
    take ?? 10)
}
