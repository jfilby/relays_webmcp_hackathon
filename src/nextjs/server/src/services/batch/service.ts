import { CustomError } from 'serene-core-server'
import { Prisma, PrismaClient, BatchJob } from '@/generated/prisma/client'
import { BatchJobStatuses } from '@/types/batch-types'
import { BatchJobModel } from '@/models/batch/batch-job-model'
import { HousekeepingService } from '@/services/batch/housekeeping/service'

// Services
const housekeepingService = new HousekeepingService()

// Class
export class BatchService {

  // Consts
  clName = 'BatchService'

  // Settings
  concurrentJobs = 4
  sleepSeconds = 1

  // Consts
  seconds10InMs = 10 * 1000
  minutes5InMs = 5 * 60 * 1000
  minutes15InMs = 15 * 60 * 1000
  hours1InMs = 1000 * 60 * 60

  // Code
  async dispatchBatchJobByType(
    prismaForJob: Prisma.TransactionClient,
    batchJobModelQuery: any,
    batchJob: any) {

    // Debug
    const fnName = 'dispatchBatchJobByType()'

    // Get parameters
    console.log(`${fnName}: batchJob: ` + JSON.stringify(batchJob))
    console.log(`${fnName}: parameters: ` + JSON.stringify(batchJob.parameters))

    // Dispatch by job type
    try {

      switch (batchJob.jobType) {

        default: {
          return {
            status: false,
            message: `Unhandled jobType: ${batchJob.jobType}`
          }
        }
      }
    } catch (error) {
      if (error instanceof CustomError) {
        return {
          status: false,
          message: error.message
        }
      } else {
        return {
          status: false,
          message: `Unexpected error: ${error}`
        }
      }
    }
  }

  async interval10s(prisma: PrismaClient) {

    // Debug
    const fnName = 'interval10s'

    // console.log(`${fnName}: starting..`)
  }

  async interval5m(prisma: PrismaClient) {

    // Debug
    const fnName = 'interval15m'

    // console.log(`${fnName}: starting..`)
  }

  async interval15m(prisma: PrismaClient) {

    // Debug
    const fnName = 'interval15m'

    // console.log(`${fnName}: starting..`)

    // Housekeeping
    await housekeepingService.run(prisma)
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // console.log(`${fnName}: starting..`)

  async run(prisma: PrismaClient) {

    // Vars
    var lastInterval10s = new Date().getTime()
    var lastInterval5m = new Date().getTime()
    var lastInterval15m = new Date().getTime()
    var lastInterval1d = new Date().getTime()

    // Models
    const batchJobModel = new BatchJobModel()

    // Immediate housekeeping (later runs will be every x minutes)
    await this.interval10s(prisma)
    await this.interval5m(prisma)
    await this.interval15m(prisma)

    // Batch loop
    while (true) {

      // Get pending batch jobs
      const batchJobsPending = await
        batchJobModel.getUniqueByStatus(
          prisma,
          undefined,
          BatchJobStatuses.new,
          this.concurrentJobs)

      // Debug
      // console.log(`${fnName}: batchJobsPending: ${batchJobsPending.length}`)

      // 10s interval
      if (new Date().getTime() - lastInterval10s >= this.seconds10InMs) {

        await this.interval10s(prisma)
        lastInterval10s = new Date().getTime()
      }

      // If there are no batch jobs to run, then perform housekeeping at 5m intervals
      if (batchJobsPending.length === 0) {

        if (new Date().getTime() - lastInterval5m >= this.minutes5InMs) {

          await this.interval5m(prisma)
          lastInterval5m = new Date().getTime()
        }
      }

      if (new Date().getTime() - lastInterval15m >= this.minutes15InMs) {

        await this.interval15m(prisma)
        lastInterval15m = new Date().getTime()
      }

      // Get batch jobs as promises to run
      const promises = batchJobsPending.map(async (batchJobPending: BatchJob) => {

        // Set the BatchJob status to active
        batchJobPending = await
          batchJobModel.update(
            prisma,
            batchJobPending.id,
            undefined,  // instanceId
            undefined,  // runInATransaction
            BatchJobStatuses.active,
            null)  // statusReason

        // Run by job type (running in a transaction is optional)
        var results: any = undefined

        if (batchJobPending.runInATransaction === true) {

          // Run in a transaction
          await prisma.$transaction(async (transactionPrisma: any) => {
            results = await
              this.dispatchBatchJobByType(
                transactionPrisma,
                batchJobModel,
                batchJobPending)
          },
            {
              maxWait: 5 * 60000, // default: 5m
              timeout: 5 * 60000, // default: 5m
              // isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
            })
        } else {

          // Run without a transaction
          results = await
            this.dispatchBatchJobByType(
              prisma,
              batchJobModel,
              batchJobPending)
        }

        // Handle returning results
        var status: string
        var message: string | null

        if (results.status === true) {
          status = BatchJobStatuses.completed
          message = null
        } else {
          status = BatchJobStatuses.failed
          message = results.message
        }

        await batchJobModel.upsert(
          prisma,
          batchJobPending.id,
          undefined,
          undefined,
          status,
          null,   // statusReason
          undefined,  // progressPct
          message,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined)
      })

      // Sleep 3s if no batch jobs were pending
      if (batchJobsPending.length === 0) {
        const seconds1 = 1000 * this.sleepSeconds
        await this.sleep(seconds1 * 3)
      }

      // Execute promises in parallel
      await Promise.all(promises)
    }
  }
}
