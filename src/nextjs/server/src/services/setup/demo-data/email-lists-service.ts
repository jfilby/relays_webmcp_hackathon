import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes } from '@/types/demo-data-types'
import { CoreDemoDataSetupService } from './core-service'

// Services
const coreDemoDataService = new CoreDemoDataSetupService()

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
      const emailList = await prisma.emailList.upsert({
        where: {
          name: data.name
        },
        create: {
          name: data.name,
          status: data.status
        },
        update: {
          status: data.status
        }
      })

      // Upsert subscribers
      for (const userData of data.users ?? []) {
        if (userData.userProfileKey != null) {
          const userProfile = await coreDemoDataService.getUserProfileByKey(
            prisma,
            userData.userProfileKey)

          await prisma.emailListUser.upsert({
            where: {
              emailListId_userProfileId: {
                emailListId: emailList.id,
                userProfileId: userProfile.id
              }
            },
            create: {
              emailListId: emailList.id,
              userProfileId: userProfile.id
            },
            update: {}
          })
        } else if (userData.email != null) {
          await prisma.emailListUser.upsert({
            where: {
              emailListId_email: {
                emailListId: emailList.id,
                email: userData.email
              }
            },
            create: {
              emailListId: emailList.id,
              email: userData.email
            },
            update: {}
          })
        }
      }
    }
  }
}
