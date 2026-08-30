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
    body: string,
    parentCommentId: string | undefined = undefined) {

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
          body: body,
          parentCommentId: parentCommentId
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

  async countByPostId(
    prisma: PrismaClient,
    postId: string,
    status: string) {

    // Debug
    const fnName = `${this.clName}.countByPostId()`

    // Query
    try {
      return await prisma.discussComment.count({
        where: {
          postId: postId,
          status: status
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async countByPostIds(
    prisma: PrismaClient,
    postIds: string[],
    status: string) {

    // Debug
    const fnName = `${this.clName}.countByPostIds()`

    // Query
    try {
      return await prisma.discussComment.groupBy({
        by: ['postId'],
        where: {
          postId: {
            in: postIds
          },
          status: status
        },
        _count: {
          _all: true
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async filterByPostIdAndStatus(
    prisma: PrismaClient,
    postId: string,
    status: string) {

    // Debug
    const fnName = `${this.clName}.filterByPostIdAndStatus()`

    // Query
    try {
      return await prisma.discussComment.findMany({
        where: {
          postId: postId,
          status: status
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

  async filterByParentCommentIds(
    prisma: PrismaClient,
    parentCommentIds: string[]) {

    // Debug
    const fnName = `${this.clName}.filterByParentCommentIds()`

    // Query
    try {
      return await prisma.discussComment.findMany({
        where: {
          parentCommentId: {
            in: parentCommentIds
          }
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

  async deleteManyByIds(
    prisma: PrismaClient,
    ids: string[]) {

    // Debug
    const fnName = `${this.clName}.deleteManyByIds()`

    // Delete
    try {
      return await prisma.discussComment.deleteMany({
        where: {
          id: {
            in: ids
          }
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
      return await prisma.discussComment.findUnique({
        where: {
          publicId: publicId
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
    body: string | undefined,
    status: string | undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Update record
    try {
      return await prisma.discussComment.update({
        data: {
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

  // Soft delete: keep the record so replies stay attached, blank the text.
  async setDeleted(
    prisma: PrismaClient,
    id: string,
    deleted: Date) {

    // Debug
    const fnName = `${this.clName}.setDeleted()`

    // Update record
    try {
      return await prisma.discussComment.update({
        data: {
          body: '',
          deleted: deleted
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
    postId: string | undefined,
    authorProfileId: string | undefined,
    body: string | undefined,
    status: string | undefined,
    parentCommentId: string | null | undefined) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // If id isn't specified, but the unique keys are, try to get the record
    if (id == null &&
        publicId != null) {

      const discussComment = await
        this.getByPublicId(
          prisma,
          publicId)

      if (discussComment != null) {
        id = discussComment.id
      }
    }

    // Upsert
    if (id == null) {

      // Validate for create (mainly for type validation of the create call)
      if (publicId == null) {
        console.error(`${fnName}: id is null and publicId is null`)
        throw 'Prisma error'
      }

      if (postId == null) {
        console.error(`${fnName}: id is null and postId is null`)
        throw 'Prisma error'
      }

      if (authorProfileId == null) {
        console.error(`${fnName}: id is null and authorProfileId is null`)
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
        return await prisma.discussComment.create({
          data: {
            publicId: publicId,
            postId: postId,
            authorProfileId: authorProfileId,
            body: body,
            status: status,
            parentCommentId: parentCommentId
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
          body,
          status)
    }
  }
}
