import { PrismaClient } from '@/generated/prisma/client'
import { NotificationModel } from '@/models/notifications/notification-model'

// Models
const notificationModel = new NotificationModel()

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
        notificationModel.create(
          prisma,
          userProfileId,
          type,
          refModel,
          refId)
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
      notificationModel.filter(
        prisma,
        userProfileId,
        undefined,
        unreadOnly,
        true)

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
      notificationModel.getById(
        prisma,
        notificationId)

    if (notification == null ||
        notification.userProfileId !== userProfileId) {
      return {
        status: false,
        message: `Notification not found`
      }
    }

    // Update
    await
      notificationModel.markAsRead(
        prisma,
        notification.id,
        new Date())

    // Return
    return {
      status: true,
      message: `Marked as read`
    }
  }

  // Mark all of the signed-in user's notifications as read
  async markAllNotificationsAsRead(
    prisma: PrismaClient,
    userProfileId: string) {

    // Validate
    if (userProfileId == null || userProfileId === '') {
      return {
        status: false,
        message: `User profile not found`
      }
    }

    // Update
    await
      notificationModel.markAllAsRead(
        prisma,
        userProfileId,
        new Date())

    // Return
    return {
      status: true,
      message: `Marked all as read`
    }
  }
}
