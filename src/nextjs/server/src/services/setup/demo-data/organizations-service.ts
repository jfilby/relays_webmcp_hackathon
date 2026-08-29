import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes } from '@/types/demo-data-types'
import { CoreDemoDataSetupService } from './core-service'
import { ProfilesDemoDataSetupService } from './profiles-service'

// Models
import { OrganizationMemberModel } from '@/models/organizations/organization-member-model'
import { OrganizationModel } from '@/models/organizations/organization-model'

// Services
const coreDemoDataService = new CoreDemoDataSetupService()
const profilesDemoDataService = new ProfilesDemoDataSetupService()

// Models
const organizationModel = new OrganizationModel()
const organizationMemberModel = new OrganizationMemberModel()

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

      const organization = await organizationModel.upsert(
        prisma,
        undefined,
        instance.id,
        data.name,
        data.website,
        data.description,
        data.logo,
        data.size,
        data.industry,
        data.status)

      // Upsert members
      const members = DemoDataTypes.organizationMembers.filter(m =>
        m.organizationKey === data.key)

      for (const member of members) {
        const profile = await profilesDemoDataService.getProfileByKey(
          prisma,
          member.profileKey)

        await organizationMemberModel.upsert(
          prisma,
          undefined,
          organization.id,
          profile.id,
          member.role,
          member.status)
      }
    }
  }
}
