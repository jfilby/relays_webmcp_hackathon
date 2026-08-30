import { PrismaClient } from '@/generated/prisma/client'
import { UserProfileModel } from 'serene-core-server'
import { ModerationTypes } from '@/types/moderation-types'
import { ContentFlagModel } from '@/models/moderation/content-flag-model'
import { DiscussPostModel } from '@/models/discussion/discuss-post-model'
import { DiscussCommentModel } from '@/models/discussion/discuss-comment-model'
import { ProfileModel } from '@/models/profiles/profile-model'

// Models
const userProfileModel = new UserProfileModel()
const contentFlagModel = new ContentFlagModel()
const discussPostModel = new DiscussPostModel()
const discussCommentModel = new DiscussCommentModel()
const profileModel = new ProfileModel()

// Class
export class ModerationQueryService {

  // Consts
  clName = 'ModerationQueryService'

  // Code
  // One queue entry per flagged item, with the content excerpt, author, and
  // the number of pending flags. Only admins may load the queue.
  async getModerationQueue(
    prisma: PrismaClient,
    userProfileId: string) {

    // Only admins can see the moderation queue
    const userProfile = await
      userProfileModel.getById(
        prisma,
        userProfileId)

    if (userProfile == null || userProfile.isAdmin === false) {
      return {
        status: false,
        message: `You aren't an admin user.`
      }
    }

    // Query
    const flags = await
      contentFlagModel.filterByStatus(
        prisma,
        ModerationTypes.pendingStatus)

    if (flags.length === 0) {
      return {
        status: true,
        items: []
      }
    }

    // Group the flags by the flagged content; newest flag first
    const groups = new Map<string, typeof flags>()

    for (const flag of flags) {
      const key = `${flag.refModel}:${flag.refId}`

      const group = groups.get(key) ?? []

      group.push(flag)
      groups.set(key, group)
    }

    // Load the flagged content
    const postIds = [...new Set(flags
      .filter(flag => flag.refModel === ModerationTypes.refModelDiscussPost)
      .map(flag => flag.refId))]

    const commentIds = [...new Set(flags
      .filter(flag => flag.refModel === ModerationTypes.refModelDiscussComment)
      .map(flag => flag.refId))]

    const posts = postIds.length > 0 ?
      await discussPostModel.filterByIds(prisma, postIds) :
      []

    const comments = commentIds.length > 0 ?
      await discussCommentModel.filterByIds(prisma, commentIds) :
      []

    const postsById = new Map(posts.map(post => [post.id, post]))
    const commentsById = new Map(comments.map(comment => [comment.id, comment]))

    // Load the authors of the flagged content. Comments live under a post,
    // so the parent post's public id is included for deep-linking.
    const authorProfileIds = [...new Set([
      ...posts.map(post => post.authorProfileId),
      ...comments.map(comment => comment.authorProfileId)
    ])]

    const authors = authorProfileIds.length > 0 ?
      await profileModel.getByIds(prisma, authorProfileIds) :
      []

    const authorsById = new Map(authors.map(author => [author.id, author]))

    // Return
    const items = [...groups.entries()].map(([key, group]) => {

      const [refModel, refId] = [group[0].refModel, group[0].refId]
      const post = refModel === ModerationTypes.refModelDiscussPost ?
        postsById.get(refId) :
        undefined
      const comment = refModel === ModerationTypes.refModelDiscussComment ?
        commentsById.get(refId) :
        undefined

      const content = post ?? comment
      const author = content != null ?
        authorsById.get(content.authorProfileId) :
        undefined


      // The group key doubles as the item id
      return {
        id: key,
        refModel: refModel,
        refId: refId,
        contentPublicId: content?.publicId ?? null,
        postPublicId: comment?.postId != null ?
          postsById.get(comment.postId)?.publicId ?? null :
          null,
        title: post?.title ?? null,
        excerpt: content?.body ?? '',
        authorName: author?.displayName ?? null,
        authorProfilePublicId: author?.publicId ?? null,
        flagCount: group.length,
        created: group[0].created.toISOString(),
        updated: group[0].updated.toISOString()
      }
    })

    // Return
    return {
      status: true,
      items: items
    }
  }
}
