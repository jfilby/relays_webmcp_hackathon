import { Prisma, PrismaClient } from '@/generated/prisma/client'

export class ProjectModel {

  // Consts
  clName = 'ProjectModel'

  // Code
  async create(
    prisma: PrismaClient,
    instanceId: string,
    publicId: string,
    isPromoted: boolean,
    status: string,
    organizationId: string | null | undefined = undefined,
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
          publicId: publicId,
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
    id: string,
    withIncludes: boolean = false) {

    // Debug
    const fnName = `${this.clName}.getById()`

    // Query
    try {
      return await prisma.project.findUnique({
        include: {
          instance: withIncludes
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

  async getByPublicId(
    prisma: PrismaClient,
    publicId: string,
    withIncludes: boolean = false) {

    // Debug
    const fnName = `${this.clName}.getByPublicId()`

    // Query
    try {
      return await prisma.project.findUnique({
        include: {
          ofProjectUrls: withIncludes
        },
        where: {
          publicId: publicId
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async filterByIds(
    prisma: PrismaClient,
    ids: string[],
    withIncludes: boolean = false) {

    // Debug
    const fnName = `${this.clName}.filterByIds()`

    // Query
    try {
      return await prisma.project.findMany({
        include: {
          instance: withIncludes,
          ofProjectUrls: withIncludes
        },
        where: {
          id: {
            in: ids
          }
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

  // Filter projects.
  async filter(
    prisma: PrismaClient,
    status: string | undefined = undefined,
    isPromoted: boolean | undefined = undefined,
    organizationId: string | undefined = undefined,
    isPublic: boolean | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.project.findMany({
        include: {
          instance: true,
          ofProjectUrls: true
        },
        orderBy: {
          instance: {
            name: 'asc'
          }
        },
        where: {
          status: status,
          isPromoted: isPromoted,
          organizationId: organizationId,
          instance: isPublic === true ?
            {
              publicAccess: { not: null }
            } :
            undefined,
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  // Store the search embedding (pgvector). An undefined embedding clears the
  // column. The vector column is managed outside the Prisma schema, so this
  // is raw SQL.
  async updateEmbedding(
    prisma: PrismaClient,
    id: string,
    embedding: number[] | undefined) {

    // Debug
    const fnName = `${this.clName}.updateEmbedding()`

    // Query
    try {
      await prisma.$executeRaw(
        Prisma.sql`UPDATE public."project"
          SET embedding = ${embedding != null ? `[${embedding.join(',')}]` : null}::vector
          WHERE id = ${id}`)
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async update(
    prisma: PrismaClient,
    id: string,
    organizationId: string | null | undefined,
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

  async upsert(
    prisma: PrismaClient,
    id: string | undefined,
    publicId: string,
    instanceId: string,
    isPromoted: boolean,
    status: string,
    organizationId: string | null | undefined = undefined,
    tagline: string | undefined = undefined,
    description: string | undefined = undefined,
    image: string | undefined = undefined,
    techStack: string[] = [],
    stage: string | undefined = undefined,
    isOpenToCollaborators: boolean = false) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // If id isn't specified, but the unique keys are, try to get the record
    if (id == null &&
        publicId != null) {

      const project = await
        this.getByPublicId(
          prisma,
          publicId)

      if (project != null) {
        id = project.id
      }
    }

    // Upsert
    if (id == null) {

      // Validate for create (mainly for type validation of the create call)
      if (publicId == null) {
        console.error(`${fnName}: id is null and publicId is null`)
        throw 'Prisma error'
      }

      if (instanceId == null) {
        console.error(`${fnName}: id is null and instanceId is null`)
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
          instanceId,
          publicId,
          isPromoted,
          status,
          organizationId,
          tagline,
          description,
          image,
          techStack,
          stage,
          isOpenToCollaborators)
    } else {

      // Update
      return await
        this.update(
          prisma,
          id,
          organizationId,
          tagline,
          description,
          image,
          techStack,
          stage,
          isOpenToCollaborators,
          isPromoted,
          status)
    }
  }
}