import { PrismaClient } from '@/generated/prisma/client'

export class FlaggedInputModel {

  // Consts
  clName = 'FlaggedInputModel'

  // Code
  // Persists a record of a user-supplied input that the prompt guard
  // classified as malicious.
  async create(
    prisma: PrismaClient,
    createdById: string,
    instanceId: string | null,
    status: string,
    source: string,
    input: string,
    confidence: number) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.flaggedInput.create({
        data: {
          createdById: createdById,
          instanceId: instanceId,
          status: status,
          source: source,
          input: input,
          confidence: confidence
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }
}
