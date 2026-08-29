import { PrismaClient } from '@/generated/prisma/client'
import { BaseDataTypes } from '@/types/base-data-types'

// Serene Core imports
import { UserProfileModel, InstanceModel } from 'serene-core-server'

// Models
import { ProjectModel } from '@/models/projects/project-model'
import { PublicIdService } from '@/services/utils/public-id-service'
import { ProjectMemberModel } from '@/models/projects/project-member-model'
import { ProjectUrlModel } from '@/models/projects/project-url-model'
import { ProfileModel } from '@/models/profiles/profile-model'
import { ProjectInterestModel } from '@/models/projects/project-interest-model'

// Services
import { ProjectsQueryService } from './query-service'
import { EmbeddingService } from '@/services/search/embedding-service'

// Models
const userProfileModel = new UserProfileModel()
const instanceModel = new InstanceModel()
const profileModel = new ProfileModel()
const projectModel = new ProjectModel()
const projectMemberModel = new ProjectMemberModel()
const projectUrlModel = new ProjectUrlModel()
const projectInterestModel = new ProjectInterestModel()

// Services
const projectsQueryService = new ProjectsQueryService()
const embeddingService = new EmbeddingService()

// Class
export class ProjectsMutateService {

  // Consts
  clName = 'ProjectsMutateService'

  // An instance holding a project is type 'P'
  projectInstanceType = 'P'

  // Project members: O (owner), C (collaborator)
  ownerRole = 'O'

  // Public projects are readable by anyone (public access 'R')
  publicAccess = 'R'

  // Project URLs: W (website)
  websiteKind = 'W'

  // Project stages: I (idea), A (alpha), B (beta), G (generally available)
  validStages = ['I', 'A', 'B', 'G']

  // Code
  async create(
    prisma: PrismaClient,
    userProfileId: string,
    name: string,
    tagline: string | undefined,
    description: string | undefined,
    website: string | undefined,
    image: string | undefined,
    isPromoted: boolean | undefined,
    isPublic: boolean | undefined,
    techStack: string[] = [],
    stage: string | undefined = undefined,
    isOpenToCollaborators: boolean | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Validate the name
    if (name == null || name.trim() === '') {
      return {
        status: false,
        message: `Name is required`
      }
    }
    name = name.trim()

    // Validate the stage
    if (stage != null &&
        this.validStages.includes(stage) === false) {
      return {
        status: false,
        message: `Invalid project stage`
      }
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

    // The owning profile (memberships link a profile, not a user profile)
    const profile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    if (profile == null) {
      return {
        status: false,
        message: `You need a profile to create a project`
      }
    }

    // Create the project instance (defaults are applied in code)
    const instance = await
      instanceModel.create(
        prisma,
        null,  // publicId
        null,  // parentId
        userProfileId,
        this.projectInstanceType,
        null,  // projectType
        false,  // isDemo
        false,  // isDefault
        BaseDataTypes.activeStatus,
        isPublic === true ? this.publicAccess : null,
        this.generateKey(name),
        name)

    // Create the project
    const project = await
      projectModel.create(
        prisma,
        instance.id,
        PublicIdService.generate(name),
        isPromoted === true,
        BaseDataTypes.activeStatus,
        undefined,  // organizationId
        tagline != null && tagline.trim() !== '' ? tagline.trim() : undefined,
        description != null && description.trim() !== '' ? description.trim() : undefined,
        image != null && image.trim() !== '' ? image.trim() : undefined,
        techStack.filter(item => item.trim() !== '').map(item => item.trim()),
        stage != null && stage.trim() !== '' ? stage.trim() : undefined,
        isOpenToCollaborators === true)

    // Save the website URL as a typed project URL
    if (website != null && website.trim() !== '') {
      await projectUrlModel.create(
        prisma,
        project.id,
        this.websiteKind,
        website.trim())
    }
    // Make the creator an owner member
    await projectMemberModel.create(
      prisma,
      project.id,
      profile.id,
      this.ownerRole,
      BaseDataTypes.activeStatus)

    // Sync the search embedding (best effort: on failure the embedding is
    // cleared and search degrades to the other techniques)
    await embeddingService.syncProjectEmbedding(prisma, project, name)

    // Return
    return {
      status: true,
      message: `Your project was created`,
      project: projectsQueryService.toGraphQL(project, instance, true, [], 0, false)
    }
  }

  async update(
    prisma: PrismaClient,
    id: string,
    userProfileId: string,
    name: string | undefined,
    tagline: string | undefined,
    description: string | undefined,
    website: string | undefined,
    image: string | undefined,
    isPromoted: boolean | undefined,
    isPublic: boolean | undefined,
    techStack: string[] | undefined = undefined,
    stage: string | undefined = undefined,
    isOpenToCollaborators: boolean | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Get the existing project to verify ownership
    const existing = await
      projectModel.getById(
        prisma,
        id)

    if (existing == null) {
      return {
        status: false,
        message: `Project not found`
      }
    }

    const isOwner = await
      projectsQueryService.isOwner(
        prisma,
        id,
        userProfileId)

    if (isOwner === false) {
      return {
        status: false,
        message: `You can only edit your own projects`
      }
    }

    // Load the instance
    const existingInstance = await
      instanceModel.getById(
        prisma,
        existing.instanceId)

    if (existingInstance == null) {
      return {
        status: false,
        message: `Project not found`
      }
    }

    // Validate the name, if being changed
    if (name != null && name.trim() === '') {
      return {
        status: false,
        message: `Name is required`
      }
    }

    if (name != null) {
      name = name.trim()
    }

    // Validate the stage, if being changed
    if (stage != null &&
        stage.trim() !== '' &&
        this.validStages.includes(stage) === false) {
      return {
        status: false,
        message: `Invalid project stage`
      }
    }

    // At least one field must be provided
    if (name == null &&
        tagline == null &&
        description == null &&
        website == null &&
        image == null &&
        isPromoted == null &&
        isPublic == null &&
        techStack == null &&
        stage == null &&
        isOpenToCollaborators == null) {
      return {
        status: false,
        message: `No changes to save`
      }
    }

    // Trim the optional text fields
    tagline = tagline != null && tagline.trim() !== '' ? tagline.trim() : undefined
    description = description != null && description.trim() !== '' ? description.trim() : undefined
    website = website != null && website.trim() !== '' ? website.trim() : undefined
    image = image != null && image.trim() !== '' ? image.trim() : undefined

    // Update the project
    const project = await
      projectModel.update(
        prisma,
        id,
        undefined,  // organizationId
        tagline,
        description,
        image,
        techStack != null ?
          techStack.filter(item => item.trim() !== '').map(item => item.trim()) :
          undefined,
        stage != null && stage.trim() !== '' ? stage.trim() : undefined,
        isOpenToCollaborators ?? undefined,
        isPromoted,
        undefined)  // status

    // Sync the website URL into a project URL record
    if (website != null) {
      const urls = await
        projectUrlModel.filter(
          prisma,
          id,
          this.websiteKind)

      if (urls.length > 0) {
        await
          projectUrlModel.update(
            prisma,
            urls[0].id,
            this.websiteKind,
            website,
            undefined)
      } else {
        await
          projectUrlModel.create(
            prisma,
            id,
            this.websiteKind,
            website)
      }
    }
    // Update the instance (name and public access)
    const instance = await
      instanceModel.update(
        prisma,
        existingInstance.id,
        undefined,  // publicId
        undefined,  // parentId
        undefined,  // userProfileId
        undefined,  // instanceType
        undefined,  // projectType
        undefined,  // isDemo
        undefined,  // isDefault
        undefined,  // status
        isPublic != null ?
          (isPublic === true ? this.publicAccess : null) :
          undefined,
        undefined,  // key
        name ?? undefined)

    // Sync the search embedding (best effort: on failure the embedding is
    // cleared and search degrades to the other techniques)
    await embeddingService.syncProjectEmbedding(
      prisma,
      project,
      name ?? existingInstance.name)

    // Return
    return {
      status: true,
      message: `Your project was updated`,
      project: projectsQueryService.toGraphQL(project, instance, true, [], 0, false)
    }
  }

  // Toggle the signed-in user's interest in a project ("starring" it).
  // Interest can only be registered on public projects or the viewer's own.
  async toggleProjectInterest(
    prisma: PrismaClient,
    userProfileId: string,
    projectId: string) {

    // Debug
    const fnName = `${this.clName}.toggleProjectInterest()`

    // Load the project and its instance for visibility checks
    const project = await
      projectModel.getById(
        prisma,
        projectId,
        true)  // withIncludes (instance)

    if (project == null) {
      return {
        status: false,
        message: `Project not found`
      }
    }

    const isOwner = await
      projectsQueryService.isOwner(
        prisma,
        projectId,
        userProfileId)

    if (project.instance.publicAccess == null && isOwner === false) {
      return {
        status: false,
        message: `Project not found`
      }
    }

    // Resolve the profile expressing interest
    const profile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    if (profile == null) {
      return {
        status: false,
        message: `You need a profile to follow a project`
      }
    }

    // Toggle
    const existingInterest = await
      projectInterestModel.getByProfileIdAndProjectId(
        prisma,
        profile.id,
        projectId)

    if (existingInterest != null) {
      await
        projectInterestModel.deleteById(
          prisma,
          existingInterest.id)
    } else {
      await
        projectInterestModel.create(
          prisma,
          profile.id,
          projectId)
    }

    // Return
    return {
      status: true,
      message: existingInterest != null ? `Interest removed` : `Interest added`,
      interested: existingInterest == null
    }
  }

  async deleteById(
    prisma: PrismaClient,
    id: string,
    userProfileId: string) {

    // Debug
    const fnName = `${this.clName}.deleteById()`

    // Get the existing project to verify ownership
    const existing = await
      projectModel.getById(
        prisma,
        id)

    if (existing == null) {
      return {
        status: false,
        message: `Project not found`
      }
    }

    const isOwner = await
      projectsQueryService.isOwner(
        prisma,
        id,
        userProfileId)

    if (isOwner === false) {
      return {
        status: false,
        message: `You can only delete your own projects`
      }
    }

    // Delete the memberships, the project, then its instance. Anything
    // referencing the project or instance (e.g. collaboration plans) will
    // fail the delete, which is reported back.
    try {
      await projectMemberModel.deleteByProjectId(
        prisma,
        id)

      await projectModel.deleteById(
        prisma,
        id)

      await instanceModel.deleteById(
        prisma,
        existing.instanceId)
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      return {
        status: false,
        message: `Couldn't delete the project`
      }
    }

    // Return
    return {
      status: true,
      message: `Your project was deleted`
    }
  }

  // Generate a unique-ish, readable instance key from the project name
  generateKey(name: string): string {

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 24)

    const suffix = Math.random().toString(36).substring(2, 8)

    return slug !== '' ? `${slug}-${suffix}` : `project-${suffix}`
  }
}
