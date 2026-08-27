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
    website: string | undefined,
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
        website != null && website.trim() !== '' ? website.trim() : undefined,
        avatar != null && avatar.trim() !== '' ? avatar.trim() : undefined,
        availabilityStatus)

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
        website == null &&
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
        avatar,
        availabilityStatus,
        undefined,  // isVerified
        undefined)  // verifiedAt

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
      prisma.skill.findFirst({
        where: {
          name: {
            equals: skillName.trim(),
            mode: 'insensitive'
          }
        }
      })

    if (skill == null) {
      try {
        skill = await
          prisma.skill.create({
            data: {
              name: skillName.trim(),
              status: BaseDataTypes.activeStatus
            }
          })
      } catch (error) {
        console.error(`${fnName}: error: ${error}`)
        throw 'Prisma error'
      }
    }

    // Link the skill to the profile
    try {
      await
        prisma.profileSkill.create({
          data: {
            profileId: profile.id,
            skillId: skill.id,
            level: level
          }
        })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
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
      prisma.profileSkill.findUnique({
        where: {
          id: profileSkillId
        }
      })

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
      prisma.profileSkill.delete({
        where: {
          id: profileSkillId
        }
      })

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
        prisma.profileLink.create({
          data: {
            profileId: profile.id,
            kind: kind,
            url: url.trim(),
            handle: handle != null && handle.trim() !== '' ? handle.trim() : undefined
          }
        })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
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
      prisma.profileLink.findUnique({
        where: {
          id: id
        }
      })

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
      prisma.profileLink.delete({
        where: {
          id: link.id
        }
      })

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
      prisma.profile.findUnique({
        where: {
          id: toProfileId
        }
      })

    if (toProfile == null) {
      return {
        status: false,
        message: `Profile not found`
      }
    }

    // Only claimed skills can be endorsed
    const profileSkill = await
      prisma.profileSkill.findUnique({
        where: {
          profileId_skillId: {
            profileId: toProfileId,
            skillId: skillId
          }
        }
      })

    if (profileSkill == null) {
      return {
        status: false,
        message: `That profile hasn't claimed this skill`
      }
    }

    // Create the endorsement
    try {
      await
        prisma.endorsement.create({
          data: {
            fromProfileId: fromProfile.id,
            toProfileId: toProfileId,
            skillId: skillId,
            comment: comment != null && comment.trim() !== '' ? comment.trim() : undefined
          }
        })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
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

  // Create a post (mini-feed update), optionally attached to a project
  async createPost(
    prisma: PrismaClient,
    userProfileId: string,
    body: string,
    projectId: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.createPost()`

    // Validate
    if (body == null || body.trim() === '') {
      return {
        status: false,
        message: `Post body is required`
      }
    }

    // Resolve the author profile
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

    // Validate the project, if one is attached
    if (projectId != null) {
      const project = await
        prisma.project.findUnique({
          where: {
            id: projectId
          }
        })

      if (project == null) {
        return {
          status: false,
          message: `Project not found`
        }
      }
    }

    // Create the post
    const post = await
      prisma.post.create({
        data: {
          authorProfileId: profile.id,
          status: BaseDataTypes.activeStatus,
          body: body.trim(),
          projectId: projectId
        }
      })

    // Return
    return {
      status: true,
      message: `Posted`,
      post: {
        id: post.id,
        authorProfileId: post.authorProfileId,
        authorName: profile.displayName,
        projectId: post.projectId,
        body: post.body,
        created: post.created.toISOString()
      }
    }
  }

  // Delete a post (authors only)
  async deletePost(
    prisma: PrismaClient,
    userProfileId: string,
    postId: string) {

    // Debug
    const fnName = `${this.clName}.deletePost()`

    // Load the post to verify ownership
    const post = await
      prisma.post.findUnique({
        where: {
          id: postId
        }
      })

    if (post == null) {
      return {
        status: false,
        message: `Post not found`
      }
    }

    const profile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    if (profile == null || post.authorProfileId !== profile.id) {
      return {
        status: false,
        message: `You can only delete your own posts`
      }
    }

    // Delete
    await
      prisma.post.delete({
        where: {
          id: post.id
        }
      })

    // Return
    return {
      status: true,
      message: `Post deleted`
    }
  }
}
