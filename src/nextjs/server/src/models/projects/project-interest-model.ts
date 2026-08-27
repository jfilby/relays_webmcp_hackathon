import { PrismaClient } from '@/generated/prisma/client'

export class ProjectInterestModel {

  // Consts
  clName = 'ProjectInterestModel'

  // Code
  async create(
    prisma: PrismaClient,
    profileId: string,
    projectId: string) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.projectInterest.create({
        data: {
          profileId: profileId,
          projectId: projectId
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
      return await prisma.projectInterest.findUnique({
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByProfileIdAndProjectId(
    prisma: PrismaClient,
    profileId: string,
    projectId: string) {

    // Debug
    const fnName = `${this.clName}.getByProfileIdAndProjectId()`

    // Query
    try {
      return await prisma.projectInterest.findUnique({
        where: {
          profileId_projectId: {
            profileId: profileId,
            projectId: projectId
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
    profileId: string | undefined = undefined,
    projectId: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.projectInterest.findMany({
        where: {
          profileId: profileId,
          projectId: projectId
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
      return await prisma.projectInterest.delete({
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
