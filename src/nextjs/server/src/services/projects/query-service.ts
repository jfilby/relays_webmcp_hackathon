import { PrismaClient } from '@/generated/prisma/client'
import type { Instance, Project, ProjectUrl } from '@/generated/prisma/client'
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

  // Project URL kinds: W (website), R (repository), D (docs), E (demo),
  // S (social), X (other)
  websiteKind = 'W'

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
      prisma.project.findUnique({
        where: {
          id: id
        },
        include: {
          ofProjectUrls: true
        }
      })

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

    // Interest info for the viewer
    const interestInfo = await
      this.getInterestInfo(
        prisma,
        project.id,
        viewerUserProfileId)
    // Return
    return {
      status: true,
      project: this.toGraphQL(
        project,
        instance,
        isOwner,
        project.ofProjectUrls,
        interestInfo.interestCount,
        interestInfo.viewerIsInterested)
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
        { instance: { name: { contains: term, mode: 'insensitive' } } },
        { techStack: { has: term } }
      ]
    }

    // Query
    const projects = await
      prisma.project.findMany({
        where: where,
        include: {
          instance: true,
          ofProjectUrls: true
        },
        orderBy: {
          instance: {
            name: 'asc'
          }
        }
      })

    // Batch the interest counts for the result set
    const countsByProjectId = await
      this.getInterestCounts(
        prisma,
        projects.map(project => project.id))

    // Return
    return {
      status: true,
      projects: projects.map(project =>
        this.toGraphQL(
          project,
          project.instance,
          false,
          project.ofProjectUrls,
          countsByProjectId[project.id]))
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
              instance: true,
              ofProjectUrls: true
            }
          }
        }
      })

    // Batch the interest counts for the result set
    const countsByProjectId = await
      this.getInterestCounts(
        prisma,
        memberships.map(membership => membership.project.id))

    // Return
    return {
      status: true,
      projects: memberships.map(membership =>
        this.toGraphQL(
          membership.project,
          membership.project.instance,
          true,
          membership.project.ofProjectUrls,
          countsByProjectId[membership.project.id]))
    }
  }

  // Interest counts for a set of projects, keyed by project id. An empty
  // object means no interests anywhere.
  async getInterestCounts(
    prisma: PrismaClient,
    projectIds: string[]): Promise<Record<string, number>> {

    // Debug
    const fnName = `${this.clName}.getInterestCounts()`

    // Nothing to count
    if (projectIds.length === 0) {
      return {}
    }

    // Group the interest rows by project
    try {
      const grouped = await
        prisma.projectInterest.groupBy({
          by: ['projectId'],
          where: {
            projectId: { in: projectIds }
          },
          _count: {
            projectId: true
          }
        })

      // Return
      return Object.fromEntries(
        grouped.map(group => [group.projectId, group._count._all]))
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  // Interest details for one project: the total count plus whether the given
  // viewer has registered interest.
  async getInterestInfo(
    prisma: PrismaClient,
    projectId: string,
    viewerUserProfileId: string | undefined) {

    // Debug
    const fnName = `${this.clName}.getInterestInfo()`

    // The total count
    let interestCount = 0

    try {
      interestCount = await
        prisma.projectInterest.count({
          where: {
            projectId: projectId
          }
        })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }

    // Has the viewer registered interest? (Resolve their profile first)
    let viewerIsInterested = false

    if (viewerUserProfileId != null && viewerUserProfileId !== '') {
      try {
        const viewerProfile = await
          prisma.profile.findUnique({
            where: {
              userProfileId: viewerUserProfileId
            }
          })

        if (viewerProfile != null) {
          viewerIsInterested = await
            prisma.projectInterest.findUnique({
              where: {
                profileId_projectId: {
                  profileId: viewerProfile.id,
                  projectId: projectId
                }
              }
            }) != null
        }
      } catch (error) {
        console.error(`${fnName}: error: ${error}`)
        throw 'Prisma error'
      }
    }

    // Return
    return {
      interestCount: interestCount,
      viewerIsInterested: viewerIsInterested
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

  // Convert a Prisma record into the GraphQL shape (dates as ISO strings).
  // The website field is derived from the project's typed URLs (kind 'W').
  toGraphQL(
    project: Project,
    instance: Instance,
    isOwner: boolean,
    urls: ProjectUrl[],
    interestCount: number | undefined,
    viewerIsInterested: boolean | undefined) {

    // The website is the first website-kind URL, if any
    const websiteUrl = urls.find(url => url.kind === 'W')

    return {
      id: project.id,
      instanceId: project.instanceId,
      name: instance.name,
      isOwner: isOwner,
      tagline: project.tagline,
      description: project.description,
      website: websiteUrl?.url,
      image: project.image,
      techStack: project.techStack,
      stage: project.stage,
      isOpenToCollaborators: project.isOpenToCollaborators,
      isPromoted: project.isPromoted,
      isPublic: instance.publicAccess != null,
      urls: urls.map(url => ({
        id: url.id,
        kind: url.kind,
        url: url.url,
        label: url.label
      })),
      interestCount: interestCount,
      viewerIsInterested: viewerIsInterested,
      status: project.status,
      created: project.created.toISOString(),
      updated: project.updated != null ? project.updated.toISOString() : undefined
    }
  }
}
