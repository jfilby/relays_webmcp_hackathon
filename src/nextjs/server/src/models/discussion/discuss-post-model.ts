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

  async update(
    prisma: PrismaClient,
    id: string,
    title: string | undefined,
    body: string | undefined,
    status: string | undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Update record
    try {
      return await prisma.discussPost.update({
        data: {
          title: title,
          body: body,
          status: status
        },
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async upsert(
    prisma: PrismaClient,
    id: string | undefined,
    publicId: string | undefined,
    authorProfileId: string | undefined,
    projectId: string | null | undefined,
    title: string | undefined,
    body: string | undefined,
    status: string | undefined) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // If id isn't specified, but the unique keys are, try to get the record
    if (id == null &&
        publicId != null) {

      const discussPost = await
        this.getByPublicId(
          prisma,
          publicId)

      if (discussPost != null) {
        id = discussPost.id
      }
    }

    // Upsert
    if (id == null) {

      // Validate for create (mainly for type validation of the create call)
      if (publicId == null) {
        console.error(`${fnName}: id is null and publicId is null`)
        throw 'Prisma error'
      }

      if (authorProfileId == null) {
        console.error(`${fnName}: id is null and authorProfileId is null`)
        throw 'Prisma error'
      }

      if (title == null) {
        console.error(`${fnName}: id is null and title is null`)
        throw 'Prisma error'
      }

      if (body == null) {
        console.error(`${fnName}: id is null and body is null`)
        throw 'Prisma error'
      }

      if (status == null) {
        console.error(`${fnName}: id is null and status is null`)
        throw 'Prisma error'
      }

      // Create. Note: an explicit publicId is used (create() generates one)
      try {
        return await prisma.discussPost.create({
          data: {
            publicId: publicId,
            authorProfileId: authorProfileId,
            projectId: projectId,
            title: title,
            body: body,
            status: status
          }
        })
      } catch (error) {
        console.error(`${fnName}: error: ${error}`)
        throw 'Prisma error'
      }
    } else {

      // Update
      return await
        this.update(
          prisma,
          id,
          title,
          body,
          status)
    }
  }
}
