import { PrismaClient } from '@/generated/prisma/client'

export class ProjectUrlModel {

  // Consts
  clName = 'ProjectUrlModel'

  // Code
  async create(
    prisma: PrismaClient,
    projectId: string,
    kind: string,
    url: string,
    label: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.projectUrl.create({
        data: {
          projectId: projectId,
          kind: kind,
          url: url,
          label: label
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
      return await prisma.projectUrl.findUnique({
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
    kind: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.projectUrl.findMany({
        where: {
          projectId: projectId,
          kind: kind
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByProjectAndUrl(
    prisma: PrismaClient,
    projectId: string,
    url: string) {

    // Debug
    const fnName = `${this.clName}.getByProjectAndUrl()`

    // Query
    try {
      return await prisma.projectUrl.findFirst({
        where: {
          projectId: projectId,
          url: url
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
    label: string | undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Update record
    try {
      return await prisma.projectUrl.update({
        data: {
          kind: kind,
          url: url,
          label: label
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
      return await prisma.projectUrl.delete({
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
    projectId: string,
    kind: string,
    url: string,
    label: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // If id isn't specified, but the unique keys are, try to get the record
    if (id == null &&
        projectId != null &&
        url != null) {

      const projectUrl = await
        this.getByProjectAndUrl(
          prisma,
          projectId,
          url)

      if (projectUrl != null) {
        id = projectUrl.id
      }
    }

    // Upsert
    if (id == null) {

      // Validate for create (mainly for type validation of the create call)
      if (projectId == null) {
        console.error(`${fnName}: id is null and projectId is null`)
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
          projectId,
          kind,
          url,
          label)
    } else {

      // Update
      return await
        this.update(
          prisma,
          id,
          kind,
          url,
          label)
    }
  }
}
