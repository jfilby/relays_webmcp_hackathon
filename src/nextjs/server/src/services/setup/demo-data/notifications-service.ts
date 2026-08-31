import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes } from '@/types/demo-data-types'
import { CoreDemoDataSetupService } from './core-service'

// Models
import { NotificationModel } from '@/models/notifications/notification-model'

// Services
const coreDemoDataService = new CoreDemoDataSetupService()

// Models
const notificationModel = new NotificationModel()

// Class
// Upserts demo notifications. Notification has no unique constraint, so
// notifications are located by user + type + refModel + refId.

export class NotificationsDemoDataSetupService {

  // Consts
  clName = 'NotificationsDemoDataSetupService'

  // Code
  async setup(prisma: PrismaClient) {

    // Debug
    const fnName = `${this.clName}.setup()`

    // Remove legacy demo notifications that used camelCase type names
    // (e.g. 'planTargeted'). The upsert below only matches snake_case
    // types, so stale rows would otherwise linger and show raw type
    // names in the UI.
    await notificationModel.deleteByTypes(prisma, ['planTargeted'])

    // Upsert notifications
    for (const data of DemoDataTypes.notifications) {
      const userProfile = await coreDemoDataService.getUserProfileByKey(
        prisma,
        data.userProfileKey)

      const existing = await notificationModel.getByUserProfileIdAndTypeAndNullRef(
        prisma,
        userProfile.id,
        data.type)

      if (existing == null) {
        await notificationModel.create(
          prisma,
          userProfile.id,
          data.type,
          undefined,  // refModel
          undefined,  // refId
          data.read === true ? new Date() : null)
      } else {
        await notificationModel.markAsRead(
          prisma,
          existing.id,
          data.read === true ? new Date() : null)
      }
    }
  }
}
