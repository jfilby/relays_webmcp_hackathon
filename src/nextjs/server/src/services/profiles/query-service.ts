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
  async getProfileById(
    prisma: PrismaClient,
    id: string,
    viewerUserProfileId: string | undefined) {

    // Debug
    const fnName = `${this.clName}.getProfileById()`

    // Query
    const profile = await
      profileModel.getById(
        prisma,
        id)

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
      created: profile.created.toISOString(),
      updated: profile.updated != null ? profile.updated.toISOString() : undefined
    }
  }
}