import { Prisma, PrismaClient } from '@/generated/prisma/client'
import type { Profile } from '@/generated/prisma/client'
import { ProfileModel } from '@/models/profiles/profile-model'
import { SkillModel } from '@/models/profiles/skill-model'
import { ProfileSkillModel } from '@/models/profiles/profile-skill-model'
import { ProfileLinkModel } from '@/models/profiles/profile-link-model'
import { EndorsementModel } from '@/models/profiles/endorsement-model'
import { ConnectionModel } from '@/models/profiles/connection-model'
import { SearchService } from '@/services/search/search-service'
import { AvatarStorageService } from '@/services/uploads/avatar-storage-service'

// Models
const profileModel = new ProfileModel()
const skillModel = new SkillModel()
const profileSkillModel = new ProfileSkillModel()
const profileLinkModel = new ProfileLinkModel()
const endorsementModel = new EndorsementModel()
const connectionModel = new ConnectionModel()
const searchService = new SearchService()
const avatarStorageService = new AvatarStorageService()

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

  // Search public profiles. An empty search browses all public profiles
  // without ranking; otherwise the results come from hybrid search
  // (pgvector semantic + full-text + trigram, combined with technique
  // weights). A type filter limits to humans (H) or agents (A).
  //
  // The tsvector/trigram expressions below must stay in sync with the
  // matching indexes in prisma/search-setup.sql.
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

    // Browse all when there is nothing to rank
    if (search == null || search.trim() === '') {
      const profiles = await
        profileModel.filter(
          prisma,
          true,  // isPublic
          'A',   // status
          type)

      // Return
      return {
        status: true,
        profiles: profiles.map(profile => this.toGraphQL(profile))
      }
    }

    // Hybrid search
    const hits = await
      searchService.hybridSearch(
        prisma,
        search,
        {
          fromSql: `public."profile" p`,
          idColumn: `p.id`,
          tsvectorExpressions: [
            SearchService.toTsvectorSql([
              `p.display_name`,
              `p.headline`,
              `p.bio`,
              `p.location`
            ])
          ],
          trigramFieldsSql: [
            `p.display_name`,
            `p.headline`,
            `p.location`
          ],
          embeddingColumn: `p.embedding`,
          filterSql: type != null ?
            Prisma.sql`p.status = 'A' AND p.is_public = true AND p.type = ${type}` :
            Prisma.sql`p.status = 'A' AND p.is_public = true`
        })

    // Load the records and restore the ranking order
    const profilesById = new Map(
      (await profileModel.getByIds(
        prisma,
        hits.map(hit => hit.id)))
        .map(profile => [profile.id, profile]))

    // Return
    return {
      status: true,
      profiles: hits
        .map(hit => profilesById.get(hit.id))
        .filter(profile => profile != null)
        .map(profile => this.toGraphQL(profile!))
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
    const outgoingConnections = await
      connectionModel.filter(
        prisma,
        profile.id,
        undefined,
        'A')

    const incomingConnections = await
      connectionModel.filter(
        prisma,
        undefined,
        profile.id,
        'A')

    // Merge, de-duplicating connections that appear in both directions
    const seenConnectionIds = new Set<string>()
    const connections = [
      ...outgoingConnections,
      ...incomingConnections
    ].filter(connection => {
      if (seenConnectionIds.has(connection.id)) {
        return false
      }
      seenConnectionIds.add(connection.id)
      return true
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
      profileModel.getByIds(
        prisma,
        peerIds)

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
      avatar: avatarStorageService.resolveUrl(profile.avatar),
      isPublic: profile.isPublic,
      availabilityStatus: profile.availabilityStatus,
      isVerified: profile.isVerified,
      isDemoData: profile.isDemoData === true,
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

    // Fetch the profile skill links
    const profileSkills = await
      profileSkillModel.filter(
        prisma,
        profileId)

    // No skills, nothing else to fetch
    if (profileSkills.length === 0) {
      return {
        status: true,
        skills: []
      }
    }

    // Fetch the skill catalog entries for display
    const skills = await
      skillModel.getByIds(
        prisma,
        profileSkills.map(profileSkill => profileSkill.skillId))

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

    const links = await
      profileLinkModel.getByProfileId(
        prisma,
        profileId)

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

    const endorsements = await
      endorsementModel.getByToProfileId(
        prisma,
        profileId)

    // No endorsements, nothing to enrich
    if (endorsements.length === 0) {
      return {
        status: true,
        endorsements: []
      }
    }

    // Fetch givers and skills for display
    const profiles = await
      profileModel.getByIds(
        prisma,
        endorsements.map(endorsement => endorsement.fromProfileId))

    const skills = await
      skillModel.getByIds(
        prisma,
        endorsements.map(endorsement => endorsement.skillId))

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
