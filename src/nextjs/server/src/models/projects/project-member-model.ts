import { PrismaClient } from '@/generated/prisma/client'

export class ProjectMemberModel {

  // Consts
  clName = 'ProjectMemberModel'

  // Code
  async create(
    prisma: PrismaClient,
    projectId: string,
    profileId: string,
    role: string,
    status: string) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.projectMember.create({
        data: {
          projectId: projectId,
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
      return await prisma.projectMember.findUnique({
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByProjectAndProfile(
    prisma: PrismaClient,
    projectId: string,
    profileId: string) {

    // Debug
    const fnName = `${this.clName}.getByProjectAndProfile()`

    // Query
    try {
      return await prisma.projectMember.findUnique({
        where: {
          projectId_profileId: {
            projectId: projectId,
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
    projectId: string | undefined = undefined,
    profileId: string | undefined = undefined,
    status: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.projectMember.findMany({
        where: {
          projectId: projectId,
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
      return await prisma.projectMember.update({
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
      return await prisma.projectMember.delete({
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