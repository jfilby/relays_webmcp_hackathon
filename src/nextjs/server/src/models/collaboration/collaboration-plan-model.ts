import { PrismaClient } from '@/generated/prisma/client'
import type { Prisma } from '@/generated/prisma/client'

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
    targetProfileId: string | null | undefined = undefined,
    description: string | undefined = undefined,
    startBy: Date | null | undefined = undefined,
    rolesNeeded: string[] = [],
    commitmentLevel: string | undefined = undefined,
    compensation: string | undefined = undefined,
    deliverables: string | undefined = undefined) {

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
          startBy: startBy,
          rolesNeeded: rolesNeeded,
          commitmentLevel: commitmentLevel,
          compensation: compensation,
          deliverables: deliverables
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

  // List plans. `profileId` matches plans the profile created or is targeted
  // by; the other filters are exact matches.
  async filter(
    prisma: PrismaClient,
    projectId: string | undefined = undefined,
    profileId: string | undefined = undefined,
    status: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Build the filter
    const where: Prisma.CollaborationPlanWhereInput = {}

    if (projectId != null) {
      where.projectId = projectId
    }

    if (status != null) {
      where.status = status
    }

    if (profileId != null) {
      // The viewer sees plans they created or are targeted by
      where.OR = [
        { createdByProfileId: profileId },
        { targetProfileId: profileId }
      ]
    }

    // Query
    try {
      return await prisma.collaborationPlan.findMany({
        where: where,
        orderBy: {
          created: 'desc'
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
    targetProfileId: string | null | undefined,
    status: string | undefined,
    title: string | undefined,
    description: string | null | undefined,
    startBy: Date | null | undefined,
    rolesNeeded: string[] | undefined,
    commitmentLevel: string | null | undefined,
    compensation: string | null | undefined,
    deliverables: string | null | undefined,
    completedAt: Date | null | undefined,
    createdByProfileId: string | undefined = undefined) {

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
          startBy: startBy,
          rolesNeeded: rolesNeeded,
          commitmentLevel: commitmentLevel,
          compensation: compensation,
          deliverables: deliverables,
          createdByProfileId: createdByProfileId,
          completedAt: completedAt
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

  async getByProjectIdAndTitle(
    prisma: PrismaClient,
    projectId: string,
    title: string) {

    // Debug
    const fnName = `${this.clName}.getByProjectIdAndTitle()`

    // Query
    try {
      return await prisma.collaborationPlan.findFirst({
        where: {
          projectId: projectId,
          title: title
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }
}