import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes, DemoInstanceData } from '@/types/demo-data-types'

// Class
// Upserts the serene-core records (user profiles and instances) that the
// Relays-specific demo data hangs off.

export class CoreDemoDataSetupService {

  // Consts
  clName = 'CoreDemoDataSetupService'

  // Code
  async setup(prisma: PrismaClient) {

    // Debug
    const fnName = `${this.clName}.setup()`

    // Upsert user profiles
    for (const data of DemoDataTypes.userProfiles) {
      await prisma.userProfile.upsert({
        where: {
          publicId: data.publicId
        },
        create: {
          publicId: data.publicId,
          isAdmin: data.isAdmin ?? false,
          roles: []
        },
        update: {
          isAdmin: data.isAdmin ?? false
        }
      })
    }

    // Upsert instances
    for (const data of DemoDataTypes.instances) {
      const ownerUserProfile = await this.getUserProfileByKey(
        prisma,
        data.ownerUserProfileKey)

      await prisma.instance.upsert({
        where: {
          publicId: data.publicId!
        },
        create: this.toCreate(data, ownerUserProfile.id),
        update: {
          status: data.status,
          name: data.name,
          instanceType: data.instanceType,
          isDefault: data.isDefault ?? false,
          isDemo: data.isDemo ?? false
        }
      })
    }
  }

  // Helpers

  async getUserProfileByKey(
    prisma: PrismaClient,
    key: string) {

    const data = DemoDataTypes.userProfiles.find(d => d.key === key)

    if (data == null) {
      throw `${this.clName}: no demo user profile data for key: ${key}`
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: {
        publicId: data.publicId
      }
    })

    if (userProfile == null) {
      throw `${this.clName}: demo user profile not found: ${data.publicId}`
    }

    return userProfile
  }

  async getInstanceByKey(
    prisma: PrismaClient,
    key: string) {

    const data = DemoDataTypes.instances.find(d => d.key === key)

    if (data == null) {
      throw `${this.clName}: no demo instance data for key: ${key}`
    }

    const instance = await prisma.instance.findUnique({
      where: {
        publicId: data.publicId!
      }
    })

    if (instance == null) {
      throw `${this.clName}: demo instance not found: ${data.publicId}`
    }

    return instance
  }

  private toCreate(
    data: DemoInstanceData,
    userProfileId: string) {

    return {
      publicId: data.publicId,
      userProfileId: userProfileId,
      status: data.status,
      key: data.instanceKey,
      name: data.name,
      instanceType: data.instanceType,
      isDefault: data.isDefault ?? false,
      isDemo: data.isDemo ?? false
    }
  }
}
