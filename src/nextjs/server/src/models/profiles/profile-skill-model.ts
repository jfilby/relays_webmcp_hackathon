import { PrismaClient } from '@/generated/prisma/client'

export class ProfileSkillModel {

  // Consts
  clName = 'ProfileSkillModel'

  // Code
  async create(
    prisma: PrismaClient,
    profileId: string,
    skillId: string,
    level: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.profileSkill.create({
        data: {
          profileId: profileId,
          skillId: skillId,
          level: level
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
      return await prisma.profileSkill.findUnique({
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByProfileIdAndSkillId(
    prisma: PrismaClient,
    profileId: string,
    skillId: string) {

    // Debug
    const fnName = `${this.clName}.getByProfileIdAndSkillId()`

    // Query
    try {
      return await prisma.profileSkill.findUnique({
        where: {
          profileId_skillId: {
            profileId: profileId,
            skillId: skillId
          }
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async filter(
    prisma: PrismaClient,
    profileId: string | undefined = undefined,
    skillId: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.profileSkill.findMany({
        where: {
          profileId: profileId,
          skillId: skillId
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
    level: string | undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Update record
    try {
      return await prisma.profileSkill.update({
        data: {
          level: level
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
      return await prisma.profileSkill.delete({
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
    profileId: string | undefined,
    skillId: string | undefined,
    level: string | undefined) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // If id isn't specified, but the unique keys are, try to get the record
    if (id == null &&
        profileId != null &&
        skillId != null) {

      const profileSkill = await
        this.getByProfileIdAndSkillId(
          prisma,
          profileId,
          skillId)

      if (profileSkill != null) {
        id = profileSkill.id
      }
    }

    // Upsert
    if (id == null) {

      // Validate for create (mainly for type validation of the create call)
      if (profileId == null) {
        console.error(`${fnName}: id is null and profileId is null`)
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
          profileId,
          skillId,
          level)
    } else {

      // Update
      return await
        this.update(
          prisma,
          id,
          level)
    }
  }
}
