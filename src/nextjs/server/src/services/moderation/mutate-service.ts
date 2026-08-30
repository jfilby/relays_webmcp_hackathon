import { PrismaClient } from '@/generated/prisma/client'
import { UserProfileModel } from 'serene-core-server'
import { ModerationTypes } from '@/types/moderation-types'
import { ContentFlagModel } from '@/models/moderation/content-flag-model'
import { DiscussPostModel } from '@/models/discussion/discuss-post-model'
import { DiscussCommentModel } from '@/models/discussion/discuss-comment-model'

// Models
const userProfileModel = new UserProfileModel()
const contentFlagModel = new ContentFlagModel()
const discussPostModel = new DiscussPostModel()
const discussCommentModel = new DiscussCommentModel()

// Class
export class ModerationMutateService {

  // Consts
  clName = 'ModerationMutateService'

  // Code
  // Flag a piece of content. One flag per user per item; repeats are
  // reported as already flagged instead of failing.
  async flagContent(
    prisma: PrismaClient,
    userProfileId: string,
    refModel: string,
    refId: string) {

    // Validate the ref model
    if (!ModerationTypes.refModels.includes(refModel)) {
      return {
        status: false,
        message: `Unsupported content type`
      }
    }

    // The flagged content must exist
    let content = null

    if (refModel === ModerationTypes.refModelDiscussPost) {
      content = await discussPostModel.getById(prisma, refId)
    } else if (refModel === ModerationTypes.refModelDiscussComment) {
      content = await discussCommentModel.getById(prisma, refId)
    }

    if (content == null) {
      return {
        status: false,
        message: `Content not found`
      }
    }

    // One flag per user per item
    const existingFlag = await
      contentFlagModel.getByRefAndFlagger(
        prisma,
        refModel,
        refId,
        userProfileId)

    if (existingFlag != null) {
      return {
        status: true,
        message: existingFlag.status === ModerationTypes.pendingStatus ?
          `Already flagged for review` :
          `Flagged`
      }
    }

    // Create the flag
    await
      contentFlagModel.create(
        prisma,
        refModel,
        refId,
        userProfileId,
        ModerationTypes.pendingStatus)

    // Return
    return {
      status: true,
      message: `Flagged for moderation`
    }
  }

  // Admin-only: change the status of every flag on an item. Dismissing
  // leaves the content untouched; resolving is used after content deletion.
  async setModerationFlagStatus(
    prisma: PrismaClient,
    userProfileId: string,
    refModel: string,
    refId: string,
    status: string) {

    // Only admins can moderate
    const adminError = await
      this.validateAdmin(
        prisma,
        userProfileId)

    if (adminError != null) {
      return adminError
    }

    if (![ModerationTypes.pendingStatus,
      ModerationTypes.dismissedStatus,
      ModerationTypes.resolvedStatus].includes(status)) {
      return {
        status: false,
        message: `Invalid flag status`
      }
    }

    // Query
    const flags = await
      contentFlagModel.filterByRef(
        prisma,
        refModel,
        refId)

    if (flags.length === 0) {
      return {
        status: false,
        message: `Flag not found`
      }
    }

    await
      contentFlagModel.updateStatusByIds(
        prisma,
        flags.map(flag => flag.id),
        status)

    // Return
    return {
      status: true,
      message: status === ModerationTypes.dismissedStatus ?
        `Flag dismissed` :
        `Flag updated`
    }
  }

  // Admin-only: delete flagged content. A flagged post is removed with all
  // its comments; a flagged comment follows the author-delete rules (soft
  // delete when it has replies) so the thread stays intact.
  async deleteFlaggedContent(
    prisma: PrismaClient,
    userProfileId: string,
    refModel: string,
    refId: string) {

    // Only admins can moderate
    const adminError = await
      this.validateAdmin(
        prisma,
        userProfileId)

    if (adminError != null) {
      return adminError
    }

    // Delete the content
    if (refModel === ModerationTypes.refModelDiscussPost) {

      const post = await
        discussPostModel.getById(
          prisma,
          refId)

      if (post == null) {
        return {
          status: false,
          message: `Post not found`
        }
      }

      // Delete the comments first so no orphans remain
      await
        discussCommentModel.deleteByPostId(
          prisma,
          post.id)

      await
        discussPostModel.deleteById(
          prisma,
          post.id)
    } else if (refModel === ModerationTypes.refModelDiscussComment) {

      const comment = await
        discussCommentModel.getById(
          prisma,
          refId)

      if (comment == null) {
        return {
          status: false,
          message: `Comment not found`
        }
      }

      // If the comment has replies, soft delete it so its replies stay
      // attached to a parent. Otherwise remove the record entirely, as with
      // no replies there is nothing to preserve.
      const children = await
        discussCommentModel.filterByParentCommentIds(
          prisma,
          [comment.id])

      if (children.length > 0) {
        await
          discussCommentModel.setDeleted(
            prisma,
            comment.id,
            new Date())
      } else {
        await
          discussCommentModel.deleteManyByIds(
            prisma,
            [comment.id])
      }
    } else {
      return {
        status: false,
        message: `Unsupported content type`
      }
    }

    // Resolve the flags so the item leaves the queue
    const flags = await
      contentFlagModel.filterByRef(
        prisma,
        refModel,
        refId)

    if (flags.length > 0) {
      await
        contentFlagModel.updateStatusByIds(
          prisma,
          flags.map(flag => flag.id),
          ModerationTypes.resolvedStatus)
    }

    // Return
    return {
      status: true,
      message: `Content deleted`
    }
  }

  // Returns null when the user is an admin, else a failed result
  private async validateAdmin(
    prisma: PrismaClient,
    userProfileId: string) {

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

    return null
  }
}
