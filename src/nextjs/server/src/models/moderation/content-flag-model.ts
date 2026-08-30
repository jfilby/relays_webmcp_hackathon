import { PrismaClient } from '@/generated/prisma/client'

export class ContentFlagModel {

  // Consts
  clName = 'ContentFlagModel'

  // Code
  async create(
    prisma: PrismaClient,
    refModel: string,
    refId: string,
    flaggerUserProfileId: string,
    status: string) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.contentFlag.create({
        data: {
          refModel: refModel,
          refId: refId,
          flaggerUserProfileId: flaggerUserProfileId,
          status: status
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByRefAndFlagger(
    prisma: PrismaClient,
    refModel: string,
    refId: string,
    flaggerUserProfileId: string) {

    // Debug
    const fnName = `${this.clName}.getByRefAndFlagger()`

    // Query
    try {
      return await prisma.contentFlag.findUnique({
        where: {
          refModel_refId_flaggerUserProfileId: {
            refModel: refModel,
            refId: refId,
            flaggerUserProfileId: flaggerUserProfileId
          }
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async filterByStatus(
    prisma: PrismaClient,
    status: string) {

    // Debug
    const fnName = `${this.clName}.filterByStatus()`

    // Query
    try {
      return await prisma.contentFlag.findMany({
        where: {
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

  async filterByRef(
    prisma: PrismaClient,
    refModel: string,
    refId: string) {

    // Debug
    const fnName = `${this.clName}.filterByRef()`

    // Query
    try {
      return await prisma.contentFlag.findMany({
        where: {
          refModel: refModel,
          refId: refId
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async updateStatusByIds(
    prisma: PrismaClient,
    ids: string[],
    status: string) {

    // Debug
    const fnName = `${this.clName}.updateStatus()`

    // Update record
    try {
      return await prisma.contentFlag.updateMany({
        data: {
          status: status
        },
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

  async deleteByRef(
    prisma: PrismaClient,
    refModel: string,
    refId: string) {

    // Debug
    const fnName = `${this.clName}.deleteByRef()`

    // Delete
    try {
      return await prisma.contentFlag.deleteMany({
        where: {
          refModel: refModel,
          refId: refId
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }
}
