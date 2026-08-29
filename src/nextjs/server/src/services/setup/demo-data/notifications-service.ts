import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes } from '@/types/demo-data-types'
import { CoreDemoDataSetupService } from './core-service'

// Services
const coreDemoDataService = new CoreDemoDataSetupService()

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

    // Upsert notifications
    for (const data of DemoDataTypes.notifications) {
      const userProfile = await coreDemoDataService.getUserProfileByKey(
        prisma,
        data.userProfileKey)

      const existing = await prisma.notification.findFirst({
        where: {
          userProfileId: userProfile.id,
          type: data.type,
          refModel: null,
          refId: null
        }
      })

      if (existing == null) {
        await prisma.notification.create({
          data: {
            userProfileId: userProfile.id,
            type: data.type,
            readAt: data.read === true ? new Date() : null
          }
        })
      } else {
        await prisma.notification.update({
          where: {
            id: existing.id
          },
          data: {
            readAt: data.read === true ? new Date() : null
          }
        })
      }
    }
  }
}
