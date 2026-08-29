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

  async countByProjectId(
    prisma: PrismaClient,
    projectId: string) {

    // Debug
    const fnName = `${this.clName}.countByProjectId()`

    // Count records
    try {
      return await prisma.projectInterest.count({
        where: {
          projectId: projectId
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async groupByCountByProjectIds(
    prisma: PrismaClient,
    projectIds: string[]) {

    // Debug
    const fnName = `${this.clName}.groupByCountByProjectIds()`

    // Group records
    try {
      return await prisma.projectInterest.groupBy({
        by: ['projectId'],
        where: {
          projectId: {
            in: projectIds
          }
        },
        _count: {
          projectId: true
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
    profileId: string,
    projectId: string) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // If id isn't specified, but the unique keys are, try to get the record
    if (id == null &&
        profileId != null &&
        projectId != null) {

      const projectInterest = await
        this.getByProfileIdAndProjectId(
          prisma,
          profileId,
          projectId)

      if (projectInterest != null) {
        return projectInterest
      }
    }

    // Upsert
    if (id == null) {

      // Validate for create (mainly for type validation of the create call)
      if (profileId == null) {
        console.error(`${fnName}: id is null and profileId is null`)
        throw 'Prisma error'
      }

      if (projectId == null) {
        console.error(`${fnName}: id is null and projectId is null`)
        throw 'Prisma error'
      }

      // Create
      return await
        this.create(
          prisma,
          profileId,
          projectId)
    } else {

      // Update
      // ProjectInterest has no mutable fields beyond its unique keys, so
      // return the existing record
      return await
        this.getById(
          prisma,
          id)
    }
  }
}
