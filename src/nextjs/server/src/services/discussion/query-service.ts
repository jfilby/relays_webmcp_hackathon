import { Prisma, PrismaClient } from '@/generated/prisma/client'
import type { DiscussPost, DiscussComment } from '@/generated/prisma/client'
import { SearchService } from '@/services/search/search-service'
import { DiscussPostModel } from '@/models/discussion/discuss-post-model'
import { DiscussCommentModel } from '@/models/discussion/discuss-comment-model'
import { ProfileModel } from '@/models/profiles/profile-model'
import { ProjectModel } from '@/models/projects/project-model'
import { BaseDataTypes } from '@/types/base-data-types'

// Models
const discussPostModel = new DiscussPostModel()
const discussCommentModel = new DiscussCommentModel()
const profileModel = new ProfileModel()
const projectModel = new ProjectModel()
const searchService = new SearchService()

// Class
export class DiscussionQueryService {

  // Consts
  clName = 'DiscussionQueryService'

  // Code
  // Get active discussion posts, newest first, with each author's display
  // name and comment count. Optionally filtered by author profile or by the
  // project the posts are attached to.
  async getDiscussPosts(
    prisma: PrismaClient,
    profileId: string | undefined = undefined,
    projectId: string | undefined = undefined) {

    // Query
    const posts = await
      discussPostModel.filter(
        prisma,
        profileId,
        projectId,
        BaseDataTypes.activeStatus)
    // Return
    return {
      status: true,
      posts: await this.toPostItems(prisma, posts)
    }
  }

  // Enrich posts with comment counts and each author's display name,
  // preserving the given order.
  async toPostItems(
    prisma: PrismaClient,
    posts: DiscussPost[]) {

    // No posts, no authors to fetch
    if (posts.length === 0) {
      return []
    }

    // Load comment counts for every post in one query
    const commentCounts = await
      discussCommentModel.countByPostIds(
        prisma,
        posts.map(post => post.id),
        BaseDataTypes.activeStatus)

    const commentCountMap = new Map<string, number>()

    for (const group of commentCounts) {
      commentCountMap.set(
        group.postId,
        group._count._all)
    }

    // Load each attached project for its public id and name (the project
    // name lives on the project's instance)
    const projectIds =
      [...new Set(posts.map(post => post.projectId).filter(id => id != null))]

    const projectInfoById =
      await this.getProjectInfoByIds(prisma, projectIds)

    // Load each author's profile for the display name, public id, and
    // visibility
    const authorProfileIds =
      [...new Set(posts.map(post => post.authorProfileId))]

    const authors = await
      profileModel.getByIds(
        prisma,
        authorProfileIds)

    const authorsById = new Map(
      authors.map(author => [author.id, author]))

    // Return
    return posts.map(post => {
      const author = authorsById.get(post.authorProfileId)

      const projectInfo = post.projectId != null ?
        projectInfoById.get(post.projectId) :
        undefined

      return {
        id: post.id,
        publicId: post.publicId,
        authorProfileId: post.authorProfileId,
        authorName: author?.displayName ?? null,
        authorProfilePublicId: author?.publicId ?? null,
        authorProfileIsPublic: author?.isPublic ?? null,
        projectId: post.projectId,
        projectPublicId: projectInfo?.publicId ?? null,
        projectName: projectInfo?.name ?? null,
        title: post.title,
        body: post.body,
        commentCount: commentCountMap.get(post.id) ?? 0,
        created: post.created.toISOString()
      }
    })
  }

  // Search active discussion posts, matching against both the posts
  // themselves and their comments; a comment match surfaces its parent post
  // and a post that matches both ways keeps its best score. An empty search
  // browses all active posts without ranking.
  //
  // The tsvector/trigram expressions below must stay in sync with the
  // matching indexes in prisma/search-setup.sql.
  async searchDiscussPosts(
    prisma: PrismaClient,
    search: string | undefined) {

    // Browse all when there is nothing to rank
    if (search == null || search.trim() === '') {
      const posts = await
        discussPostModel.filter(
          prisma,
          undefined,
          undefined,
          BaseDataTypes.activeStatus)

      // Return
      return {
        status: true,
        posts: await this.toPostItems(prisma, posts)
      }
    }

    // Hybrid search: one leg over the posts, one over the comments
    const [postHits, commentHits] = await Promise.all([
      searchService.hybridSearch(
        prisma,
        search,
        {
          fromSql: `public."discuss_post" dp`,
          idColumn: `dp.id`,
          tsvectorExpressions: [
            SearchService.toTsvectorSql([
              `dp.title`,
              `dp.body`
            ])
          ],
          trigramFieldsSql: [
            `dp.title`,
            `dp.body`
          ],
          embeddingColumn: `dp.embedding`,
          filterSql: Prisma.sql`dp.status = 'A'`
        }),
      searchService.hybridSearch(
        prisma,
        search,
        {
          fromSql: `public."discuss_comment" dc`,
          idColumn: `dc.id`,
          tsvectorExpressions: [
            SearchService.toTsvectorSql([
              `dc.body`
            ])
          ],
          trigramFieldsSql: [
            `dc.body`
          ],
          embeddingColumn: `dc.embedding`,
          filterSql: Prisma.sql`dc.status = 'A' AND dc.deleted IS NULL`
        })
    ])
    // Map comment hits onto their parent posts
    const comments = await
      discussCommentModel.filterByIds(
        prisma,
        commentHits.map(hit => hit.id))

    const postIdByCommentId = new Map(
      comments.map(comment => [comment.id, comment.postId]))

    // Best score per post across both legs
    const scoreByPostId = new Map<string, number>()

    for (const hit of postHits) {
      scoreByPostId.set(hit.id, hit.score)
    }

    for (const hit of commentHits) {
      const postId = postIdByCommentId.get(hit.id)

      if (postId != null &&
        (scoreByPostId.get(postId) ?? -Infinity) < hit.score) {
        scoreByPostId.set(postId, hit.score)
      }
    }

    // Load the posts and restore the ranking order
    const postsById = new Map(
      (await discussPostModel.filterByIds(
        prisma,
        [...scoreByPostId.keys()],
        BaseDataTypes.activeStatus))
        .map(post => [post.id, post]))

    const orderedIds = [...scoreByPostId.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)

    const posts = orderedIds
      .map(id => postsById.get(id))
      .filter(post => post != null) as DiscussPost[]

    // Return
    return {
      status: true,
      posts: await this.toPostItems(prisma, posts)
    }
  }


  // Get one discussion post by public id, with its author's display name.
  async getDiscussPostByPublicId(
    prisma: PrismaClient,
    publicId: string) {

    // Debug
    const fnName = `${this.clName}.getDiscussPostByPublicId()`

    // Query
    const post = await
      discussPostModel.getByPublicId(
        prisma,
        publicId)


    if (post == null || post.status !== BaseDataTypes.activeStatus) {
      return {
        status: false,
        message: `Post not found`
      }
    }

    // Load the author's display name
    const author = await
      profileModel.getById(
        prisma,
        post.authorProfileId)

    // Load the comment count
    const commentCount = await
      discussCommentModel.countByPostId(
        prisma,
        post.id,
        BaseDataTypes.activeStatus)

    // Load the attached project, if any, for its public id and name
    const projectInfo = post.projectId != null ?
      (await this.getProjectInfoByIds(prisma, [post.projectId]))
        .get(post.projectId) :
      undefined

    // Return
    return {
      status: true,
      post: {
        id: post.id,
        publicId: post.publicId,
        authorProfileId: post.authorProfileId,
        authorName: author?.displayName ?? null,
        authorProfilePublicId: author?.publicId ?? null,
        authorProfileIsPublic: author?.isPublic ?? null,
        projectId: post.projectId,
        projectPublicId: projectInfo?.publicId ?? null,
        projectName: projectInfo?.name ?? null,
        title: post.title,
        body: post.body,
        commentCount: commentCount,
        created: post.created.toISOString()
      }
    }
  }

  // Get the active comments on a discussion post, oldest first, with each
  // author's display name.
  async getDiscussCommentsByPostId(
    prisma: PrismaClient,
    postId: string) {

    // Debug
    const fnName = `${this.clName}.getDiscussCommentsByPostId()`

    // Query
    const comments = await
      discussCommentModel.filterByPostIdAndStatus(
        prisma,
        postId,
        BaseDataTypes.activeStatus)

    // No comments, no authors to fetch
    if (comments.length === 0) {
      return {
        status: true,
        comments: []
      }
    }
    // Load each author's profile for the display name, public id, and
    // visibility
    const authorProfileIds =
      [...new Set(comments.map(comment => comment.authorProfileId))]

    const authors = await
      profileModel.getByIds(
        prisma,
        authorProfileIds)

    const authorsById = new Map(
      authors.map(author => [author.id, author]))

    // Return
    return {
      status: true,
      comments: comments.map(comment => {
        const author = authorsById.get(comment.authorProfileId)

        return {
          id: comment.id,
          publicId: comment.publicId,
          postId: comment.postId,
          parentCommentId: comment.parentCommentId,
          authorProfileId: comment.authorProfileId,
          authorName: author?.displayName ?? null,
          authorProfilePublicId: author?.publicId ?? null,
          authorProfileIsPublic: author?.isPublic ?? null,
          body: comment.body,
          created: comment.created.toISOString(),
          deleted: comment.deleted?.toISOString() ?? null
        }
      })
    }
  }

  // The newest active posts, for activity feeds.
  async getLatestPosts(
    prisma: PrismaClient,
    take: number) {

    // Query
    const posts = await
      discussPostModel.filterLatest(
        prisma,
        BaseDataTypes.activeStatus,
        take)

    // Return
    return {
      status: true,
      posts: await this.toPostItems(prisma, posts)
    }
  }

  // The newest active comments (soft-deleted excluded), each enriched with
  // its author's display name and the parent post's public id and title.
  async getLatestComments(
    prisma: PrismaClient,
    take: number) {

    // Query
    const comments = await
      discussCommentModel.filterLatest(
        prisma,
        BaseDataTypes.activeStatus,
        take)

    // Return
    return {
      status: true,
      comments: await this.toCommentItems(prisma, comments)
    }
  }

  // Enrich comment records with each author's display name and the parent
  // post's public id and title, preserving the given order.
  async toCommentItems(
    prisma: PrismaClient,
    comments: DiscussComment[]) {

    // No comments, no authors to fetch
    if (comments.length === 0) {
      return []
    }

    // Load the parent posts for the public id and title
    const posts = await
      discussPostModel.filterByIds(
        prisma,
        [...new Set(comments.map(comment => comment.postId))])

    const postsById = new Map(posts.map(post => [post.id, post]))

    // Load each author's profile for the display name, public id, and
    // visibility
    const authorProfileIds =
      [...new Set(comments.map(comment => comment.authorProfileId))]

    const authors = await
      profileModel.getByIds(
        prisma,
        authorProfileIds)

    const authorsById = new Map(
      authors.map(author => [author.id, author]))

    // Return
    return comments.map(comment => {
      const author = authorsById.get(comment.authorProfileId)
      const post = postsById.get(comment.postId)

      return {
        id: comment.id,
        publicId: comment.publicId,
        postId: comment.postId,
        postPublicId: post?.publicId ?? null,
        postTitle: post?.title ?? null,
        parentCommentId: comment.parentCommentId,
        authorProfileId: comment.authorProfileId,
        authorName: author?.displayName ?? null,
        authorProfilePublicId: author?.publicId ?? null,
        authorProfileIsPublic: author?.isPublic ?? null,
        body: comment.body,
        created: comment.created.toISOString(),
        deleted: comment.deleted?.toISOString() ?? null
      }
    })
  }

  // Load the public id and name for each of the given active project ids
  // (the project name lives on the project's instance). Inactive projects
  // are left out so their references are not shown.
  async getProjectInfoByIds(
    prisma: PrismaClient,
    projectIds: string[]) {

    if (projectIds.length === 0) {
      return new Map<string, ProjectInfo>()
    }

    const projects = await
      projectModel.filterByIds(
        prisma,
        projectIds,
        true)

    return new Map<string, ProjectInfo>(
      projects
        .filter(project => project.status === BaseDataTypes.activeStatus)
        .map(project => [project.id, {
          publicId: project.publicId,
          name: project.instance.name
        }]))
  }
}

// Display info for the project a discuss post is attached to
interface ProjectInfo {
  publicId: string
  name: string
}
