import { Prisma, PrismaClient } from '@/generated/prisma/client'
import type { Instance, Project, ProjectUrl } from '@/generated/prisma/client'

// Serene Core imports
import { InstanceModel } from 'serene-core-server'

// Models
import { ProjectModel } from '@/models/projects/project-model'
import { ProjectMemberModel } from '@/models/projects/project-member-model'
import { ProfileModel } from '@/models/profiles/profile-model'
import { ProjectInterestModel } from '@/models/projects/project-interest-model'
import { SearchService } from '@/services/search/search-service'


// Model instances
const instanceModel = new InstanceModel()
const profileModel = new ProfileModel()
const projectModel = new ProjectModel()
const projectMemberModel = new ProjectMemberModel()
const projectInterestModel = new ProjectInterestModel()
const searchService = new SearchService()

// Class
export class ProjectsQueryService {

  // Consts
  clName = 'ProjectsQueryService'

  // Project URL kinds: W (website), R (repository), D (docs), E (demo),
  // S (social), X (other)
  websiteKind = 'W'

  // Code
  // Get a project by public id. Private projects are only visible to their
  // owner.
  async getProjectByPublicId(
    prisma: PrismaClient,
    publicId: string,
    viewerUserProfileId: string | undefined) {

    // Debug
    const fnName = `${this.clName}.getProjectByPublicId()`

    // Query
    const project = await
      projectModel.getByPublicId(
        prisma,
        publicId,
        true)  // withIncludes (ofProjectUrls)

    // Validate
    if (project == null) {
      return {
        status: false,
        message: `Project not found`
      }
    }

    const instance = await
      instanceModel.getById(
        prisma,
        project.instanceId)

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

  // Search public projects. An empty search browses all public projects
  // without ranking; otherwise the results come from hybrid search
  // (pgvector semantic + full-text + trigram, combined with technique
  // weights). An isPromoted filter limits results to showcased projects.
  //
  // The tsvector/trigram expressions below must stay in sync with the
  // matching indexes in prisma/search-setup.sql.
  async searchProjects(
    prisma: PrismaClient,
    search: string | undefined,
    isPromoted: boolean | undefined) {

    // Debug
    const fnName = `${this.clName}.searchProjects()`

    // Browse all when there is nothing to rank
    if (search == null || search.trim() === '') {
      const projects = await
        projectModel.filter(
          prisma,
          'A',  // status
          isPromoted,
          undefined,  // organizationId
          true)  // isPublic (instance public access set)

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
            countsByProjectId[project.id],
            undefined))
      }
    }

    // Hybrid search (the project name lives on the project's instance, so it
    // is searched as a second full-text source)
    const hits = await
      searchService.hybridSearch(
        prisma,
        search,
        {
          fromSql: `public."project" p JOIN public."instance" i ON i.id = p.instance_id`,
          idColumn: `p.id`,
          tsvectorExpressions: [
            SearchService.toTsvectorSql([
              `p.tagline`,
              `p.description`,
              `array_to_string(p.tech_stack, ' ')`
            ]),
            SearchService.toTsvectorSql([
              `i.name`
            ])
          ],
          trigramFieldsSql: [
            `p.tagline`,
            `p.description`,
            `array_to_string(p.tech_stack, ' ')`,
            `i.name`
          ],
          embeddingColumn: `p.embedding`,
          filterSql: Prisma.sql`p.status = 'A'${
            isPromoted != null ? Prisma.sql` AND p.is_promoted = ${isPromoted}` : Prisma.empty
          } AND i.public_access IS NOT NULL`
        })

    // Load the records and restore the ranking order
    const projectsById = new Map(
      (await projectModel.filterByIds(
        prisma,
        hits.map(hit => hit.id),
        true))
        .map(project => [project.id, project]))

    // Batch the interest counts for the result set
    const countsByProjectId = await
      this.getInterestCounts(
        prisma,
        hits.map(hit => hit.id))

    // Return
    return {
      status: true,
      projects: hits
        .map(hit => projectsById.get(hit.id))
        .filter(project => project != null)
        .map(project =>
          this.toGraphQL(
            project!,
            project!.instance,
            false,
            project!.ofProjectUrls,
            countsByProjectId[project!.id],
            undefined))
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
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    // No profile, no projects
    if (profile == null) {
      return {
        status: true,
        projects: []
      }
    }

    // Fetch the memberships
    const memberships = await
      projectMemberModel.filter(
        prisma,
        undefined,  // projectId
        profile.id,
        'A',  // status
        'O',  // role
        true)  // withProjectIncludes

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
          countsByProjectId[membership.project.id],
          undefined))
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
    const grouped = await
      projectInterestModel.groupByCountByProjectIds(
        prisma,
        projectIds)

    // Return
    return Object.fromEntries(
      grouped.map(group => [group.projectId, group._count.projectId]))
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
    const interestCount = await
      projectInterestModel.countByProjectId(
        prisma,
        projectId)

    // Has the viewer registered interest? (Resolve their profile first)
    let viewerIsInterested = false

    if (viewerUserProfileId != null && viewerUserProfileId !== '') {
      const viewerProfile = await
        profileModel.getByUserProfileId(
          prisma,
          viewerUserProfileId)

      if (viewerProfile != null) {
        viewerIsInterested = await
          projectInterestModel.getByProfileIdAndProjectId(
            prisma,
            viewerProfile.id,
            projectId) != null
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
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

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
      publicId: project.publicId,
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
