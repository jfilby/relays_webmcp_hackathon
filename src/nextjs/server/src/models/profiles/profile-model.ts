import { PrismaClient } from '@/generated/prisma/client'
import { Prisma } from '@/generated/prisma/client'
import { PublicIdService } from '@/services/utils/public-id-service'

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
          publicId: PublicIdService.generate(displayName),
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

  async getByPublicId(
    prisma: PrismaClient,
    publicId: string) {

    // Debug
    const fnName = `${this.clName}.getByPublicId()`

    // Query
    try {
      return await prisma.profile.findUnique({
        where: {
          publicId: publicId
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
    verifiedAt: Date | null | undefined) {

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

  // Filter profiles.
  async filter(
    prisma: PrismaClient,
    isPublic: boolean | undefined = undefined,
    status: string | undefined = undefined,
    type: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Build the query
    const where: Prisma.ProfileWhereInput = {}

    if (isPublic != null) {
      where.isPublic = isPublic
    }

    if (status != null) {
      where.status = status
    }

    if (type != null) {
      where.type = type
    }

    // Query
    try {
      return await prisma.profile.findMany({
        where: where,
        orderBy: {
          displayName: 'asc'
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
        Prisma.sql`UPDATE public."profile"
          SET embedding = ${embedding != null ? `[${embedding.join(',')}]` : null}::vector
          WHERE id = ${id}`)
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByIds(
    prisma: PrismaClient,
    ids: string[]) {

    // Debug
    const fnName = `${this.clName}.getByIds()`

    // Query
    try {
      return await prisma.profile.findMany({
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

  async upsert(
    prisma: PrismaClient,
    id: string | undefined,
    publicId: string | undefined,
    userProfileId: string | undefined,
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
    verifiedAt: Date | null | undefined) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // If id isn't specified, but the unique keys are, try to get the record
    if (id == null &&
        publicId != null) {

      const profile = await
        this.getByPublicId(
          prisma,
          publicId)

      if (profile != null) {
        id = profile.id
      }
    }

    // Upsert
    if (id == null) {

      // Validate for create (mainly for type validation of the create call)
      if (publicId == null) {
        console.error(`${fnName}: id is null and publicId is null`)
        throw 'Prisma error'
      }

      if (userProfileId == null) {
        console.error(`${fnName}: id is null and userProfileId is null`)
        throw 'Prisma error'
      }

      if (type == null) {
        console.error(`${fnName}: id is null and type is null`)
        throw 'Prisma error'
      }

      if (status == null) {
        console.error(`${fnName}: id is null and status is null`)
        throw 'Prisma error'
      }

      if (displayName == null) {
        console.error(`${fnName}: id is null and displayName is null`)
        throw 'Prisma error'
      }

      // Create. Note: an explicit publicId is used (create() generates one)
      try {
        return await prisma.profile.create({
          data: {
            publicId: publicId,
            userProfileId: userProfileId,
            type: type,
            status: status,
            displayName: displayName,
            isPublic: isPublic ?? true,
            headline: headline,
            bio: bio,
            location: location,
            website: website,
            avatar: avatar,
            availabilityStatus: availabilityStatus ?? 'A',
            isVerified: isVerified ?? false,
            verifiedAt: verifiedAt
          }
        })
      } catch (error) {
        console.error(`${fnName}: error: ${error}`)
        throw 'Prisma error'
      }
    } else {

      // Update
      return await
        this.update(
          prisma,
          id,
          type,
          status,
          displayName,
          isPublic,
          headline,
          bio,
          location,
          website,
          avatar,
          availabilityStatus,
          isVerified,
          verifiedAt)
    }
  }
}