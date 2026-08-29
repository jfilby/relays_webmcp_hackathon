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
    status: string | undefined = undefined,
    role: string | undefined = undefined,
    withProjectIncludes: boolean = false) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.projectMember.findMany({
        include: {
          project: {
            include: {
              instance: withProjectIncludes,
              ofProjectUrls: withProjectIncludes
            }
          }
        },
        where: {
          projectId: projectId,
          profileId: profileId,
          status: status,
          role: role
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

  async deleteByProjectId(
    prisma: PrismaClient,
    projectId: string) {

    // Debug
    const fnName = `${this.clName}.deleteByProjectId()`

    // Delete records
    try {
      return await prisma.projectMember.deleteMany({
        where: {
          projectId: projectId
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
    profileId: string,
    role: string,
    status: string) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // If id isn't specified, but the unique keys are, try to get the record
    if (id == null &&
        projectId != null &&
        profileId != null) {

      const projectMember = await
        this.getByProjectAndProfile(
          prisma,
          projectId,
          profileId)

      if (projectMember != null) {
        id = projectMember.id
      }
    }

    // Upsert
    if (id == null) {

      // Validate for create (mainly for type validation of the create call)
      if (projectId == null) {
        console.error(`${fnName}: id is null and projectId is null`)
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
          projectId,
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