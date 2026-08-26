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
}