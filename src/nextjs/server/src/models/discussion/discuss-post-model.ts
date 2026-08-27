import { PrismaClient } from '@/generated/prisma/client'
import { PublicIdService } from '@/services/utils/public-id-service'

export class DiscussPostModel {

  // Consts
  clName = 'DiscussPostModel'

  // Code
  async create(
    prisma: PrismaClient,
    authorProfileId: string,
    status: string,
    title: string,
    body: string,
    projectId: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.discussPost.create({
        data: {
          publicId: PublicIdService.generate(title),
          authorProfileId: authorProfileId,
          status: status,
          projectId: projectId,
          title: title,
          body: body
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
      return await prisma.discussPost.findUnique({
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByPublicId(
    prisma: PrismaClient,
    publicId: string) {

    // Debug
    const fnName = `${this.clName}.getByPublicId()`

    // Query
    try {
      return await prisma.discussPost.findUnique({
        where: {
          publicId: publicId
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async filter(
    prisma: PrismaClient,
    authorProfileId: string | undefined = undefined,
    projectId: string | undefined = undefined,
    status: string | undefined = undefined) {
    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.discussPost.findMany({
        where: {
          authorProfileId: authorProfileId,
          projectId: projectId,
          status: status
        },
        orderBy: {
          created: 'desc'
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
      return await prisma.discussPost.delete({
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
