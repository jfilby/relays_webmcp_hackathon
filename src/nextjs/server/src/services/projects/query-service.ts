import { PrismaClient } from '@/generated/prisma/client'
import type { Instance, Project } from '@/generated/prisma/client'
import type { Prisma } from '@/generated/prisma/client'
import { ProjectModel } from '@/models/projects/project-model'
import { ProjectMemberModel } from '@/models/projects/project-member-model'

// Models
const projectModel = new ProjectModel()
const projectMemberModel = new ProjectMemberModel()

// Class
export class ProjectsQueryService {

  // Consts
  clName = 'ProjectsQueryService'

  // Code
  // Get a project by id. Private projects are only visible to their owner.
  async getProjectById(
    prisma: PrismaClient,
    id: string,
    viewerUserProfileId: string | undefined) {

    // Debug
    const fnName = `${this.clName}.getProjectById()`

    // Query
    const project = await
      projectModel.getById(
        prisma,
        id)

    // Validate
    if (project == null) {
      return {
        status: false,
        message: `Project not found`
      }
    }

    const instance = await
      prisma.instance.findUnique({
        where: {
          id: project.instanceId
        }
      })

    if (instance == null) {
      return {
        status: false,
        message: `Project not found`
      }
    }

    // Is the viewer an owner?
    const isOwner = await
      this.isOwner(
        prisma,
        project.id,
        viewerUserProfileId)

    // Public projects are visible to everyone; private ones to their owners
    if (instance.publicAccess == null && isOwner === false) {
      return {
        status: false,
        message: `Project not found`
      }
    }

    // Return
    return {
      status: true,
      project: this.toGraphQL(project, instance, isOwner)
    }
  }

  // Search public projects. An empty search returns all public projects;
  // a search term matches the project name, tagline or description; an
  // isPromoted filter limits results to showcased projects.
  async searchProjects(
    prisma: PrismaClient,
    search: string | undefined,
    isPromoted: boolean | undefined) {

    // Debug
    const fnName = `${this.clName}.searchProjects()`

    // Build the query
    const where: Prisma.ProjectWhereInput = {
      status: 'A',
      instance: {
        publicAccess: { not: null }
      }
    }

    if (isPromoted === true) {
      where.isPromoted = true
    }

    if (search != null && search.trim() !== '') {
      const term = search.trim()
      where.OR = [
        { tagline: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { instance: { name: { contains: term, mode: 'insensitive' } } }
      ]
    }

    // Query
    const projects = await
      prisma.project.findMany({
        where: where,
        include: {
          instance: true
        },
        orderBy: {
          instance: {
            name: 'asc'
          }
        }
      })

    // Return
    return {
      status: true,
      projects: projects.map(project =>
        this.toGraphQL(project, project.instance, false))
    }
  }

  // Get the projects a signed-in user owns (via their profile membership)
  async getProjectsByUserProfileId(
    prisma: PrismaClient,
    userProfileId: string) {

    // Debug
    const fnName = `${this.clName}.getProjectsByUserProfileId()`

    // Query
    const profile = await
      prisma.profile.findUnique({
        where: {
          userProfileId: userProfileId
        }
      })

    // No profile, no projects
    if (profile == null) {
      return {
        status: true,
        projects: []
      }
    }

    // Fetch the memberships
    const memberships = await
      prisma.projectMember.findMany({
        where: {
          profileId: profile.id,
          role: 'O',
          status: 'A'
        },
        include: {
          project: {
            include: {
              instance: true
            }
          }
        }
      })

    // Return
    return {
      status: true,
      projects: memberships.map(membership =>
        this.toGraphQL(membership.project, membership.project.instance, true))
    }
  }

  // Is the given user profile an active owner of the project?
  async isOwner(
    prisma: PrismaClient,
    projectId: string,
    userProfileId: string | undefined): Promise<boolean> {

    // Debug
    const fnName = `${this.clName}.isOwner()`

    // No signed-in user, no ownership
    if (userProfileId == null || userProfileId === '') {
      return false
    }

    // The owning profile (memberships link a profile, not a user profile)
    const profile = await
      prisma.profile.findUnique({
        where: {
          userProfileId: userProfileId
        }
      })

    if (profile == null) {
      return false
    }

    const membership = await
      projectMemberModel.getByProjectAndProfile(
        prisma,
        projectId,
        profile.id)

    // Return
    return membership != null &&
      membership.role === 'O' &&
      membership.status === 'A'
  }

  // Convert a Prisma record into the GraphQL shape (dates as ISO strings)
  toGraphQL(project: Project, instance: Instance, isOwner: boolean) {

    return {
      id: project.id,
      instanceId: project.instanceId,
      name: instance.name,
      isOwner: isOwner,
      tagline: project.tagline,
      description: project.description,
      website: project.website,
      image: project.image,
      isPromoted: project.isPromoted,
      isPublic: instance.publicAccess != null,
      status: project.status,
      created: project.created.toISOString(),
      updated: project.updated != null ? project.updated.toISOString() : undefined
    }
  }
}
