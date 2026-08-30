import { prisma } from '@/db'
import { NotificationsService } from '@/services/notifications/service'

// Services
const notificationsService = new NotificationsService()

// GraphQL args are schema-validated before the resolver runs
interface MarkNotificationAsReadArgs {
  id: string
  userProfileId: string
}

// Code
export async function markNotificationAsRead(
  _parent: unknown,
  { id, userProfileId }: MarkNotificationAsReadArgs) {

  // Mutation
  return notificationsService.markNotificationAsRead(
    prisma,
    userProfileId,
    id)
}
