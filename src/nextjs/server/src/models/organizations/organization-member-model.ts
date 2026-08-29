import { PrismaClient } from '@/generated/prisma/client'

export class OrganizationMemberModel {

  // Consts
  clName = 'OrganizationMemberModel'

  // Code
  async create(
    prisma: PrismaClient,
    organizationId: string,
    profileId: string,
    role: string,
    status: string) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.organizationMember.create({
        data: {
          organizationId: organizationId,
          profileId: profileId,
          role: role,
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
      return await prisma.organizationMember.findUnique({
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByOrganizationAndProfile(
    prisma: PrismaClient,
    organizationId: string,
    profileId: string) {

    // Debug
    const fnName = `${this.clName}.getByOrganizationAndProfile()`

    // Query
    try {
      return await prisma.organizationMember.findUnique({
        where: {
          organizationId_profileId: {
            organizationId: organizationId,
            profileId: profileId
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
    organizationId: string | undefined = undefined,
    profileId: string | undefined = undefined,
    status: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.organizationMember.findMany({
        where: {
          organizationId: organizationId,
          profileId: profileId,
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
    role: string | undefined,
    status: string | undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Update record
    try {
      return await prisma.organizationMember.update({
        data: {
          role: role,
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
      return await prisma.organizationMember.delete({
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
    organizationId: string | undefined,
    profileId: string | undefined,
    role: string | undefined,
    status: string | undefined) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // If id isn't specified, but the unique keys are, try to get the record
    if (id == null &&
        organizationId != null &&
        profileId != null) {

      const organizationMember = await
        this.getByOrganizationAndProfile(
          prisma,
          organizationId,
          profileId)

      if (organizationMember != null) {
        id = organizationMember.id
      }
    }

    // Upsert
    if (id == null) {

      // Validate for create (mainly for type validation of the create call)
      if (organizationId == null) {
        console.error(`${fnName}: id is null and organizationId is null`)
        throw 'Prisma error'
      }

      if (profileId == null) {
        console.error(`${fnName}: id is null and profileId is null`)
        throw 'Prisma error'
      }

      if (role == null) {
        console.error(`${fnName}: id is null and role is null`)
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
          organizationId,
          profileId,
          role,
          status)
    } else {

      // Update
      return await
        this.update(
          prisma,
          id,
          role,
          status)
    }
  }
}