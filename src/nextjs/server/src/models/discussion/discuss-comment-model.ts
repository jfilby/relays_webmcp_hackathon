import { PrismaClient } from '@/generated/prisma/client'
import { PublicIdService } from '@/services/utils/public-id-service'

export class DiscussCommentModel {

  // Consts
  clName = 'DiscussCommentModel'

  // Code
  async create(
    prisma: PrismaClient,
    postId: string,
    authorProfileId: string,
    status: string,
    body: string) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.discussComment.create({
        data: {
          publicId: PublicIdService.generate(body),
          postId: postId,
          authorProfileId: authorProfileId,
          status: status,
          body: body
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async filterByPostId(
    prisma: PrismaClient,
    postId: string) {

    // Debug
    const fnName = `${this.clName}.filterByPostId()`

    // Query
    try {
      return await prisma.discussComment.findMany({
        where: {
          postId: postId
        },
        orderBy: {
          created: 'asc'
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getById(
    prisma: PrismaClient,
    id: string) {

    // Debug
    const fnName = `${this.clName}.getById()`

    // Query
    try {
      return await prisma.discussComment.findUnique({
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async deleteByPostId(
    prisma: PrismaClient,
    postId: string) {

    // Debug
    const fnName = `${this.clName}.deleteByPostId()`

    // Delete
    try {
      return await prisma.discussComment.deleteMany({
        where: {
          postId: postId
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async deleteById(
    prisma: PrismaClient,
    id: string) {

    // Debug
    const fnName = `${this.clName}.deleteById()`

    // Delete
    try {
      return await prisma.discussComment.delete({
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }
}
