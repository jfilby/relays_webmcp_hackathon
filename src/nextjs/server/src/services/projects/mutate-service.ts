import { PrismaClient } from '@/generated/prisma/client'
import { BaseDataTypes } from '@/types/base-data-types'
import { ProjectModel } from '@/models/projects/project-model'
import { ProjectMemberModel } from '@/models/projects/project-member-model'
import { ProjectUrlModel } from '@/models/projects/project-url-model'
import { ProjectsQueryService } from './query-service'

// Models
const projectModel = new ProjectModel()
const projectMemberModel = new ProjectMemberModel()
const projectUrlModel = new ProjectUrlModel()

// Services
const projectsQueryService = new ProjectsQueryService()

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
    isPublic: boolean | undefined) {

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

    // The owning profile (memberships link a profile, not a user profile)
    const profile = await
      prisma.profile.findUnique({
        where: {
          userProfileId: userProfileId
        }
      })

    if (profile == null) {
      return {
        status: false,
        message: `You need a profile to create a project`
      }
    }

    // Create the project instance (defaults are applied in code)
    const instance = await
      prisma.instance.create({
        data: {
          userProfileId: userProfileId,
          status: BaseDataTypes.activeStatus,
          key: this.generateKey(name),
          name: name,
          instanceType: this.projectInstanceType,
          isDefault: false,
          isDemo: false,
          publicAccess: isPublic === true ? this.publicAccess : null
        }
      })

    // Create the project
    const project = await
      projectModel.create(
        prisma,
        instance.id,
        isPromoted === true,
        BaseDataTypes.activeStatus,
        undefined,  // organizationId
        tagline != null && tagline.trim() !== '' ? tagline.trim() : undefined,
        description != null && description.trim() !== '' ? description.trim() : undefined,
        image != null && image.trim() !== '' ? image.trim() : undefined)

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

    // Return
    return {
      status: true,
      message: `Your project was created`,
      project: projectsQueryService.toGraphQL(project, instance, true)
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
    isPublic: boolean | undefined) {

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
      prisma.instance.findUnique({
        where: {
          id: existing.instanceId
        }
      })

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

    // At least one field must be provided
    if (name == null &&
        tagline == null &&
        description == null &&
        website == null &&
        image == null &&
        isPromoted == null &&
        isPublic == null) {
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
        undefined,  // techStack
        undefined,  // stage
        undefined,  // isOpenToCollaborators
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
      prisma.instance.update({
        where: {
          id: existingInstance.id
        },
        data: {
          name: name ?? existingInstance.name,
          publicAccess: isPublic != null ?
            (isPublic === true ? this.publicAccess : null) :
            existingInstance.publicAccess
        }
      })

    // Return
    return {
      status: true,
      message: `Your project was updated`,
      project: projectsQueryService.toGraphQL(project, instance, true)
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
      await prisma.projectMember.deleteMany({
        where: {
          projectId: id
        }
      })

      await projectModel.deleteById(
        prisma,
        id)

      await prisma.instance.delete({
        where: {
          id: existing.instanceId
        }
      })
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