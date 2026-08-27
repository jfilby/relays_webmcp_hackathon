import { PrismaClient } from '@/generated/prisma/client'
import type { Prisma, Profile } from '@/generated/prisma/client'
import { ProfileModel } from '@/models/profiles/profile-model'

// Models
const profileModel = new ProfileModel()

// Class
export class ProfilesQueryService {

  // Consts
  clName = 'ProfilesQueryService'

  // Code
  async getProfileByPublicId(
    prisma: PrismaClient,
    publicId: string,
    viewerUserProfileId: string | undefined) {

    // Debug
    const fnName = `${this.clName}.getProfileById()`

    // Query
    const profile = await
      profileModel.getByPublicId(
        prisma,
        publicId)

    // Validate
    if (profile == null) {
      return {
        status: false,
        message: `Profile not found`
      }
    }

    // Private profiles are only visible to their owner
    if (profile.isPublic === false &&
        profile.userProfileId !== viewerUserProfileId) {
      return {
        status: false,
        message: `Profile not found`
      }
    }

    // Return
    return {
      status: true,
      profile: this.toGraphQL(profile)
    }
  }

  async getProfileByUserProfileId(
    prisma: PrismaClient,
    userProfileId: string) {

    // Debug
    const fnName = `${this.clName}.getProfileByUserProfileId()`

    // Query
    const profile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    // Profiles are only returned to their owner
    if (profile != null &&
        profile.userProfileId !== userProfileId) {
      return {
        status: false,
        message: `Profile not found`
      }
    }

    // Validate
    if (profile == null) {
      return {
        status: false,
        message: `Profile not found`
      }
    }

    // Return
    return {
      status: true,
      profile: this.toGraphQL(profile)
    }
  }

  // Search public profiles. An empty search returns all public profiles;
  // a search term matches display name, headline or location; a type filters
  // to humans (H) or agents (A).
  async searchProfiles(
    prisma: PrismaClient,
    search: string | undefined,
    type: string | undefined) {

    // Debug
    const fnName = `${this.clName}.searchProfiles()`

    // Validate the type filter
    if (type != null && type !== 'H' && type !== 'A') {
      return {
        status: false,
        message: `Invalid type`
      }
    }

    // Build the query
    const where: Prisma.ProfileWhereInput = {
      isPublic: true,
      status: 'A'
    }

    if (search != null && search.trim() !== '') {
      where.OR = [
        { displayName: { contains: search.trim(), mode: 'insensitive' } },
        { headline: { contains: search.trim(), mode: 'insensitive' } },
        { location: { contains: search.trim(), mode: 'insensitive' } }
      ]
    }

    if (type != null) {
      where.type = type
    }

    // Query
    const profiles = await
      prisma.profile.findMany({
        where: where,
        orderBy: {
          displayName: 'asc'
        }
      })

    // Return
    return {
      status: true,
      profiles: profiles.map(profile => this.toGraphQL(profile))
    }
  }

  // Get a signed-in user's network: the profiles they have active connections
  // with, in either direction.
  async getNetwork(
    prisma: PrismaClient,
    userProfileId: string) {

    // Debug
    const fnName = `${this.clName}.getNetwork()`

    // Query
    const profile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    // No profile, no network
    if (profile == null) {
      return {
        status: true,
        profiles: []
      }
    }

    // Fetch active connections in either direction
    const connections = await
      prisma.connection.findMany({
        where: {
          status: 'A',
          OR: [
            { fromProfileId: profile.id },
            { toProfileId: profile.id }
          ]
        }
      })

    // The peers are the other end of each connection
    const peerIds = connections
      .map(connection =>
        connection.fromProfileId === profile.id ?
          connection.toProfileId :
          connection.fromProfileId)

    // No peers, no network
    if (peerIds.length === 0) {
      return {
        status: true,
        profiles: []
      }
    }

    // Fetch the connected profiles
    const peers = await
      prisma.profile.findMany({
        where: {
          id: { in: peerIds }
        }
      })

    // Return
    return {
      status: true,
      profiles: peers.map(peer => this.toGraphQL(peer))
    }
  }

  // Validate a display name for create/update
  async validateDisplayName(
    displayName: string | undefined):
    Promise<{ status: true; displayName: string } | { status: false; message: string }> {

    // Debug
    const fnName = `${this.clName}.validateDisplayName()`

    // Validate
    if (displayName == null || displayName.trim() === '') {
      return {
        status: false,
        message: `Display name is required`
      }
    }

    // Return
    return {
      status: true,
      displayName: displayName.trim()
    }
  }

  // Convert a Prisma record into the GraphQL shape (dates as ISO strings)
  toGraphQL(profile: Profile) {

    return {
      id: profile.id,
      publicId: profile.publicId,
      userProfileId: profile.userProfileId,
      type: profile.type,
      status: profile.status,
      displayName: profile.displayName,
      headline: profile.headline,
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      avatar: profile.avatar,
      isPublic: profile.isPublic,
      availabilityStatus: profile.availabilityStatus,
      isVerified: profile.isVerified,
      verifiedAt: profile.verifiedAt != null ? profile.verifiedAt.toISOString() : undefined,
      created: profile.created.toISOString(),
      updated: profile.updated != null ? profile.updated.toISOString() : undefined
    }
  }

  // Get the skills claimed by a profile, each with its name and the claimed
  // proficiency level.
  async getSkillsByProfileId(
    prisma: PrismaClient,
    profileId: string) {

    // Debug
    const fnName = `${this.clName}.getSkillsByProfileId()`

    // Fetch the profile skill links
    const profileSkills = await
      prisma.profileSkill.findMany({
        where: {
          profileId: profileId
        }
      })

    // No skills, nothing else to fetch
    if (profileSkills.length === 0) {
      return {
        status: true,
        skills: []
      }
    }

    // Fetch the skill catalog entries for display
    const skills = await
      prisma.skill.findMany({
        where: {
          id: { in: profileSkills.map(profileSkill => profileSkill.skillId) }
        }
      })

    const nameBySkillId = new Map(skills.map(skill => [skill.id, skill.name]))

    // Return
    return {
      status: true,
      skills: profileSkills
        .map(profileSkill => ({
          id: profileSkill.id,
          skillId: profileSkill.skillId,
          name: nameBySkillId.get(profileSkill.skillId),
          level: profileSkill.level
        }))
        .filter(skill => skill.name != null)
    }
  }

  // Get the external links on a profile
  async getLinksByProfileId(
    prisma: PrismaClient,
    profileId: string) {

    // Debug
    const fnName = `${this.clName}.getLinksByProfileId()`

    // Query
    const links = await
      prisma.profileLink.findMany({
        where: {
          profileId: profileId
        },
        orderBy: {
          created: 'asc'
        }
      })

    // Return
    return {
      status: true,
      links: links.map(link => ({
        id: link.id,
        kind: link.kind,
        url: link.url,
        handle: link.handle
      }))
    }
  }

  // Get the endorsements a profile has received, with giver and skill names.
  async getEndorsementsByProfileId(
    prisma: PrismaClient,
    profileId: string) {

    // Debug
    const fnName = `${this.clName}.getEndorsementsByProfileId()`

    // Query
    const endorsements = await
      prisma.endorsement.findMany({
        where: {
          toProfileId: profileId
        },
        orderBy: {
          created: 'desc'
        }
      })

    // No endorsements, nothing to enrich
    if (endorsements.length === 0) {
      return {
        status: true,
        endorsements: []
      }
    }

    // Fetch givers and skills for display
    const profiles = await
      prisma.profile.findMany({
        where: {
          id: { in: endorsements.map(endorsement => endorsement.fromProfileId) }
        }
      })

    const skills = await
      prisma.skill.findMany({
        where: {
          id: { in: endorsements.map(endorsement => endorsement.skillId) }
        }
      })

    const nameByProfileId = new Map(profiles.map(profile => [profile.id, profile.displayName]))
    const nameBySkillId = new Map(skills.map(skill => [skill.id, skill.name]))

    // Return
    return {
      status: true,
      endorsements: endorsements
        .map(endorsement => ({
          id: endorsement.id,
          fromProfileId: endorsement.fromProfileId,
          fromDisplayName: nameByProfileId.get(endorsement.fromProfileId),
          skillId: endorsement.skillId,
          skillName: nameBySkillId.get(endorsement.skillId),
          comment: endorsement.comment,
          created: endorsement.created.toISOString()
        }))
        .filter(endorsement =>
          endorsement.fromDisplayName != null &&
          endorsement.skillName != null)
    }
  }
}
