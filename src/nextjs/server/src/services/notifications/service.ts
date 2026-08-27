import { PrismaClient } from '@/generated/prisma/client'

// Class
export class NotificationsService {

  // Consts
  clName = 'NotificationsService'

  // Code
  // Create a notification for a user (fire-and-forget helper used by other
  // services). Failures are logged but never thrown so they don't mask the
  // primary operation.
  async notify(
    prisma: PrismaClient,
    userProfileId: string,
    type: string,
    refModel: string | undefined = undefined,
    refId: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.notify()`

    // Validate
    if (userProfileId == null || userProfileId === '') {
      console.error(`${fnName}: userProfileId == null`)
      return
    }

    // Create the notification
    try {
      await
        prisma.notification.create({
          data: {
            userProfileId: userProfileId,
            type: type,
            refModel: refModel,
            refId: refId
          }
        })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
    }
  }

  // List notifications for a user, newest first, optionally unread only.
  async getNotifications(
    prisma: PrismaClient,
    userProfileId: string,
    unreadOnly: boolean | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.getNotifications()`

    // Query
    const notifications = await
      prisma.notification.findMany({
        where: {
          userProfileId: userProfileId,
          readAt: unreadOnly === true ? { equals: null } : undefined
        },
        orderBy: {
          created: 'desc'
        }
      })

    // Return
    return {
      status: true,
      notifications: notifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        refModel: notification.refModel,
        refId: notification.refId,
        readAt: notification.readAt != null ? notification.readAt.toISOString() : null,
        created: notification.created.toISOString()
      }))
    }
  }

  // Mark one of the signed-in user's notifications as read
  async markNotificationAsRead(
    prisma: PrismaClient,
    userProfileId: string,
    notificationId: string) {

    // Debug
    const fnName = `${this.clName}.markNotificationAsRead()`

    // Load the notification to verify ownership
    const notification = await
      prisma.notification.findUnique({
        where: {
          id: notificationId
        }
      })

    if (notification == null ||
        notification.userProfileId !== userProfileId) {
      return {
        status: false,
        message: `Notification not found`
      }
    }

    // Update
    await
      prisma.notification.update({
        where: {
          id: notification.id
        },
        data: {
          readAt: new Date()
        }
      })

    // Return
    return {
      status: true,
      message: `Marked as read`
    }
  }
}
