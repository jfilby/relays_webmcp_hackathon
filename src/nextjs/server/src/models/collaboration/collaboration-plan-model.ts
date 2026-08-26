import { PrismaClient } from '@/generated/prisma/client'

export class CollaborationPlanModel {

  // Consts
  clName = 'CollaborationPlanModel'

  // Code
  async create(
    prisma: PrismaClient,
    createdByProfileId: string,
    projectId: string,
    status: string,
    title: string,
    targetProfileId: string | undefined = undefined,
    description: string | undefined = undefined,
    startBy: Date | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.collaborationPlan.create({
        data: {
          createdByProfileId: createdByProfileId,
          projectId: projectId,
          targetProfileId: targetProfileId,
          status: status,
          title: title,
          description: description,
          startBy: startBy
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
      return await prisma.collaborationPlan.findUnique({
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
    projectId: string | undefined = undefined,
    targetProfileId: string | undefined = undefined,
    status: string | undefined = undefined,
    createdByProfileId: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.collaborationPlan.findMany({
        where: {
          projectId: projectId,
          targetProfileId: targetProfileId,
          status: status,
          createdByProfileId: createdByProfileId
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
    targetProfileId: string | undefined,
    status: string | undefined,
    title: string | undefined,
    description: string | undefined,
    startBy: Date | undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Update record
    try {
      return await prisma.collaborationPlan.update({
        data: {
          targetProfileId: targetProfileId,
          status: status,
          title: title,
          description: description,
          startBy: startBy
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

  // Update the status of a collaboration plan (e.g. accept or cancel it).
  async setStatus(
    prisma: PrismaClient,
    id: string,
    status: string) {

    // Debug
    const fnName = `${this.clName}.setStatus()`

    // Update record
    try {
      return await prisma.collaborationPlan.update({
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
      return await prisma.collaborationPlan.delete({
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