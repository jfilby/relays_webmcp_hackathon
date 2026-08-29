import { PrismaClient } from '@/generated/prisma/client'
import type { Prisma } from '@/generated/prisma/client'

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

  // List steps of a plan, ordered by sequence. `seqGt` restricts to steps
  // after the given sequence number.
  async filter(
    prisma: PrismaClient,
    planId: string | undefined = undefined,
    status: string | undefined = undefined,
    seqGt: number | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Build the filter
    const where: Prisma.PlanStepWhereInput = {}

    if (planId != null) {
      where.planId = planId
    }

    if (status != null) {
      where.status = status
    }

    if (seqGt != null) {
      where.seq = {
        gt: seqGt
      }
    }

    // Query
    try {
      return await prisma.planStep.findMany({
        where: where,
        orderBy: {
          seq: 'asc'
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  // Get the highest sequence number among a plan's steps (0 when it has none)
  async getMaxSeqByPlanId(
    prisma: PrismaClient,
    planId: string) {

    // Debug
    const fnName = `${this.clName}.getMaxSeqByPlanId()`

    // Query
    try {
      const aggregate = await prisma.planStep.aggregate({
        where: {
          planId: planId
        },
        _max: {
          seq: true
        }
      })

      // Return
      return aggregate._max.seq ?? 0
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

  async upsert(
    prisma: PrismaClient,
    id: string | undefined,
    planId: string | undefined,
    seq: number | undefined,
    title: string | undefined,
    description: string | undefined,
    status: string | undefined) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // If id isn't specified, but the unique keys are, try to get the record
    if (id == null &&
        planId != null &&
        seq != null) {

      const planStep = await
        this.getByPlanIdAndSeq(
          prisma,
          planId,
          seq)

      if (planStep != null) {
        id = planStep.id
      }
    }

    // Upsert
    if (id == null) {

      // Validate for create (mainly for type validation of the create call)
      if (planId == null) {
        console.error(`${fnName}: id is null and planId is null`)
        throw 'Prisma error'
      }

      if (seq == null) {
        console.error(`${fnName}: id is null and seq is null`)
        throw 'Prisma error'
      }

      if (title == null) {
        console.error(`${fnName}: id is null and title is null`)
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
          planId,
          seq,
          title,
          status,
          description)
    } else {

      // Update. Note: seq is not updated (steps are located by planId + seq)
      return await
        this.update(
          prisma,
          id,
          undefined,
          title,
          description,
          status)
    }
  }
}
