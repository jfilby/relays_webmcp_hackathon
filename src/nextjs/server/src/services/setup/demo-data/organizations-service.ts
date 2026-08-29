import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes } from '@/types/demo-data-types'
import { CoreDemoDataSetupService } from './core-service'
import { ProfilesDemoDataSetupService } from './profiles-service'

// Services
const coreDemoDataService = new CoreDemoDataSetupService()
const profilesDemoDataService = new ProfilesDemoDataSetupService()

// Class
// Upserts demo organizations and their members.

export class OrganizationsDemoDataSetupService {

  // Consts
  clName = 'OrganizationsDemoDataSetupService'

  // Code
  async setup(prisma: PrismaClient) {

    // Debug
    const fnName = `${this.clName}.setup()`

    // Upsert organizations
    for (const data of DemoDataTypes.organizations) {
      const instance = await coreDemoDataService.getInstanceByKey(
        prisma,
        data.instanceKey)

      const organization = await prisma.organization.upsert({
        where: {
          instanceId: instance.id
        },
        create: {
          instanceId: instance.id,
          name: data.name,
          website: data.website,
          description: data.description,
          logo: data.logo,
          size: data.size,
          industry: data.industry,
          status: data.status
        },
        update: {
          name: data.name,
          website: data.website,
          description: data.description,
          logo: data.logo,
          size: data.size,
          industry: data.industry,
          status: data.status
        }
      })

      // Upsert members
      const members = DemoDataTypes.organizationMembers.filter(m =>
        m.organizationKey === data.key)

      for (const member of members) {
        const profile = await profilesDemoDataService.getProfileByKey(
          prisma,
          member.profileKey)

        await prisma.organizationMember.upsert({
          where: {
            organizationId_profileId: {
              organizationId: organization.id,
              profileId: profile.id
            }
          },
          create: {
            organizationId: organization.id,
            profileId: profile.id,
            role: member.role,
            status: member.status
          },
          update: {
            role: member.role,
            status: member.status
          }
        })
      }
    }
  }
}
