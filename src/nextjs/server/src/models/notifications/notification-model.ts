import { PrismaClient } from '@/generated/prisma/client'

export class NotificationModel {

  // Consts
  clName = 'NotificationModel'

  // Code
  async create(
    prisma: PrismaClient,
    userProfileId: string,
    type: string,
    refModel: string | undefined = undefined,
    refId: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.notification.create({
        data: {
          userProfileId: userProfileId,
          type: type,
          refModel: refModel,
          refId: refId
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
      return await prisma.notification.findUnique({
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async filter(
    prisma: PrismaClient,
    userProfileId: string | undefined = undefined,
    type: string | undefined = undefined,
    readAtIsNull: boolean | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.notification.findMany({
        where: {
          userProfileId: userProfileId,
          type: type,
          readAt: readAtIsNull === true ? { equals: null } : undefined
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async markAsRead(
    prisma: PrismaClient,
    id: string,
    readAt: Date) {

    // Debug
    const fnName = `${this.clName}.markAsRead()`

    // Update record
    try {
      return await prisma.notification.update({
        data: {
          readAt: readAt
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

  async deleteById(
    prisma: PrismaClient,
    id: string) {

    // Debug
    const fnName = `${this.clName}.deleteById()`

    // Delete
    try {
      return await prisma.notification.delete({
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
