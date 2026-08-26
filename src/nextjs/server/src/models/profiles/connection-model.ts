import { PrismaClient } from '@/generated/prisma/client'

export class ConnectionModel {

  // Consts
  clName = 'ConnectionModel'

  // Code
  async create(
    prisma: PrismaClient,
    fromProfileId: string,
    toProfileId: string,
    status: string) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.connection.create({
        data: {
          fromProfileId: fromProfileId,
          toProfileId: toProfileId,
          status: status
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
      return await prisma.connection.findUnique({
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByFromTo(
    prisma: PrismaClient,
    fromProfileId: string,
    toProfileId: string) {

    // Debug
    const fnName = `${this.clName}.getByFromTo()`

    // Query
    try {
      return await prisma.connection.findUnique({
        where: {
          fromProfileId_toProfileId: {
            fromProfileId: fromProfileId,
            toProfileId: toProfileId
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
    fromProfileId: string | undefined = undefined,
    toProfileId: string | undefined = undefined,
    status: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.connection.findMany({
        where: {
          fromProfileId: fromProfileId,
          toProfileId: toProfileId,
          status: status
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
    status: string | undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Update record
    try {
      return await prisma.connection.update({
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

  async deleteById(
    prisma: PrismaClient,
    id: string) {

    // Debug
    const fnName = `${this.clName}.deleteById()`

    // Delete
    try {
      return await prisma.connection.delete({
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