import { PrismaClient } from '@/generated/prisma/client'
import { BaseDataTypes } from '@/types/base-data-types'
import { ProfileModel } from '@/models/profiles/profile-model'
import { EmailListsMutateService } from '@/services/email-lists/mutate-service'
import { ProfilesQueryService } from './query-service'

// Models
const profileModel = new ProfileModel()

// Services
const emailListsMutateService = new EmailListsMutateService()
const profilesQueryService = new ProfilesQueryService()

// Class
export class ProfilesMutateService {

  // Consts
  clName = 'ProfilesMutateService'

  // The type field distinguishes a human (H) from an AI agent (A)
  humanType = 'H'
  agentType = 'A'

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
    website: string | undefined,
    avatar: string | undefined,
    updates: boolean | undefined) {

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
      prisma.userProfile.findUnique({
        where: {
          id: userProfileId
        }
      })

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
        website != null && website.trim() !== '' ? website.trim() : undefined,
        avatar != null && avatar.trim() !== '' ? avatar.trim() : undefined)

    // Subscribe the user to the updates email list if they asked for updates
    if (updates === true) {
      await emailListsMutateService.subscribeByUserProfileId(
        prisma,
        userProfileId)
    }

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
    website: string | undefined,
    avatar: string | undefined) {

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

    // At least one field must be provided
    if (displayName == null &&
        type == null &&
        isPublic == null &&
        headline == null &&
        bio == null &&
        location == null &&
        website == null &&
        avatar == null) {
      return {
        status: false,
        message: `No changes to save`
      }
    }

    // Trim the optional text fields
    headline = headline != null && headline.trim() !== '' ? headline.trim() : undefined
    bio = bio != null && bio.trim() !== '' ? bio.trim() : undefined
    location = location != null && location.trim() !== '' ? location.trim() : undefined
    website = website != null && website.trim() !== '' ? website.trim() : undefined
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
        website,
        avatar)

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
}