import { PrismaClient } from '@/generated/prisma/client'

export class EmailListUserModel {

  // Consts
  clName = 'EmailListUserModel'

  // Code
  async createByUserProfileId(
    prisma: PrismaClient,
    emailListId: string,
    userProfileId: string) {

    // Debug
    const fnName = `${this.clName}.createByUserProfileId()`

    // Create record
    try {
      return await prisma.emailListUser.create({
        data: {
          emailListId: emailListId,
          userProfileId: userProfileId
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async createByEmail(
    prisma: PrismaClient,
    emailListId: string,
    email: string) {

    // Debug
    const fnName = `${this.clName}.createByEmail()`

    // Create record
    try {
      return await prisma.emailListUser.create({
        data: {
          emailListId: emailListId,
          email: email
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByUserProfileId(
    prisma: PrismaClient,
    emailListId: string,
    userProfileId: string) {

    // Debug
    const fnName = `${this.clName}.getByUserProfileId()`

    // Query
    const emailListUser =
      await prisma.emailListUser.findFirst({
        where: {
          emailListId: emailListId,
          userProfileId: userProfileId
        }
      })

    // Return
    return emailListUser
  }

  async getByEmail(
    prisma: PrismaClient,
    emailListId: string,
    email: string) {

    // Debug
    const fnName = `${this.clName}.getByEmail()`

    // Query
    const emailListUser =
      await prisma.emailListUser.findFirst({
        where: {
          emailListId: emailListId,
          email: email
        }
      })

    // Return
    return emailListUser
  }

  async deleteById(
    prisma: PrismaClient,
    id: string) {

    // Debug
    const fnName = `${this.clName}.deleteById()`

    // Delete
    try {
      return await prisma.emailListUser.delete({
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async upsertByUserProfileId(
    prisma: PrismaClient,
    emailListId: string,
    userProfileId: string) {

    // Debug
    const fnName = `${this.clName}.upsertByUserProfileId()`

    // If the record already exists, return it (no mutable fields beyond the
    // unique keys)
    const emailListUser = await
      this.getByUserProfileId(
        prisma,
        emailListId,
        userProfileId)

    if (emailListUser != null) {
      return emailListUser
    }

    // Create
    return await
      this.createByUserProfileId(
        prisma,
        emailListId,
        userProfileId)
  }

  async upsertByEmail(
    prisma: PrismaClient,
    emailListId: string,
    email: string) {

    // Debug
    const fnName = `${this.clName}.upsertByEmail()`

    // If the record already exists, return it (no mutable fields beyond the
    // unique keys)
    const emailListUser = await
      this.getByEmail(
        prisma,
        emailListId,
        email)

    if (emailListUser != null) {
      return emailListUser
    }

    // Create
    return await
      this.createByEmail(
        prisma,
        emailListId,
        email)
  }
}