import { BatchJobStatuses } from '@/types/batch-types'

export class BatchJobModel {

  // Consts
  clName = 'BatchJobModel'

  // Code
  async create(
    prisma: any,
    instanceId: string | null,
    runInATransaction: boolean,
    status: string,
    statusReason: string | null,
    progressPct: number,
    message: string | null,
    jobType: string,
    refModel: string | null,
    refId: string | null,
    parameters: any | null,
    userProfileId: string) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.batchJob.create({
        data: {
          instance: instanceId != null ? {
            connect: {
              id: instanceId
            }
          } : undefined,
          runInATransaction: runInATransaction,
          status: status,
          statusReason: statusReason,
          progressPct: progressPct,
          message: message,
          jobType: jobType,
          refModel: refModel,
          refId: refId,
          parameters: parameters,
          userProfile: {
            connect: {
              id: userProfileId
            }
          }
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async deleteById(
    prisma: any,
    id: string) {

    // Debug
    const fnName = `${this.clName}.deleteById()`

    // Delete record
    try {
      return await prisma.batchJob.delete({
        where: {
          id: id
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async deleteByInstanceId(
    prisma: any,
    instanceId: string) {

    // Debug
    const fnName = `${this.clName}.deleteByInstanceId()`

    // Delete records
    try {
      return await prisma.batchJob.deleteMany({
        where: {
          instanceId: instanceId
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async updateAllByInstanceIdAndStatus(
    prisma: any,
    instanceId: string,
    status: string,
    statusReason: string | null | undefined,
    newStatus: string,
    newStatusReason: string | null) {

    // Debug
    const fnName = `${this.clName}.updateAllByInstanceIdAndStatus()`

    // Update records
    try {
      return await prisma.batchJob.updateMany({
        where: {
          instanceId: instanceId,
          status: status,
          statusReason: statusReason
        },
        data: {
          status: newStatus,
          statusReason: newStatusReason
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  async exists(
    prisma: any,
    instanceId: string | null,
    status: string,
    jobType: string,
    refModel: string,
    refId: string) {

    // Debug
    const fnName = `${this.clName}.exists()`

    var count = 0

    try {
      count = await prisma.batchJob.count({
        where: {
          instanceId: instanceId,
          status: status,
          jobType: jobType,
          refModel: refModel,
          refId: refId
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }

    if (count > 0) {
      return true
    } else {
      return false
    }
  }

  async filter(
    prisma: any,
    instanceId: string | null | undefined,
    statuses: string[] | undefined,
    jobType: string | undefined,
    refModel: string | null | undefined,
    refId: string | null | undefined,
    sortDesc: boolean = false,
    limitBy: number | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.filter()`

    // Order by
    var orderBy: any[] = []

    if (sortDesc === true) {

      orderBy = [
        {
          created: 'desc'
        }
      ]
    }

    // Query
    var batchJobs = undefined

    try {
      batchJobs = await prisma.batchJob.findMany({
        take: limitBy,
        where: {
          instanceId: instanceId,
          status: {
            in: statuses
          },
          jobType: jobType,
          refModel: refModel,
          refId: refId
        },
        orderBy: orderBy
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }

    // Debug
    // console.log(`${fnName}: batchJobs: ${JSON.stringify(batchJobs)}`)

    // Return
    return batchJobs
  }

  async getById(prisma: any,
    id: string) {

    // Debug
    const fnName = `${this.clName}.getById()`

    // Query
    var batchJob: any = null

    try {
      batchJob = await prisma.batchJob.findFirst({
        where: {
          id: id
        }
      })
    } catch (error: any) {
      if (!(error instanceof error.NotFound)) {
        console.error(`${fnName}: error: ${error}`)
        throw 'Prisma error'
      }
    }

    // Return
    return batchJob
  }

  async getByStatusesAndJobTypeAndRefModelAndRefId(
    prisma: any,
    instanceId: string | null,
    statuses: string[],
    jobType: string,
    refModel: string,
    refId: string | undefined,
    userProfileId: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.getByStatusesAndJobTypeAndRefModelAndRefId()`

    // Query
    var batchJobs = undefined

    try {
      batchJobs = await prisma.batchJob.findMany({
        where: {
          instanceId: instanceId,
          userProfileId: userProfileId,
          status: {
            in: statuses
          },
          jobType: jobType,
          refModel: refModel,
          refId: refId
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }

    // Debug
    // console.log(`${fnName}: batchJobs: ${JSON.stringify(batchJobs)}`)

    // Return
    return batchJobs
  }

  async getByInstanceAndStatus(
    prisma: any,
    instanceId: string | null | undefined,
    status: string | undefined,
    limitBy: number | undefined) {

    // Debug
    const fnName = `${this.clName}.getByInstanceAndStatus()`

    // Query
    var batchJobs = undefined

    try {
      batchJobs = await prisma.batchJob.findMany({
        where: {
          instanceId: instanceId,
          status: status
        },
        take: limitBy
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }

    // Debug
    // console.log(`${fnName}: batchJobs: ${JSON.stringify(batchJobs)}`)

    // Return
    return batchJobs
  }

  async getUniqueByStatus(
    prisma: any,
    instanceId: string | null | undefined,
    status: string | undefined,
    limitBy: number | undefined) {

    const records = await
      this.getByInstanceAndStatus(
        prisma,
        instanceId,
        status,
        limitBy)

    var uniqueRecords: any[] = []
    var uniqueSet = new Set<string>()

    for (const record of records) {

      // Records without a target (refId == null) can't be deduped by target:
      // each one is a distinct job. Collapsing them on a "null" key would
      // serialize unrelated jobs (e.g. every workflow job used to share
      // refId null), so keep all of them.
      if (record.refId == null) {
        uniqueRecords.push(record)
        continue
      }

      const key = `${record.jobType}-${record.refModel}-${record.refId}`

      if (uniqueSet.has(key)) {
        continue
      }

      uniqueSet.add(key)
      uniqueRecords.push(record)
    }

    return uniqueRecords
  }

  statusIsOngoing(status: string) {

    if (status === BatchJobStatuses.new ||
      status === BatchJobStatuses.active) {

      return true
    } else {
      return false
    }
  }

  async update(
    prisma: any,
    id: string | undefined,
    instanceId: string | null | undefined,
    runInATransaction: boolean | undefined,
    status: string | undefined,
    statusReason: string | null | undefined = undefined,
    progressPct: number | undefined = undefined,
    message: string | null | undefined = undefined,
    jobType: string | undefined = undefined,
    refModel: string | null | undefined = undefined,
    refId: string | null | undefined = undefined,
    parameters: any | undefined = undefined,
    userProfileId: string | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.update()`

    // Create record
    try {
      return await prisma.batchJob.update({
        data: {
          instanceId: instanceId,
          runInATransaction: runInATransaction,
          status: status,
          statusReason: statusReason,
          progressPct: progressPct,
          message: message,
          jobType: jobType,
          refModel: refModel,
          refId: refId,
          parameters: parameters,
          userProfileId: userProfileId
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

  async upsert(prisma: any,
    id: string | undefined,
    instanceId: string | null | undefined,
    runInATransaction: boolean | undefined,
    status: string | undefined,
    statusReason: string | null | undefined = undefined,
    progressPct: number | undefined,
    message: string | null | undefined,
    jobType: string | undefined,
    refModel: string | null | undefined,
    refId: string | null | undefined,
    parameters: any | null | undefined,
    userProfileId: string | undefined) {

    // Debug
    const fnName = `${this.clName}.upsert()`

    // Upsert
    if (id == null) {

      // Validate for create (mainly for type validation of the create call)
      if (instanceId === undefined) {
        console.error(`${fnName}: id is null and instanceId is undefined`)
        throw 'Prisma error'
      }

      if (runInATransaction == null) {
        console.error(`${fnName}: id is null and runInATransaction is null`)
        throw 'Prisma error'
      }

      if (status == null) {
        console.error(`${fnName}: id is null and status is null`)
        throw 'Prisma error'
      }

      if (statusReason === undefined) {
        console.error(`${fnName}: id is null and statusReason is undefined`)
        throw 'Prisma error'
      }

      if (progressPct == null) {
        console.error(`${fnName}: id is null and progressPct is null`)
        throw 'Prisma error'
      }

      if (message === undefined) {
        console.error(`${fnName}: id is null and message is undefined`)
        throw 'Prisma error'
      }

      if (jobType == null) {
        console.error(`${fnName}: id is null and jobType is null`)
        throw 'Prisma error'
      }

      if (refModel === undefined) {
        console.error(`${fnName}: id is null and refModel is undefined`)
        throw 'Prisma error'
      }

      if (refId === undefined) {
        console.error(`${fnName}: id is null and refId is undefined`)
        throw 'Prisma error'
      }

      if (parameters === undefined) {
        console.error(`${fnName}: id is null and parameters is undefined`)
        throw 'Prisma error'
      }

      if (userProfileId == null) {
        console.error(`${fnName}: id is null and userProfileId is null`)
        throw 'Prisma error'
      }

      // Create
      return await
        this.create(
          prisma,
          instanceId,
          runInATransaction,
          status,
          statusReason,
          progressPct,
          message,
          jobType,
          refModel,
          refId,
          parameters,
          userProfileId)
    } else {

      // Update
      return await
        this.update(
          prisma,
          id,
          instanceId,
          runInATransaction,
          status,
          statusReason,
          progressPct,
          message,
          jobType,
          refModel,
          refId,
          parameters,
          userProfileId)
    }
  }
}
