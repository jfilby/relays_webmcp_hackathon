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

  async getByToProfileId(
    prisma: PrismaClient,
    toProfileId: string) {

    // Debug
    const fnName = `${this.clName}.getByToProfileId()`

    // Query
    try {
      return await prisma.endorsement.findMany({
        where: {
          toProfileId: toProfileId
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

  async getByToProfileIdAndSkillIdAndFromProfileId(
    prisma: PrismaClient,
    toProfileId: string,
    skillId: string,
    fromProfileId: string) {

    // Debug
    const fnName = `${this.clName}.getByToProfileIdAndSkillIdAndFromProfileId()`

    // Query
    try {
      return await prisma.endorsement.findUnique({
        where: {
          toProfileId_skillId_fromProfileId: {
            toProfileId: toProfileId,
            skillId: skillId,
            fromProfileId: fromProfileId
          }
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
    comment: string | undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Update record
    try {
      return await prisma.endorsement.update({
        data: {
          comment: comment
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
    fromProfileId: string | undefined,
    toProfileId: string | undefined,
    skillId: string | undefined,
    comment: string | undefined) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // If id isn't specified, but the unique keys are, try to get the record
    if (id == null &&
        fromProfileId != null &&
        toProfileId != null &&
        skillId != null) {

      const endorsement = await
        this.getByToProfileIdAndSkillIdAndFromProfileId(
          prisma,
          toProfileId,
          skillId,
          fromProfileId)

      if (endorsement != null) {
        id = endorsement.id
      }
    }

    // Upsert
    if (id == null) {

      // Validate for create (mainly for type validation of the create call)
      if (fromProfileId == null) {
        console.error(`${fnName}: id is null and fromProfileId is null`)
        throw 'Prisma error'
      }

      if (toProfileId == null) {
        console.error(`${fnName}: id is null and toProfileId is null`)
        throw 'Prisma error'
      }

      if (skillId == null) {
        console.error(`${fnName}: id is null and skillId is null`)
        throw 'Prisma error'
      }

      // Create
      return await
        this.create(
          prisma,
          fromProfileId,
          toProfileId,
          skillId,
          comment)
    } else {

      // Update
      return await
        this.update(
          prisma,
          id,
          comment)
    }
  }
}
