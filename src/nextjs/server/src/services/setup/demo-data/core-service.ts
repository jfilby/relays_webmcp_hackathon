import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes } from '@/types/demo-data-types'

// Serene Core imports
import { InstanceModel, UserProfileModel } from 'serene-core-server'

// Models
const userProfileModel = new UserProfileModel()
const instanceModel = new InstanceModel()

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

      // The serene-core upsert locates existing records by user id (demo user
      // profiles have none), so look the record up by publicId first
      const existingUserProfile = await userProfileModel.getByPublicId(
        prisma,
        data.publicId)

      await userProfileModel.upsert(
        prisma,
        existingUserProfile?.id,
        data.publicId,
        null,  // userId
        data.isAdmin ?? false,
        null)  // deletePending
    }

    // Upsert instances
    for (const data of DemoDataTypes.instances) {
      const ownerUserProfile = await this.getUserProfileByKey(
        prisma,
        data.ownerUserProfileKey)

      // The serene-core upsert locates existing records by parent + key +
      // user profile (demo instances have no parent), so look the record up
      // by publicId first
      const existingInstance = await instanceModel.getByPublicId(
        prisma,
        data.publicId!)

      await instanceModel.upsert(
        prisma,
        existingInstance?.id,
        data.publicId!,
        null,  // parentId
        ownerUserProfile.id,
        data.instanceType,
        null,  // projectType
        data.isDemo ?? false,
        data.isDefault ?? false,
        data.status,
        data.publicAccess ?? null,
        data.instanceKey,
        data.name)
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

    const userProfile = await userProfileModel.getByPublicId(
      prisma,
      data.publicId)

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

    const instance = await instanceModel.getByPublicId(
      prisma,
      data.publicId!)

    if (instance == null) {
      throw `${this.clName}: demo instance not found: ${data.publicId}`
    }

    return instance
  }
}
