import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes } from '@/types/demo-data-types'
import { CoreDemoDataSetupService } from './core-service'

// Models
import { EmailListModel } from '@/models/email-lists/email-list-model'
import { EmailListUserModel } from '@/models/email-lists/email-list-user-model'

// Services
const coreDemoDataService = new CoreDemoDataSetupService()

// Models
const emailListModel = new EmailListModel()
const emailListUserModel = new EmailListUserModel()

// Class
// Upserts demo email lists and their subscribers.

export class EmailListsDemoDataSetupService {

  // Consts
  clName = 'EmailListsDemoDataSetupService'

  // Code
  async setup(prisma: PrismaClient) {

    // Debug
    const fnName = `${this.clName}.setup()`

    // Upsert email lists
    for (const data of DemoDataTypes.emailLists) {
      const emailList = await emailListModel.upsert(
        prisma,
        undefined,
        data.name,
        data.status)

      // Upsert subscribers
      for (const userData of data.users ?? []) {
        if (userData.userProfileKey != null) {
          const userProfile = await coreDemoDataService.getUserProfileByKey(
            prisma,
            userData.userProfileKey)

          await emailListUserModel.upsertByUserProfileId(
            prisma,
            emailList.id,
            userProfile.id)
        } else if (userData.email != null) {
          await emailListUserModel.upsertByEmail(
            prisma,
            emailList.id,
            userData.email)
        }
      }
    }
  }
}
