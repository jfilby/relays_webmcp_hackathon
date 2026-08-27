import { prisma } from '@/db'
import { NotificationsService } from '@/services/notifications/service'

// Services
const notificationsService = new NotificationsService()

// GraphQL args are schema-validated before the resolver runs
interface GetNotificationsArgs {
  userProfileId: string
  unreadOnly?: boolean | null
}

interface MarkNotificationAsReadArgs {
  id: string
  userProfileId: string
}

// Code
export async function getNotifications(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId,
    unreadOnly
  } = args as unknown as GetNotificationsArgs

  // Query
  return notificationsService.getNotifications(
    prisma,
    userProfileId,
    unreadOnly ?? undefined)
}

export async function markNotificationAsRead(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { id, userProfileId } = args as unknown as MarkNotificationAsReadArgs

  // Mutation
  return notificationsService.markNotificationAsRead(
    prisma,
    userProfileId,
    id)
}
