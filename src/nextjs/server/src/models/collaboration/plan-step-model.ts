import { PrismaClient } from '@/generated/prisma/client'

export class PlanStepModel {

  // Consts
  clName = 'PlanStepModel'

  // Code
  async create(
    prisma: PrismaClient,
    planId: string,
    seq: number,
    title: string,
    status: string,
    description: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.planStep.create({
        data: {
          planId: planId,
          seq: seq,
          title: title,
          status: status,
          description: description
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
      return await prisma.planStep.findUnique({
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async getByPlanIdAndSeq(
    prisma: PrismaClient,
    planId: string,
    seq: number) {

    // Debug
    const fnName = `${this.clName}.getByPlanIdAndSeq()`

    // Query
    try {
      return await prisma.planStep.findUnique({
        where: {
          planId_seq: {
            planId: planId,
            seq: seq
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
    planId: string | undefined = undefined,
    status: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Query
    try {
      return await prisma.planStep.findMany({
        where: {
          planId: planId,
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
    seq: number | undefined,
    title: string | undefined,
    description: string | undefined,
    status: string | undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Update record
    try {
      return await prisma.planStep.update({
        data: {
          seq: seq,
          title: title,
          description: description,
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
      return await prisma.planStep.delete({
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
