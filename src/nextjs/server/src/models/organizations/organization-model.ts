import { PrismaClient } from '@/generated/prisma/client'

export class OrganizationModel {

  // Consts
  clName = 'OrganizationModel'

  // Code
  async create(
    prisma: PrismaClient,
    instanceId: string,
    name: string,
    status: string,
    website: string | undefined = undefined,
    description: string | undefined = undefined,
    logo: string | undefined = undefined,
    size: string | undefined = undefined,
    industry: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.organization.create({
        data: {
          instanceId: instanceId,
          name: name,
          status: status,
          website: website,
          description: description,
          logo: logo,
          size: size,
          industry: industry
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
      return await prisma.organization.findUnique({
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
      return await prisma.organization.findUnique({
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
    status: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.organization.findMany({
        where: {
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
    name: string | undefined,
    website: string | undefined,
    description: string | undefined,
    status: string | undefined,
    logo: string | undefined,
    size: string | undefined,
    industry: string | undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Update record
    try {
      return await prisma.organization.update({
        data: {
          name: name,
          website: website,
          description: description,
          status: status,
          logo: logo,
          size: size,
          industry: industry
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
      return await prisma.organization.delete({
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByName(
    prisma: PrismaClient,
    name: string) {

    // Debug
    const fnName = `${this.clName}.getByName()`

    // Query
    try {
      return await prisma.organization.findFirst({
        where: {
          name: name
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
    instanceId: string | undefined,
    name: string | undefined,
    website: string | undefined,
    description: string | undefined,
    logo: string | undefined,
    size: string | undefined,
    industry: string | undefined,
    status: string | undefined) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // If id isn't specified, but the unique keys are, try to get the record
    if (id == null &&
        instanceId != null) {

      const organization = await
        this.getByInstanceId(
          prisma,
          instanceId)

      if (organization != null) {
        id = organization.id
      }
    }

    // Upsert
    if (id == null) {

      // Validate for create (mainly for type validation of the create call)
      if (instanceId == null) {
        console.error(`${fnName}: id is null and instanceId is null`)
        throw 'Prisma error'
      }

      if (name == null) {
        console.error(`${fnName}: id is null and name is null`)
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
          name,
          status,
          website,
          description,
          logo,
          size,
          industry)
    } else {

      // Update
      return await
        this.update(
          prisma,
          id,
          name,
          website,
          description,
          status,
          logo,
          size,
          industry)
    }
  }
}