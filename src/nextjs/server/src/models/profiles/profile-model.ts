import { PrismaClient } from '@/generated/prisma/client'

export class ProfileModel {

  // Consts
  clName = 'ProfileModel'

  // Code
  async create(
    prisma: PrismaClient,
    userProfileId: string,
    type: string,
    status: string,
    displayName: string,
    isPublic: boolean,
    headline: string | undefined = undefined,
    bio: string | undefined = undefined,
    location: string | undefined = undefined,
    website: string | undefined = undefined,
    avatar: string | undefined = undefined,
    availabilityStatus: string = 'A',
    isVerified: boolean = false,
    verifiedAt: Date | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.profile.create({
        data: {
          userProfileId: userProfileId,
          type: type,
          status: status,
          displayName: displayName,
          isPublic: isPublic,
          headline: headline,
          bio: bio,
          location: location,
          website: website,
          avatar: avatar,
          availabilityStatus: availabilityStatus,
          isVerified: isVerified,
          verifiedAt: verifiedAt
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
      return await prisma.profile.findUnique({
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByUserProfileId(
    prisma: PrismaClient,
    userProfileId: string) {

    // Debug
    const fnName = `${this.clName}.getByUserProfileId()`

    // Validate
    if (userProfileId == null) {
      console.error(`${fnName}: userProfileId == null`)
      throw 'Validation error'
    }

    // Query
    try {
      return await prisma.profile.findUnique({
        where: {
          userProfileId: userProfileId
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
    type: string | undefined,
    status: string | undefined,
    displayName: string | undefined,
    isPublic: boolean | undefined,
    headline: string | undefined,
    bio: string | undefined,
    location: string | undefined,
    website: string | undefined,
    avatar: string | undefined,
    availabilityStatus: string | undefined,
    isVerified: boolean | undefined,
    verifiedAt: Date | undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Update record
    try {
      return await prisma.profile.update({
        data: {
          type: type,
          status: status,
          displayName: displayName,
          isPublic: isPublic,
          headline: headline,
          bio: bio,
          location: location,
          website: website,
          avatar: avatar,
          availabilityStatus: availabilityStatus,
          isVerified: isVerified,
          verifiedAt: verifiedAt
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
      return await prisma.profile.delete({
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