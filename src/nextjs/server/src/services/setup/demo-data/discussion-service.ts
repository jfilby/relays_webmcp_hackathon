import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes } from '@/types/demo-data-types'
import { ProfilesDemoDataSetupService } from './profiles-service'
import { ProjectsDemoDataSetupService } from './projects-service'

// Models
import { DiscussCommentModel } from '@/models/discussion/discuss-comment-model'
import { DiscussPostModel } from '@/models/discussion/discuss-post-model'

// Services
const profilesDemoDataService = new ProfilesDemoDataSetupService()
const projectsDemoDataService = new ProjectsDemoDataSetupService()

// Models
const discussPostModel = new DiscussPostModel()
const discussCommentModel = new DiscussCommentModel()

// Class
// Upserts demo discussion posts and comments.

export class DiscussionDemoDataSetupService {

  // Consts
  clName = 'DiscussionDemoDataSetupService'

  // Code
  async setup(prisma: PrismaClient) {

    // Debug
    const fnName = `${this.clName}.setup()`

    // Upsert posts and comments
    for (const data of DemoDataTypes.discussPosts) {
      const authorProfile = await profilesDemoDataService.getProfileByKey(
        prisma,
        data.authorProfileKey)
      const projectId = data.projectKey != null ?
        (await projectsDemoDataService.getProjectByKey(
          prisma,
          data.projectKey)).id :
        null

      const post = await discussPostModel.upsert(
        prisma,
        undefined,
        data.publicId,
        authorProfile.id,
        projectId,
        data.title,
        data.body,
        data.status)

      for (const commentData of data.comments ?? []) {
        const commentAuthor =
          await profilesDemoDataService.getProfileByKey(
            prisma,
            commentData.authorProfileKey)
        const parentCommentId = commentData.parentPublicId != null ?
          await this.getCommentIdByPublicId(prisma, commentData.parentPublicId) :
          null

        await discussCommentModel.upsert(
          prisma,
          undefined,
          commentData.publicId,
          post.id,
          commentAuthor.id,
          commentData.body,
          commentData.status,
          parentCommentId)
      }
    }
  }

  // Helpers

  async getCommentIdByPublicId(
    prisma: PrismaClient,
    publicId: string) {

    const comment = await discussCommentModel.getByPublicId(
      prisma,
      publicId)

    if (comment == null) {
      throw `${this.clName}: demo discuss comment not found: ${publicId}`
    }

    return comment.id
  }
}
