import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes } from '@/types/demo-data-types'

// Serene Core imports
import { InstanceModel, UserModel, UserProfileModel } from 'serene-core-server'

// Models
import { ProfileModel } from '@/models/profiles/profile-model'

const userProfileModel = new UserProfileModel()
const instanceModel = new InstanceModel()
const userModel = new UserModel()
const profileModel = new ProfileModel()

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

      // Link a User record to the user profile so that demo sign-in (the
      // NextAuth credentials provider signs in by demo user email) resolves
      // to this profile and its demo data
      const user = await userModel.upsert(
        prisma,
        undefined,  // id
        data.email,
        data.name)

      // A demo login that ran before this setup leaves an empty user
      // profile behind (serene-core getOrCreateUserByEmail creates one for
      // the demo email). Detach it so the serene-core getByUserId lookup
      // used at login resolves to the demo user profile and its Relays
      // data, and never to the empty leftover.
      const byUserId = await userProfileModel.getByUserId(
        prisma,
        user.id)

      if (byUserId != null &&
        byUserId.id !== existingUserProfile?.id) {

        await userProfileModel.update(
          prisma,
          byUserId.id,
          byUserId.publicId,
          null,  // userId
          byUserId.isAdmin,
          byUserId.deletePending)
      }

      await userProfileModel.upsert(
        prisma,
        existingUserProfile?.id,
        data.publicId,
        user.id,
        data.isAdmin ?? false,
        null)  // deletePending
    }

    // Upsert instances
    for (const data of DemoDataTypes.instances) {

      const ownerUserProfile = await this.getUserProfileByKey(
        prisma,
        data.ownerUserProfileKey)

      // console.log(`${fnName}: profileKey: ${data.ownerUserProfileKey} - ` +
      //   `${ownerUserProfile?.id ?? 'NOTFOUND'}`)

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

    // Keys outside the demo data refer to Relays profiles by publicId,
    // e.g. a real user owning a demo instance
    if (data == null) {
      const profile = await profileModel.getByPublicId(
        prisma,
        key)

      if (profile == null) {
        throw `${this.clName}: no demo user profile data or Relays profile ` +
          `for key: ${key}`
      }

      const userProfile = await userProfileModel.getById(
        prisma,
        profile.userProfileId)

      if (userProfile == null) {
        throw `${this.clName}: user profile not found for Relays profile: ` +
          `${key}`
      }

      return userProfile
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
