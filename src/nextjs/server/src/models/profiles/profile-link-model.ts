import { PrismaClient } from '@/generated/prisma/client'

export class ProfileLinkModel {

  // Consts
  clName = 'ProfileLinkModel'

  // Code
  async create(
    prisma: PrismaClient,
    profileId: string,
    kind: string,
    url: string,
    handle: string | undefined = undefined,
    isVerified: boolean = false) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.profileLink.create({
        data: {
          profileId: profileId,
          kind: kind,
          url: url,
          handle: handle,
          isVerified: isVerified
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
      return await prisma.profileLink.findUnique({
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
    profileId: string | undefined = undefined,
    kind: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.profileLink.findMany({
        where: {
          profileId: profileId,
          kind: kind
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
    kind: string | undefined,
    url: string | undefined,
    handle: string | undefined,
    isVerified: boolean | undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Update record
    try {
      return await prisma.profileLink.update({
        data: {
          kind: kind,
          url: url,
          handle: handle,
          isVerified: isVerified
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
      return await prisma.profileLink.delete({
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
