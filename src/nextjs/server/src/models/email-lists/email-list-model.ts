import { PrismaClient } from '@/generated/prisma/client'

export class EmailListModel {

  // Consts
  clName = 'EmailListModel'

  // Code
  async create(
    prisma: PrismaClient,
    status: string,
    name: string) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.emailList.create({
        data: {
          status: status,
          name: name
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
    const emailList =
      await prisma.emailList.findFirst({
        where: {
          name: name
        }
      })

    // Return
    return emailList
  }

  async getById(
    prisma: PrismaClient,
    id: string) {

    // Debug
    const fnName = `${this.clName}.getById()`

    // Query
    const emailList =
      await prisma.emailList.findUnique({
        where: {
          id: id
        }
      })

    // Return
    return emailList
  }

  async update(
    prisma: PrismaClient,
    id: string,
    status: string | undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Update record
    try {
      return await prisma.emailList.update({
        data: {
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
    name: string | undefined,
    status: string | undefined) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // If id isn't specified, but the unique keys are, try to get the record
    if (id == null &&
        name != null) {

      const emailList = await
        this.getByName(
          prisma,
          name)

      if (emailList != null) {
        id = emailList.id
      }
    }

    // Upsert
    if (id == null) {

      // Validate for create (mainly for type validation of the create call)
      if (name == null) {
        console.error(`${fnName}: id is null and name is null`)
        throw 'Prisma error'
      }

      if (status == null) {
        console.error(`${fnName}: id is null and status is null`)
        throw 'Prisma error'
      }

      // Create
      return await
        this.create(
          prisma,
          status,
          name)
    } else {

      // Update
      return await
        this.update(
          prisma,
          id,
          status)
    }
  }
}
