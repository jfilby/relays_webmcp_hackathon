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
export class DiscussionMutateService {

  // Consts
  clName = 'DiscussionMutateService'

  // Code
  // Create a discussion post
  async createDiscussPost(
    prisma: PrismaClient,
    userProfileId: string,
    title: string,
    body: string,
    projectId: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.createDiscussPost()`

    // Validate
    if (title == null || title.trim() === '') {
      return {
        status: false,
        message: `A title is required`
      }
    }

    if (body == null || body.trim() === '') {
      return {
        status: false,
        message: `Post body is required`
      }
    }

    // Get the profile
    const profile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    if (profile == null) {
      return {
        status: false,
        message: `Profile not found`
      }
    }

    // Validate the project, if one is attached
    if (projectId != null) {
      const project = await
        prisma.project.findUnique({
          where: {
            id: projectId
          }
        })

      if (project == null) {
        return {
          status: false,
          message: `Project not found`
        }
      }
    }

    // Create the post
    const post = await
      discussPostModel.create(
        prisma,
        profile.id,
        BaseDataTypes.activeStatus,
        title.trim(),
        body,
        projectId)

    // Return
    return {
      status: true,
      message: `Posted`,
      post: {
        id: post.id,
        publicId: post.publicId,
        authorProfileId: post.authorProfileId,
        authorName: profile.displayName,
        projectId: post.projectId,
        title: post.title,
        body: post.body,
        commentCount: 0,
        created: post.created.toISOString()
      }
    }
  }

  // Delete a discussion post and its comments (authors only)
  async deleteDiscussPost(
    prisma: PrismaClient,
    userProfileId: string,
    postId: string) {

    // Debug
    const fnName = `${this.clName}.deleteDiscussPost()`

    // Load the post to verify ownership
    const post = await
      discussPostModel.getById(
        prisma,
        postId)

    if (post == null) {
      return {
        status: false,
        message: `Post not found`
      }
    }

    const profile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    if (profile == null || post.authorProfileId !== profile.id) {
      return {
        status: false,
        message: `You can only delete your own posts`
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

    // Return
    return {
      status: true,
      message: `Post deleted`
    }
  }

  // Create a comment on a discussion post
  async createDiscussComment(
    prisma: PrismaClient,
    userProfileId: string,
    postId: string,
    body: string) {

    // Debug
    const fnName = `${this.clName}.createDiscussComment()`

    // Validate
    if (body == null || body.trim() === '') {
      return {
        status: false,
        message: `Comment body is required`
      }
    }

    // Get the profile
    const profile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    if (profile == null) {
      return {
        status: false,
        message: `Profile not found`
      }
    }

    // Verify the post exists and is active
    const post = await
      discussPostModel.getById(
        prisma,
        postId)

    if (post == null || post.status !== BaseDataTypes.activeStatus) {
      return {
        status: false,
        message: `Post not found`
      }
    }

    // Create the comment
    const comment = await
      discussCommentModel.create(
        prisma,
        post.id,
        profile.id,
        BaseDataTypes.activeStatus,
        body)

    // Return
    return {
      status: true,
      message: `Comment added`,
      comment: {
        id: comment.id,
        postId: comment.postId,
        authorProfileId: comment.authorProfileId,
        authorName: profile.displayName,
        body: comment.body,
        created: comment.created.toISOString()
      }
    }
  }

  // Delete a comment (authors only)
  async deleteDiscussComment(
    prisma: PrismaClient,
    userProfileId: string,
    commentId: string) {

    // Debug
    const fnName = `${this.clName}.deleteDiscussComment()`

    // Load the comment to verify ownership
    const comment = await
      discussCommentModel.getById(
        prisma,
        commentId)

    if (comment == null) {
      return {
        status: false,
        message: `Comment not found`
      }
    }

    const profile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    if (profile == null || comment.authorProfileId !== profile.id) {
      return {
        status: false,
        message: `You can only delete your own comments`
      }
    }

    // Delete
    await
      discussCommentModel.deleteById(
        prisma,
        comment.id)

    // Return
    return {
      status: true,
      message: `Comment deleted`
    }
  }
}
