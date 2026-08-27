import { PrismaClient } from '@/generated/prisma/client'

export class EndorsementModel {

  // Consts
  clName = 'EndorsementModel'

  // Code
  async create(
    prisma: PrismaClient,
    fromProfileId: string,
    toProfileId: string,
    skillId: string,
    comment: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.endorsement.create({
        data: {
          fromProfileId: fromProfileId,
          toProfileId: toProfileId,
          skillId: skillId,
          comment: comment
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
      return await prisma.endorsement.findUnique({
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
    fromProfileId: string | undefined = undefined,
    toProfileId: string | undefined = undefined,
    skillId: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.endorsement.findMany({
        where: {
          fromProfileId: fromProfileId,
          toProfileId: toProfileId,
          skillId: skillId
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
      return await prisma.endorsement.delete({
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
