import { PrismaClient } from '@/generated/prisma/client'
import { BaseDataTypes } from '@/types/base-data-types'
// Serene Core imports
import { UserProfileModel } from 'serene-core-server'
import { ProfileModel } from '@/models/profiles/profile-model'
import { SkillModel } from '@/models/profiles/skill-model'
import { ProfileSkillModel } from '@/models/profiles/profile-skill-model'
import { ProfileLinkModel } from '@/models/profiles/profile-link-model'
import { EndorsementModel } from '@/models/profiles/endorsement-model'
import { EmailListsMutateService } from '@/services/email-lists/mutate-service'
import { PublicIdService } from '@/services/utils/public-id-service'
import { ProfilesQueryService } from './query-service'
import { EmbeddingService } from '@/services/search/embedding-service'

// Models
const userProfileModel = new UserProfileModel()
const profileModel = new ProfileModel()
const skillModel = new SkillModel()
const profileSkillModel = new ProfileSkillModel()
const profileLinkModel = new ProfileLinkModel()
const endorsementModel = new EndorsementModel()

// Services
const emailListsMutateService = new EmailListsMutateService()
const profilesQueryService = new ProfilesQueryService()
const embeddingService = new EmbeddingService()

// Class
export class ProfilesMutateService {

  // Consts
  clName = 'ProfilesMutateService'

  // The type field distinguishes a human (H) from an AI agent (A)
  humanType = 'H'
  agentType = 'A'

  // Availability statuses: A (available), B (busy), U (unavailable)
  availableStatuses = ['A', 'B', 'U']

  // Profile link kinds: W website, G github, L linkedin, R repository,
  // M MCP endpoint, X other
  validLinkKinds = ['W', 'G', 'L', 'R', 'M', 'X']

  // Skill proficiency levels: B beginner, I intermediate, A advanced, E expert
  validSkillLevels = ['B', 'I', 'A', 'E']

  // Code
  async create(
    prisma: PrismaClient,
    userProfileId: string,
    displayName: string,
    type: string | undefined,
    isPublic: boolean | undefined,
    headline: string | undefined,
    bio: string | undefined,
    location: string | undefined,
    avatar: string | undefined,
    updates: boolean | undefined,
    availabilityStatus: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Validate the display name
    const validationResults = await
      profilesQueryService.validateDisplayName(
        displayName)

    if (validationResults.status === false) {
      return validationResults
    }

    // Validate the user profile exists
    const userProfile = await
      userProfileModel.getById(
        prisma,
        userProfileId)

    if (userProfile == null) {
      return {
        status: false,
        message: `Internal error trying to validate your user`
      }
    }

    // A profile already exists for this user (userProfileId is unique)
    const existing = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    if (existing != null) {
      return {
        status: false,
        message: `You already have a profile`
      }
    }

    // Validate the type
    if (type != null &&
        type !== this.humanType &&
        type !== this.agentType) {
      return {
        status: false,
        message: `Invalid type`
      }
    }

    // Validate the availability status
    if (availabilityStatus != null &&
        this.availableStatuses.includes(availabilityStatus) === false) {
      return {
        status: false,
        message: `Invalid availability status`
      }
    }

    // Create the profile (defaults are applied in code)
    const profile = await
      profileModel.create(
        prisma,
        userProfileId,
        type ?? this.humanType,
        BaseDataTypes.activeStatus,
        validationResults.displayName,
        isPublic === true,
        headline != null && headline.trim() !== '' ? headline.trim() : undefined,
        bio != null && bio.trim() !== '' ? bio.trim() : undefined,
        location != null && location.trim() !== '' ? location.trim() : undefined,
        avatar != null && avatar.trim() !== '' ? avatar.trim() : undefined,
        availabilityStatus)

    // Subscribe the user to the updates email list if they asked for updates
    if (updates === true) {
      await emailListsMutateService.subscribeByUserProfileId(
        prisma,
        userProfileId)
    }

    // Sync the search embedding (best effort: on failure the embedding is
    // cleared and search degrades to the other techniques)
    await embeddingService.syncProfileEmbedding(prisma, profile)

    // Return
    return {
      status: true,
      message: `Your profile was created`,
      profile: profilesQueryService.toGraphQL(profile)
    }
  }

  async update(
    prisma: PrismaClient,
    id: string,
    userProfileId: string,
    displayName: string | undefined,
    type: string | undefined,
    isPublic: boolean | undefined,
    headline: string | undefined,
    bio: string | undefined,
    location: string | undefined,
    avatar: string | undefined,
    availabilityStatus: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Get the existing profile to verify ownership
    const existing = await
      profileModel.getById(
        prisma,
        id)

    if (existing == null) {
      return {
        status: false,
        message: `Profile not found`
      }
    }

    if (existing.userProfileId !== userProfileId) {
      return {
        status: false,
        message: `You can only edit your own profile`
      }
    }

    // Validate the display name, if being changed
    if (displayName != null) {
      const validationResults = await
        profilesQueryService.validateDisplayName(
          displayName)

      if (validationResults.status === false) {
        return validationResults
      }

      displayName = validationResults.displayName
    }

    // Validate the type, if being changed
    if (type != null &&
        type !== this.humanType &&
        type !== this.agentType) {
      return {
        status: false,
        message: `Invalid type`
      }
    }

    // Validate the availability status, if being changed
    if (availabilityStatus != null &&
        this.availableStatuses.includes(availabilityStatus) === false) {
      return {
        status: false,
        message: `Invalid availability status`
      }
    }

    // At least one field must be provided
    if (displayName == null &&
        type == null &&
        isPublic == null &&
        headline == null &&
        bio == null &&
        location == null &&
        avatar == null &&
        availabilityStatus == null) {
      return {
        status: false,
        message: `No changes to save`
      }
    }

    // Trim the optional text fields
    headline = headline != null && headline.trim() !== '' ? headline.trim() : undefined
    bio = bio != null && bio.trim() !== '' ? bio.trim() : undefined
    location = location != null && location.trim() !== '' ? location.trim() : undefined
    avatar = avatar != null && avatar.trim() !== '' ? avatar.trim() : undefined

    // Update the profile
    const profile = await
      profileModel.update(
        prisma,
        id,
        type,
        undefined,  // status
        displayName,
        isPublic,
        headline,
        bio,
        location,
        avatar,
        availabilityStatus,
        undefined,  // isVerified
        undefined)  // verifiedAt

    // Sync the search embedding (best effort: on failure the embedding is
    // cleared and search degrades to the other techniques)
    await embeddingService.syncProfileEmbedding(prisma, profile)

    // Return
    return {
      status: true,
      message: `Your profile was updated`,
      profile: profilesQueryService.toGraphQL(profile)
    }
  }

  // Turn email updates on/off for a user. Enabling also subscribes the user
  // profile to the updates email list; disabling unsubscribes them.
  async setGetEmailUpdates(
    prisma: PrismaClient,
    userProfileId: string,
    getEmailUpdates: boolean) {

    // Debug
    const fnName = `${this.clName}.setGetEmailUpdates()`

    // Subscribe or unsubscribe from the updates email list
    if (getEmailUpdates) {
      await emailListsMutateService.subscribeByUserProfileId(
        prisma,
        userProfileId)
    } else {
      await emailListsMutateService.unsubscribeByUserProfileId(
        prisma,
        userProfileId)
    }

    // Return
    return {
      status: true,
      message: `Your updates preference was updated`
    }
  }

  // Add a skill to the signed-in user's profile. The skill catalog entry is
  // created if it doesn't exist yet.
  async addSkillToProfile(
    prisma: PrismaClient,
    userProfileId: string,
    skillName: string,
    level: string | undefined) {

    // Debug
    const fnName = `${this.clName}.addSkillToProfile()`

    // Validate
    if (skillName == null || skillName.trim() === '') {
      return {
        status: false,
        message: `Skill name is required`
      }
    }

    if (level != null &&
        this.validSkillLevels.includes(level) === false) {
      return {
        status: false,
        message: `Invalid skill level`
      }
    }

    // Resolve the profile
    const profile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    if (profile == null) {
      return {
        status: false,
        message: `Profile not found`
      }
    }

    // Find or create the catalog entry (names are matched case-insensitively)
    let skill = await
      skillModel.getByExactName(
        prisma,
        skillName.trim())

    if (skill == null) {
      skill = await
        skillModel.create(
          prisma,
          skillName.trim(),
          BaseDataTypes.activeStatus)
    }

    // Link the skill to the profile
    try {
      await
        profileSkillModel.create(
          prisma,
          profile.id,
          skill.id,
          level)
    } catch (error) {
      return {
        status: false,
        message: `You already have this skill on your profile`
      }
    }

    // Return
    return {
      status: true,
      message: `Skill added`,
      skill: {
        id: skill.id,
        name: skill.name,
        level: level
      }
    }
  }

  // Remove a skill from the signed-in user's profile
  async removeSkillFromProfile(
    prisma: PrismaClient,
    userProfileId: string,
    profileSkillId: string) {

    // Debug
    const fnName = `${this.clName}.removeSkillFromProfile()`

    // Load the profile skill to verify ownership
    const profileSkill = await
      profileSkillModel.getById(
        prisma,
        profileSkillId)

    if (profileSkill == null) {
      return {
        status: false,
        message: `Skill not found`
      }
    }

    const profile = await
      profileModel.getById(
        prisma,
        profileSkill.profileId)

    if (profile == null ||
        profile.userProfileId !== userProfileId) {
      return {
        status: false,
        message: `You can only edit your own profile`
      }
    }

    // Delete
    await
      profileSkillModel.deleteById(
        prisma,
        profileSkillId)

    // Return
    return {
      status: true,
      message: `Skill removed`
    }
  }

  // Add an external link to the signed-in user's profile
  async addProfileLink(
    prisma: PrismaClient,
    userProfileId: string,
    kind: string,
    url: string,
    handle: string | undefined) {

    // Debug
    const fnName = `${this.clName}.addProfileLink()`

    // Validate the kind
    if (this.validLinkKinds.includes(kind) === false) {
      return {
        status: false,
        message: `Invalid link type`
      }
    }

    // Validate the URL
    if (url == null || url.trim() === '') {
      return {
        status: false,
        message: `URL is required`
      }
    }

    // The URL must parse as an absolute http(s) URL
    let parsedUrl: URL

    try {
      parsedUrl = new URL(url.trim())
    } catch {
      return {
        status: false,
        message: `URL must be a valid URL (e.g. https://example.com)`
      }
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return {
        status: false,
        message: `URL must start with http:// or https://`
      }
    }

    // The hostname must be a domain (e.g. example.com), not a bare label
    if (parsedUrl.hostname.includes('.') === false) {
      return {
        status: false,
        message: `URL must have a valid domain (e.g. example.com)`
      }
    }

    // Resolve the profile
    const profile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    if (profile == null) {
      return {
        status: false,
        message: `Profile not found`
      }
    }

    // Create the link
    try {
      await
        profileLinkModel.create(
          prisma,
          profile.id,
          kind,
          url.trim(),
          handle != null && handle.trim() !== '' ? handle.trim() : undefined)
    } catch (error) {
      return {
        status: false,
        message: `This link is already on your profile`
      }
    }

    // Return
    return {
      status: true,
      message: `Link added`
    }
  }

  // Delete a link from the signed-in user's profile
  async deleteProfileLinkById(
    prisma: PrismaClient,
    userProfileId: string,
    id: string) {

    // Debug
    const fnName = `${this.clName}.deleteProfileLinkById()`

    // Load the link to verify ownership
    const link = await
      profileLinkModel.getById(
        prisma,
        id)

    if (link == null) {
      return {
        status: false,
        message: `Link not found`
      }
    }

    const profile = await
      profileModel.getById(
        prisma,
        link.profileId)

    if (profile == null ||
        profile.userProfileId !== userProfileId) {
      return {
        status: false,
        message: `You can only edit your own profile`
      }
    }

    // Delete
    await
      profileLinkModel.deleteById(
        prisma,
        link.id)

    // Return
    return {
      status: true,
      message: `Link removed`
    }
  }

  // Endorse a profile's proficiency with a skill they have claimed
  async endorseSkill(
    prisma: PrismaClient,
    fromUserProfileId: string,
    toProfileId: string,
    skillId: string,
    comment: string | undefined) {

    // Debug
    const fnName = `${this.clName}.endorseSkill()`

    // Resolve the giver
    const fromProfile = await
      profileModel.getByUserProfileId(
        prisma,
        fromUserProfileId)

    if (fromProfile == null) {
      return {
        status: false,
        message: `Profile not found`
      }
    }

    // Validate
    if (fromProfile.id === toProfileId) {
      return {
        status: false,
        message: `You can't endorse yourself`
      }
    }

    const toProfile = await
      profileModel.getById(
        prisma,
        toProfileId)

    if (toProfile == null) {
      return {
        status: false,
        message: `Profile not found`
      }
    }

    // Only claimed skills can be endorsed
    const profileSkill = await
      profileSkillModel.getByProfileIdAndSkillId(
        prisma,
        toProfileId,
        skillId)

    if (profileSkill == null) {
      return {
        status: false,
        message: `That profile hasn't claimed this skill`
      }
    }

    // Create the endorsement
    try {
      await
        endorsementModel.create(
          prisma,
          fromProfile.id,
          toProfileId,
          skillId,
          comment != null && comment.trim() !== '' ? comment.trim() : undefined)
    } catch (error) {
      return {
        status: false,
        message: `You already endorsed this skill for this profile`
      }
    }

    // Return
    return {
      status: true,
      message: `Endorsement added`
    }
  }

}
