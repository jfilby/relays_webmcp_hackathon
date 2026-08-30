import { PrismaClient } from '@/generated/prisma/client'
import {
  DemoDataTypes
} from '@/types/demo-data-types'
import { CoreDemoDataSetupService } from './core-service'

// Models
import { ConnectionModel } from '@/models/profiles/connection-model'
import { EndorsementModel } from '@/models/profiles/endorsement-model'
import { ProfileLinkModel } from '@/models/profiles/profile-link-model'
import { ProfileModel } from '@/models/profiles/profile-model'
import { ProfileSkillModel } from '@/models/profiles/profile-skill-model'
import { SkillModel } from '@/models/profiles/skill-model'

// Services
const coreDemoDataService = new CoreDemoDataSetupService()

// Models
const profileModel = new ProfileModel()
const skillModel = new SkillModel()
const profileLinkModel = new ProfileLinkModel()
const profileSkillModel = new ProfileSkillModel()
const endorsementModel = new EndorsementModel()
const connectionModel = new ConnectionModel()

// Class
// Upserts demo profiles and the networking data that hangs off them: skills,
// profile links, profile skills, endorsements and connections.

export class ProfilesDemoDataSetupService {

  // Consts
  clName = 'ProfilesDemoDataSetupService'

  // Code
  async setup(prisma: PrismaClient) {

    // Debug
    const fnName = `${this.clName}.setup()`

    // Upsert skills (needed by profile skills and endorsements)
    for (const data of DemoDataTypes.skills) {
      await skillModel.upsert(
        prisma,
        undefined,
        data.name,
        data.category,
        data.status)
    }

    // Upsert profiles
    for (const data of DemoDataTypes.profiles) {
      const userProfile = await coreDemoDataService.getUserProfileByKey(
        prisma,
        data.userProfileKey)

      const profile = await profileModel.upsert(
        prisma,
        undefined,
        data.publicId,
        userProfile.id,
        data.type,
        data.status,
        data.displayName,
        data.isPublic ?? true,
        data.headline,
        data.bio,
        data.location,
        data.website,
        data.avatar,
        data.availabilityStatus ?? 'A',
        data.isVerified ?? false,
        data.verifiedAt != null ? new Date(data.verifiedAt) : null,
        true)  // isDemoData

      // Upsert links
      for (const link of data.links ?? []) {
        await profileLinkModel.upsert(
          prisma,
          undefined,
          profile.id,
          link.kind,
          link.url,
          link.handle,
          link.isVerified ?? false)
      }
    }

    // Upsert profile skills
    for (const data of DemoDataTypes.profileSkills) {
      const profile = await this.getProfileByKey(prisma, data.profileKey)
      const skill = await this.getSkillByKey(prisma, data.skillKey)

      await profileSkillModel.upsert(
        prisma,
        undefined,
        profile.id,
        skill.id,
        data.level)
    }

    // Upsert endorsements
    for (const data of DemoDataTypes.endorsements) {
      const fromProfile = await this.getProfileByKey(
        prisma,
        data.fromProfileKey)
      const toProfile = await this.getProfileByKey(prisma, data.toProfileKey)
      const skill = await this.getSkillByKey(prisma, data.skillKey)

      await endorsementModel.upsert(
        prisma,
        undefined,
        fromProfile.id,
        toProfile.id,
        skill.id,
        data.comment)
    }

    // Upsert connections
    for (const data of DemoDataTypes.connections) {
      const fromProfile = await this.getProfileByKey(
        prisma,
        data.fromProfileKey)
      const toProfile = await this.getProfileByKey(prisma, data.toProfileKey)

      await connectionModel.upsert(
        prisma,
        undefined,
        fromProfile.id,
        toProfile.id,
        data.status,
        data.origin,
        data.message,
        data.accepted === true ? new Date() : null)
    }
  }

  // Helpers

  async getProfileByKey(
    prisma: PrismaClient,
    key: string) {

    const data = DemoDataTypes.profiles.find(d => d.key === key)

    if (data == null) {
      throw `${this.clName}: no demo profile data for key: ${key}`
    }

    const profile = await profileModel.getByPublicId(
      prisma,
      data.publicId)

    if (profile == null) {
      throw `${this.clName}: demo profile not found: ${data.publicId}`
    }

    return profile
  }

  async getSkillByKey(
    prisma: PrismaClient,
    key: string) {

    const data = DemoDataTypes.skills.find(d => d.key === key)

    if (data == null) {
      throw `${this.clName}: no demo skill data for key: ${key}`
    }

    const skill = await skillModel.getByName(
      prisma,
      data.name)

    if (skill == null) {
      throw `${this.clName}: demo skill not found: ${data.name}`
    }

    return skill
  }
}
