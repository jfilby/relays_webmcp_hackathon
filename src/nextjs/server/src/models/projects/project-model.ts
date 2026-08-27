import { PrismaClient } from '@/generated/prisma/client'

export class ProjectModel {

  // Consts
  clName = 'ProjectModel'

  // Code
  async create(
    prisma: PrismaClient,
    instanceId: string,
    isPromoted: boolean,
    status: string,
    organizationId: string | undefined = undefined,
    tagline: string | undefined = undefined,
    description: string | undefined = undefined,
    image: string | undefined = undefined,
    techStack: string[] = [],
    stage: string | undefined = undefined,
    isOpenToCollaborators: boolean = false) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.project.create({
        data: {
          instanceId: instanceId,
          organizationId: organizationId,
          tagline: tagline,
          description: description,
          image: image,
          techStack: techStack,
          stage: stage,
          isOpenToCollaborators: isOpenToCollaborators,
          isPromoted: isPromoted,
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
      return await prisma.project.findUnique({
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByInstanceId(
    prisma: PrismaClient,
    instanceId: string) {

    // Debug
    const fnName = `${this.clName}.getByInstanceId()`

    // Query
    try {
      return await prisma.project.findUnique({
        where: {
          instanceId: instanceId
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async filter(
    prisma: PrismaClient,
    status: string | undefined = undefined,
    isPromoted: boolean | undefined = undefined,
    organizationId: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.project.findMany({
        where: {
          status: status,
          isPromoted: isPromoted,
          organizationId: organizationId
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
    organizationId: string | undefined,
    tagline: string | undefined,
    description: string | undefined,
    image: string | undefined,
    techStack: string[] | undefined,
    stage: string | undefined,
    isOpenToCollaborators: boolean | undefined,
    isPromoted: boolean | undefined,
    status: string | undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Update record
    try {
      return await prisma.project.update({
        data: {
          organizationId: organizationId,
          tagline: tagline,
          description: description,
          image: image,
          techStack: techStack,
          stage: stage,
          isOpenToCollaborators: isOpenToCollaborators,
          isPromoted: isPromoted,
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
      return await prisma.project.delete({
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