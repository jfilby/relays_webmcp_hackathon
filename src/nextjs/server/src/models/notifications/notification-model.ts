import { Prisma, PrismaClient } from '@/generated/prisma/client'

export class NotificationModel {

  // Consts
  clName = 'NotificationModel'

  // Code
  async create(
    prisma: PrismaClient,
    userProfileId: string,
    type: string,
    refModel: string | undefined = undefined,
    refId: string | undefined = undefined,
    readAt: Date | null | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.notification.create({
        data: {
          userProfileId: userProfileId,
          type: type,
          refModel: refModel,
          refId: refId,
          readAt: readAt
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
    readAtIsNull: boolean | undefined = undefined,
    sortDesc: boolean = false) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Order by
    var orderBy: Prisma.NotificationOrderByWithRelationInput[] = []

    if (sortDesc === true) {

      orderBy = [
        {
          created: 'desc'
        }
      ]
    }

    // Query
    try {
      return await prisma.notification.findMany({
        where: {
          userProfileId: userProfileId,
          type: type,
          readAt: readAtIsNull === true ? { equals: null } : undefined
        },
        orderBy: orderBy
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }
  async markAsRead(
    prisma: PrismaClient,
    id: string,
    readAt: Date | null) {

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

  // Mark all of a user's notifications as read
  async markAllAsRead(
    prisma: PrismaClient,
    userProfileId: string,
    readAt: Date) {

    // Debug
    const fnName = `${this.clName}.markAllAsRead()`

    // Update records
    try {
      return await prisma.notification.updateMany({
        data: {
          readAt: readAt
        },
        where: {
          userProfileId: userProfileId,
          readAt: null
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

  // Delete all notifications of the given types (used by demo data cleanup
  // to remove rows written with legacy type names)
  async deleteByTypes(
    prisma: PrismaClient,
    types: string[]) {

    // Debug
    const fnName = `${this.clName}.deleteByTypes()`

    // Delete
    try {
      return await prisma.notification.deleteMany({
        where: {
          type: {
            in: types
          }
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByUserProfileIdAndTypeAndNullRef(
    prisma: PrismaClient,
    userProfileId: string,
    type: string) {

    // Debug
    const fnName = `${this.clName}.getByUserProfileIdAndTypeAndNullRef()`

    // Query
    try {
      return await prisma.notification.findFirst({
        where: {
          userProfileId: userProfileId,
          type: type,
          refModel: null,
          refId: null
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }
}
