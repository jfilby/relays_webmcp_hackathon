import { PrismaClient } from '@/generated/prisma/client'
import { DiscussPostModel } from '@/models/discussion/discuss-post-model'
import { DiscussCommentModel } from '@/models/discussion/discuss-comment-model'
import { BaseDataTypes } from '@/types/base-data-types'

// Models
const discussPostModel = new DiscussPostModel()
const discussCommentModel = new DiscussCommentModel()

// Class
export class DiscussionQueryService {

  // Consts
  clName = 'DiscussionQueryService'

  // Code
  // Get all active discussion posts, newest first, with each author's display
  // name and comment count.
  async getDiscussPosts(
    prisma: PrismaClient) {

    // Debug
    const fnName = `${this.clName}.getDiscussPosts()`

    // Query
    const posts = await
      discussPostModel.filter(
        prisma,
        undefined,
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
      prisma.discussComment.groupBy({
        by: ['postId'],
        where: {
          postId: {
            in: posts.map(post => post.id)
          },
          status: BaseDataTypes.activeStatus
        },
        _count: {
          _all: true
        }
      })

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
      prisma.profile.findMany({
        where: {
          id: {
            in: authorProfileIds
          }
        }
      })

    const authorNames = new Map<string, string>(
      authors.map(author => [author.id, author.displayName]))

    // Return
    return {
      status: true,
      posts: posts.map(post => ({
        id: post.id,
        authorProfileId: post.authorProfileId,
        authorName: authorNames.get(post.authorProfileId) ?? null,
        title: post.title,
        body: post.body,
        commentCount: commentCountMap.get(post.id) ?? 0,
        created: post.created.toISOString()
      }))
    }
  }

  // Get one discussion post by id, with its author's display name.
  async getDiscussPostById(
    prisma: PrismaClient,
    id: string) {

    // Debug
    const fnName = `${this.clName}.getDiscussPostById()`

    // Query
    const post = await
      discussPostModel.getById(
        prisma,
        id)

    if (post == null || post.status !== BaseDataTypes.activeStatus) {
      return {
        status: false,
        message: `Post not found`
      }
    }

    // Load the author's display name
    const author = await
      prisma.profile.findUnique({
        where: {
          id: post.authorProfileId
        }
      })

    // Load the comment count
    const commentCount = await
      prisma.discussComment.count({
        where: {
          postId: post.id,
          status: BaseDataTypes.activeStatus
        }
      })

    // Return
    return {
      status: true,
      post: {
        id: post.id,
        authorProfileId: post.authorProfileId,
        authorName: author?.displayName ?? null,
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
      prisma.discussComment.findMany({
        where: {
          postId: postId,
          status: BaseDataTypes.activeStatus
        },
        orderBy: {
          created: 'asc'
        }
      })

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
      prisma.profile.findMany({
        where: {
          id: {
            in: authorProfileIds
          }
        }
      })

    const authorNames = new Map<string, string>(
      authors.map(author => [author.id, author.displayName]))

    // Return
    return {
      status: true,
      comments: comments.map(comment => ({
        id: comment.id,
        postId: comment.postId,
        authorProfileId: comment.authorProfileId,
        authorName: authorNames.get(comment.authorProfileId) ?? null,
        body: comment.body,
        created: comment.created.toISOString()
      }))
    }
  }
}
