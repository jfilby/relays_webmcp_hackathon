import { PrismaClient } from '@/generated/prisma/client'
import type {
  Project,
  ProjectUrl,
  Instance,
  DiscussPost,
  DiscussComment
} from '@/generated/prisma/client'

// Models
import { ProjectModel } from '@/models/projects/project-model'
import { ProjectMemberModel } from '@/models/projects/project-member-model'
import { ProfileModel } from '@/models/profiles/profile-model'
import { ConnectionModel } from '@/models/profiles/connection-model'
import { DiscussPostModel } from '@/models/discussion/discuss-post-model'
import { DiscussCommentModel } from '@/models/discussion/discuss-comment-model'

// Services
import { ProjectsQueryService } from '@/services/projects/query-service'
import { DiscussionQueryService } from '@/services/discussion/query-service'


// Model instances
const projectModel = new ProjectModel()
const projectMemberModel = new ProjectMemberModel()
const profileModel = new ProfileModel()
const connectionModel = new ConnectionModel()
const discussPostModel = new DiscussPostModel()
const discussCommentModel = new DiscussCommentModel()

// Service instances
const projectsQueryService = new ProjectsQueryService()
const discussionQueryService = new DiscussionQueryService()


// A project record with its instance and urls included (the project name
// lives on the instance).
type ProjectWithIncludes = Project & {
  instance: Instance
  ofProjectUrls: ProjectUrl[]
}
// Class
export class ActivityQueryService {

  // Consts
  clName = 'ActivityQueryService'

  // Code
  // Latest activity for the landing page. Signed-out viewers get the newest
  // public content; signed-in viewers get content from their network and
  // their own records first, topped up with the newest public content.
  async getLatest(
    prisma: PrismaClient,
    userProfileId: string | undefined,
    take: number) {

    // Debug
    const fnName = `${this.clName}.getLatest()`

    // Resolve the signed-in user's profile (the network filter key)
    const profile = userProfileId != null && userProfileId !== '' ?
      await profileModel.getByUserProfileId(prisma, userProfileId) :
      null

    const networkProfileIds = profile != null ?
      await this.getNetworkProfileIds(prisma, profile.id) :
      []

    // Projects, posts, and comments. Personalized queries produce raw Prisma
    // records; both paths map them into the GraphQL shapes via the shared
    // project/discussion mappers.
    const projects = profile == null ?
      (await projectsQueryService.getLatestProjects(prisma, take)).projects :
      await this.toGraphQLProjects(
        prisma,
        await this.getProjectsForProfile(
          prisma,
          profile.id,
          networkProfileIds,
          take))

    const posts = profile == null ?
      (await discussionQueryService.getLatestPosts(prisma, take)).posts :
      await discussionQueryService.toPostItems(
        prisma,
        await this.getPostsForProfile(
          prisma,
          profile.id,
          networkProfileIds,
          take))

    const comments = profile == null ?
      (await discussionQueryService.getLatestComments(prisma, take)).comments :
      await discussionQueryService.toCommentItems(
        prisma,
        await this.getCommentsForProfile(
          prisma,
          profile.id,
          networkProfileIds,
          take))

    // Return
    return {
      status: true,
      projects: projects,
      posts: posts,
      comments: comments
    }
  }

  // The profile ids in the signed-in user's network (active connections in
  // either direction).
  private async getNetworkProfileIds(
    prisma: PrismaClient,
    profileId: string): Promise<string[]> {

    // Fetch active connections in either direction
    const [outgoingConnections, incomingConnections] = await Promise.all([
      connectionModel.filter(prisma, profileId, undefined, 'A'),
      connectionModel.filter(prisma, undefined, profileId, 'A')
    ])

    // The peers are the other end of each connection
    const peerIds = new Set<string>()

    for (const connection of [...outgoingConnections, ...incomingConnections]) {
      peerIds.add(
        connection.fromProfileId === profileId ?
          connection.toProfileId :
          connection.fromProfileId)
    }

    // Return
    return [...peerIds]
  }

  // Merge personalized records with the newest fill records, newest first,
  // capped at take.
  private mergeLatest<T extends { id: string; created: Date }>(
    personalized: T[],
    fill: T[],
    take: number): T[] {

    const seenIds = new Set(personalized.map(item => item.id))

    return [
      ...personalized,
      ...fill.filter(item => !seenIds.has(item.id))
    ].slice(0, take)
  }

  // Projects from the viewer's memberships and their network's public
  // projects first (newest first), topped up with the newest public
  // projects.
  private async getProjectsForProfile(
    prisma: PrismaClient,
    profileId: string,
    networkProfileIds: string[],
    take: number): Promise<ProjectWithIncludes[]> {

    // The active memberships of the viewer and their network
    const memberProfileIds = [profileId, ...networkProfileIds]

    const memberships = await
      projectMemberModel.filterByProfileIds(
        prisma,
        memberProfileIds,
        'A')

    const personalizedIds = new Set(
      memberships.map(membership => membership.projectId))

    // Load the personalized projects (public instances only, matching the
    // visibility of the signed-out feed)
    const personalized: ProjectWithIncludes[] = personalizedIds.size > 0 ?
      ((await projectModel.filterByIds(
        prisma,
        [...personalizedIds],
        true)) as ProjectWithIncludes[])  // withIncludes (instance, ofProjectUrls)
        .filter(project =>
          project.status === 'A' &&
          project.instance.publicAccess != null)
        .sort((a, b) => b.created.getTime() - a.created.getTime()) :
      []

    // Top up with the newest public projects
    const fill = await
      projectModel.filterLatest(
        prisma,
        'A',  // status
        true)  // isPublic (instance public access set)

    // Return
    return this.mergeLatest(personalized, fill, take)
  }

  // Map raw project records into the GraphQL shape, with batched interest
  // counts and owner info (the project name lives on the project's instance).
  private async toGraphQLProjects(
    prisma: PrismaClient,
    projects: ProjectWithIncludes[]) {

    const countsByProjectId = await
      projectsQueryService.getInterestCounts(
        prisma,
        projects.map(project => project.id))

    const ownerInfosByProjectId = await
      projectsQueryService.getOwnerInfosByProjectIds(
        prisma,
        projects.map(project => project.id))

    // Return
    return projects.map(project =>
      projectsQueryService.toGraphQL(
        project,
        project.instance,
        false,  // isOwner
        project.ofProjectUrls,
        countsByProjectId[project.id],
        undefined,  // viewerIsInterested
        ownerInfosByProjectId[project.id] ??
          projectsQueryService.ownerInfoNone))
  }

  // Posts by the network and the viewer first (newest first), topped up
  // with the newest posts.
  private async getPostsForProfile(
    prisma: PrismaClient,
    profileId: string,
    networkProfileIds: string[],
    take: number): Promise<DiscussPost[]> {

    // Personalized posts
    const personalized = await
      discussPostModel.filterByAuthorProfileIds(
        prisma,
        [profileId, ...networkProfileIds],
        'A')

    // Top up with the newest posts
    const fill = await
      discussPostModel.filterLatest(
        prisma,
        'A',  // status
        take)

    // Return
    return this.mergeLatest(personalized, fill, take)
  }

  // Comments by the network and the viewer first (newest first), topped up
  // with the newest comments.
  private async getCommentsForProfile(
    prisma: PrismaClient,
    profileId: string,
    networkProfileIds: string[],
    take: number): Promise<DiscussComment[]> {

    // Personalized comments
    const personalized = await
      discussCommentModel.filterByAuthorProfileIds(
        prisma,
        [profileId, ...networkProfileIds],
        'A')

    // Top up with the newest comments
    const fill = await
      discussCommentModel.filterLatest(
        prisma,
        'A',  // status
        take)

    // Return
    return this.mergeLatest(personalized, fill, take)
  }
}
