import { PrismaClient } from '@/generated/prisma/client'

export class SkillModel {

  // Consts
  clName = 'SkillModel'

  // Code
  async create(
    prisma: PrismaClient,
    name: string,
    status: string,
    category: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.skill.create({
        data: {
          name: name,
          status: status,
          category: category
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
      return await prisma.skill.findUnique({
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByIds(
    prisma: PrismaClient,
    ids: string[]) {

    // Debug
    const fnName = `${this.clName}.getByIds()`

    // Query
    try {
      return await prisma.skill.findMany({
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

  async getByName(
    prisma: PrismaClient,
    name: string) {

    // Debug
    const fnName = `${this.clName}.getByName()`

    // Validate
    if (name == null) {
      console.error(`${fnName}: name == null`)
      throw 'Validation error'
    }

    // Query
    try {
      return await prisma.skill.findUnique({
        where: {
          name: name
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  // Find a skill by exact name, matched case-insensitively
  async getByExactName(
    prisma: PrismaClient,
    name: string) {

    // Debug
    const fnName = `${this.clName}.getByExactName()`

    // Validate
    if (name == null) {
      console.error(`${fnName}: name == null`)
      throw 'Validation error'
    }

    // Query
    try {
      return await prisma.skill.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive'
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
    status: string | undefined = undefined,
    category: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.skill.findMany({
        where: {
          status: status,
          category: category
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
    name: string | undefined,
    category: string | undefined,
    status: string | undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Update record
    try {
      return await prisma.skill.update({
        data: {
          name: name,
          category: category,
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

  async deleteById(
    prisma: PrismaClient,
    id: string) {

    // Debug
    const fnName = `${this.clName}.deleteById()`

    // Delete
    try {
      return await prisma.skill.delete({
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
    name: string | undefined,
    category: string | undefined,
    status: string | undefined) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // If id isn't specified, but the unique keys are, try to get the record
    if (id == null &&
        name != null) {

      const skill = await
        this.getByName(
          prisma,
          name)

      if (skill != null) {
        id = skill.id
      }
    }

    // Upsert
    if (id == null) {

      // Validate for create (mainly for type validation of the create call)
      if (name == null) {
        console.error(`${fnName}: id is null and name is null`)
        throw 'Prisma error'
      }

      // Validate for create (mainly for type validation of the create call)
      if (status == null) {
        console.error(`${fnName}: id is null and status is null`)
        throw 'Prisma error'
      }

      // Create
      return await
        this.create(
          prisma,
          name,
          status,
          category)
    } else {

      // Update
      return await
        this.update(
          prisma,
          id,
          name,
          category,
          status)
    }
  }
}
