import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes } from '@/types/demo-data-types'
import { ProfilesDemoDataSetupService } from './profiles-service'
import { ProjectsDemoDataSetupService } from './projects-service'

// Services
const profilesDemoDataService = new ProfilesDemoDataSetupService()
const projectsDemoDataService = new ProjectsDemoDataSetupService()

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

      const post = await prisma.discussPost.upsert({
        where: {
          publicId: data.publicId
        },
        create: {
          authorProfileId: authorProfile.id,
          publicId: data.publicId,
          projectId: projectId,
          title: data.title,
          body: data.body,
          status: data.status
        },
        update: {
          title: data.title,
          body: data.body,
          status: data.status
        }
      })

      for (const commentData of data.comments ?? []) {
        const commentAuthor =
          await profilesDemoDataService.getProfileByKey(
            prisma,
            commentData.authorProfileKey)
        const parentCommentId = commentData.parentPublicId != null ?
          await this.getCommentIdByPublicId(prisma, commentData.parentPublicId) :
          null

        await prisma.discussComment.upsert({
          where: {
            publicId: commentData.publicId
          },
          create: {
            publicId: commentData.publicId,
            postId: post.id,
            authorProfileId: commentAuthor.id,
            body: commentData.body,
            status: commentData.status,
            parentCommentId: parentCommentId
          },
          update: {
            body: commentData.body,
            status: commentData.status
          }
        })
      }
    }
  }

  // Helpers

  async getCommentIdByPublicId(
    prisma: PrismaClient,
    publicId: string) {

    const comment = await prisma.discussComment.findUnique({
      where: {
        publicId: publicId
      },
      select: {
        id: true
      }
    })

    if (comment == null) {
      throw `${this.clName}: demo discuss comment not found: ${publicId}`
    }

    return comment.id
  }
}
