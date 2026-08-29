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

  async getByProfileId(
    prisma: PrismaClient,
    profileId: string) {

    // Debug
    const fnName = `${this.clName}.getByProfileId()`

    // Query
    try {
      return await prisma.profileLink.findMany({
        where: {
          profileId: profileId
        },
        orderBy: {
          created: 'asc'
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByProfileIdAndUrl(
    prisma: PrismaClient,
    profileId: string,
    url: string) {

    // Debug
    const fnName = `${this.clName}.getByProfileIdAndUrl()`

    // Query
    try {
      return await prisma.profileLink.findUnique({
        where: {
          profileId_url: {
            profileId: profileId,
            url: url
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

  async upsert(
    prisma: PrismaClient,
    id: string | undefined,
    profileId: string | undefined,
    kind: string | undefined,
    url: string | undefined,
    handle: string | undefined,
    isVerified: boolean | undefined) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // If id isn't specified, but the unique keys are, try to get the record
    if (id == null &&
        profileId != null &&
        url != null) {

      const profileLink = await
        this.getByProfileIdAndUrl(
          prisma,
          profileId,
          url)

      if (profileLink != null) {
        id = profileLink.id
      }
    }

    // Upsert
    if (id == null) {

      // Validate for create (mainly for type validation of the create call)
      if (profileId == null) {
        console.error(`${fnName}: id is null and profileId is null`)
        throw 'Prisma error'
      }

      if (kind == null) {
        console.error(`${fnName}: id is null and kind is null`)
        throw 'Prisma error'
      }

      if (url == null) {
        console.error(`${fnName}: id is null and url is null`)
        throw 'Prisma error'
      }

      // Create
      return await
        this.create(
          prisma,
          profileId,
          kind,
          url,
          handle,
          isVerified ?? false)
    } else {

      // Update
      return await
        this.update(
          prisma,
          id,
          kind,
          url,
          handle,
          isVerified)
    }
  }
}
