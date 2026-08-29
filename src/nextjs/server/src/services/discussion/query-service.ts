import { PrismaClient } from '@/generated/prisma/client'
import { DiscussPostModel } from '@/models/discussion/discuss-post-model'
import { DiscussCommentModel } from '@/models/discussion/discuss-comment-model'
import { ProfileModel } from '@/models/profiles/profile-model'
import { BaseDataTypes } from '@/types/base-data-types'

// Models
const discussPostModel = new DiscussPostModel()
const discussCommentModel = new DiscussCommentModel()
const profileModel = new ProfileModel()

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

    // Debug
    const fnName = `${this.clName}.getDiscussPosts()`

    // Query
    const posts = await
      discussPostModel.filter(
        prisma,
        profileId,
        projectId,
        BaseDataTypes.activeStatus)
    // No posts, no authors to fetch
    if (posts.length === 0) {
      return {
        status: true,
        posts: []
      }
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

    // Load each author's display name
    const authorProfileIds =
      [...new Set(posts.map(post => post.authorProfileId))]

    const authors = await
      profileModel.getByIds(
        prisma,
        authorProfileIds)

    const authorNames = new Map<string, string>(
      authors.map(author => [author.id, author.displayName]))

    // Return
    return {
      status: true,
      posts: posts.map(post => ({
        id: post.id,
        publicId: post.publicId,
        authorProfileId: post.authorProfileId,
        authorName: authorNames.get(post.authorProfileId) ?? null,
        projectId: post.projectId,
        title: post.title,
        body: post.body,
        commentCount: commentCountMap.get(post.id) ?? 0,
        created: post.created.toISOString()
      }))
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

    // Return
    return {
      status: true,
      post: {
        id: post.id,
        publicId: post.publicId,
        authorProfileId: post.authorProfileId,
        authorName: author?.displayName ?? null,
        projectId: post.projectId,
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

    // Load each author's display name
    const authorProfileIds =
      [...new Set(comments.map(comment => comment.authorProfileId))]

    const authors = await
      profileModel.getByIds(
        prisma,
        authorProfileIds)

    const authorNames = new Map<string, string>(
      authors.map(author => [author.id, author.displayName]))

    // Return
    return {
      status: true,
      comments: comments.map(comment => ({
        id: comment.id,
        publicId: comment.publicId,
        postId: comment.postId,
        parentCommentId: comment.parentCommentId,
        authorProfileId: comment.authorProfileId,
        authorName: authorNames.get(comment.authorProfileId) ?? null,
        body: comment.body,
        created: comment.created.toISOString()
      }))
    }
  }
}
