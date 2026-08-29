import { PrismaClient } from '@/generated/prisma/client'
import {
  DemoDataTypes,
  DemoProfileData
} from '@/types/demo-data-types'
import { CoreDemoDataSetupService } from './core-service'

// Services
const coreDemoDataService = new CoreDemoDataSetupService()

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
      await prisma.skill.upsert({
        where: {
          name: data.name
        },
        create: {
          name: data.name,
          category: data.category,
          status: data.status
        },
        update: {
          category: data.category,
          status: data.status
        }
      })
    }

    // Upsert profiles
    for (const data of DemoDataTypes.profiles) {
      const userProfile = await coreDemoDataService.getUserProfileByKey(
        prisma,
        data.userProfileKey)

      const profile = await prisma.profile.upsert({
        where: {
          publicId: data.publicId
        },
        create: this.toCreate(data, userProfile.id),
        update: this.toUpdate(data)
      })

      // Upsert links
      for (const link of data.links ?? []) {
        await prisma.profileLink.upsert({
          where: {
            profileId_url: {
              profileId: profile.id,
              url: link.url
            }
          },
          create: {
            profileId: profile.id,
            kind: link.kind,
            url: link.url,
            handle: link.handle,
            isVerified: link.isVerified ?? false
          },
          update: {
            kind: link.kind,
            handle: link.handle,
            isVerified: link.isVerified ?? false
          }
        })
      }
    }

    // Upsert profile skills
    for (const data of DemoDataTypes.profileSkills) {
      const profile = await this.getProfileByKey(prisma, data.profileKey)
      const skill = await this.getSkillByKey(prisma, data.skillKey)

      await prisma.profileSkill.upsert({
        where: {
          profileId_skillId: {
            profileId: profile.id,
            skillId: skill.id
          }
        },
        create: {
          profileId: profile.id,
          skillId: skill.id,
          level: data.level
        },
        update: {
          level: data.level
        }
      })
    }

    // Upsert endorsements
    for (const data of DemoDataTypes.endorsements) {
      const fromProfile = await this.getProfileByKey(
        prisma,
        data.fromProfileKey)
      const toProfile = await this.getProfileByKey(prisma, data.toProfileKey)
      const skill = await this.getSkillByKey(prisma, data.skillKey)

      await prisma.endorsement.upsert({
        where: {
          toProfileId_skillId_fromProfileId: {
            toProfileId: toProfile.id,
            skillId: skill.id,
            fromProfileId: fromProfile.id
          }
        },
        create: {
          fromProfileId: fromProfile.id,
          toProfileId: toProfile.id,
          skillId: skill.id,
          comment: data.comment
        },
        update: {
          comment: data.comment
        }
      })
    }

    // Upsert connections
    for (const data of DemoDataTypes.connections) {
      const fromProfile = await this.getProfileByKey(
        prisma,
        data.fromProfileKey)
      const toProfile = await this.getProfileByKey(prisma, data.toProfileKey)

      await prisma.connection.upsert({
        where: {
          fromProfileId_toProfileId: {
            fromProfileId: fromProfile.id,
            toProfileId: toProfile.id
          }
        },
        create: {
          fromProfileId: fromProfile.id,
          toProfileId: toProfile.id,
          status: data.status,
          origin: data.origin,
          message: data.message,
          acceptedAt: data.accepted === true ? new Date() : null
        },
        update: {
          status: data.status,
          origin: data.origin,
          message: data.message
        }
      })
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

    const profile = await prisma.profile.findUnique({
      where: {
        publicId: data.publicId
      }
    })

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

    const skill = await prisma.skill.findUnique({
      where: {
        name: data.name
      }
    })

    if (skill == null) {
      throw `${this.clName}: demo skill not found: ${data.name}`
    }

    return skill
  }

  private toCreate(
    data: DemoProfileData,
    userProfileId: string) {

    return {
      publicId: data.publicId,
      userProfileId: userProfileId,
      type: data.type,
      status: data.status,
      displayName: data.displayName,
      headline: data.headline,
      bio: data.bio,
      location: data.location,
      website: data.website,
      avatar: data.avatar,
      isPublic: data.isPublic ?? true,
      availabilityStatus: data.availabilityStatus ?? 'A',
      isVerified: data.isVerified ?? false,
      verifiedAt: data.verifiedAt != null ? new Date(data.verifiedAt) : null
    }
  }

  private toUpdate(data: DemoProfileData) {

    return {
      type: data.type,
      status: data.status,
      displayName: data.displayName,
      headline: data.headline,
      bio: data.bio,
      location: data.location,
      website: data.website,
      avatar: data.avatar,
      isPublic: data.isPublic ?? true,
      availabilityStatus: data.availabilityStatus ?? 'A',
      isVerified: data.isVerified ?? false,
      verifiedAt: data.verifiedAt != null ? new Date(data.verifiedAt) : null
    }
  }
}
