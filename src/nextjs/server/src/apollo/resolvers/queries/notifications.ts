import { prisma } from '@/db'
import { NotificationsService } from '@/services/notifications/service'

// Services
const notificationsService = new NotificationsService()

// GraphQL args are schema-validated before the resolver runs
interface GetNotificationsArgs {
  userProfileId: string
  unreadOnly?: boolean | null
}

// Code
export async function getNotifications(
  _parent: unknown,
  {
    userProfileId,
    unreadOnly
  }: GetNotificationsArgs) {

  // Query
  return notificationsService.getNotifications(
    prisma,
    userProfileId,
    unreadOnly ?? undefined)
}
