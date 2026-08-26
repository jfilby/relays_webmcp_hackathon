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
}