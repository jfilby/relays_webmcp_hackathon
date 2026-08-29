import { PrismaClient } from '@/generated/prisma/client'

export class ConnectionModel {

  // Consts
  clName = 'ConnectionModel'

  // Code
  async create(
    prisma: PrismaClient,
    fromProfileId: string,
    toProfileId: string,
    status: string,
    origin: string,
    message: string | null | undefined = undefined,
    acceptedAt: Date | null | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.connection.create({
        data: {
          fromProfileId: fromProfileId,
          toProfileId: toProfileId,
          status: status,
          origin: origin,
          message: message,
          acceptedAt: acceptedAt
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

  async getByToProfileIdAndStatus(
    prisma: PrismaClient,
    toProfileId: string,
    status: string) {

    // Debug
    const fnName = `${this.clName}.getByToProfileIdAndStatus()`

    // Query
    try {
      return await prisma.connection.findMany({
        where: {
          toProfileId: toProfileId,
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
    status: string | undefined,
    message: string | null | undefined,
    acceptedAt: Date | null | undefined,
    origin: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Update record
    try {
      return await prisma.connection.update({
        data: {
          status: status,
          message: message,
          acceptedAt: acceptedAt,
          origin: origin
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

  async upsert(
    prisma: PrismaClient,
    id: string | undefined,
    fromProfileId: string | undefined,
    toProfileId: string | undefined,
    status: string | undefined,
    origin: string | undefined,
    message: string | null | undefined,
    acceptedAt: Date | null | undefined) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // If id isn't specified, but the unique keys are, try to get the record
    if (id == null &&
        fromProfileId != null &&
        toProfileId != null) {

      const connection = await
        this.getByFromTo(
          prisma,
          fromProfileId,
          toProfileId)

      if (connection != null) {
        id = connection.id
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

      if (status == null) {
        console.error(`${fnName}: id is null and status is null`)
        throw 'Prisma error'
      }

      if (origin == null) {
        console.error(`${fnName}: id is null and origin is null`)
        throw 'Prisma error'
      }

      // Create
      return await
        this.create(
          prisma,
          fromProfileId,
          toProfileId,
          status,
          origin,
          message,
          acceptedAt)
    } else {

      // Update. Note: acceptedAt is only applied on create, so passing
      // undefined here leaves any existing value untouched
      return await
        this.update(
          prisma,
          id,
          status,
          message,
          undefined,
          origin)
    }
  }
}