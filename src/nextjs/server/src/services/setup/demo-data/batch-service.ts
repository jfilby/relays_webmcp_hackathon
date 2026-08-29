import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes } from '@/types/demo-data-types'
import { CoreDemoDataSetupService } from './core-service'

// Services
const coreDemoDataService = new CoreDemoDataSetupService()

// Class
// Upserts demo batch jobs. BatchJob has no unique constraint, so jobs are
// located by jobType + refModel + refId.

export class BatchDemoDataSetupService {

  // Consts
  clName = 'BatchDemoDataSetupService'

  // Code
  async setup(prisma: PrismaClient) {

    // Debug
    const fnName = `${this.clName}.setup()`

    // Upsert batch jobs
    for (const data of DemoDataTypes.batchJobs) {
      const instanceId = data.instanceKey != null ?
        (await coreDemoDataService.getInstanceByKey(
          prisma,
          data.instanceKey)).id :
        null
      const userProfileId = data.userProfileKey != null ?
        (await coreDemoDataService.getUserProfileByKey(
          prisma,
          data.userProfileKey)).id :
        undefined
      const parameters = data.parameters != null ?
        JSON.stringify(data.parameters) :
        null

      const existing = await prisma.batchJob.findFirst({
        where: {
          jobType: data.jobType,
          refModel: data.refModel ?? null,
          refId: data.refId ?? null
        }
      })

      if (existing == null) {
        await prisma.batchJob.create({
          data: {
            instanceId: instanceId,
            userProfileId: userProfileId,
            runInATransaction: data.runInATransaction,
            status: data.status,
            statusReason: data.statusReason,
            progressPct: data.progressPct,
            message: data.message,
            jobType: data.jobType,
            refModel: data.refModel,
            refId: data.refId,
            parameters: parameters
          }
        })
      } else {
        await prisma.batchJob.update({
          where: {
            id: existing.id
          },
          data: {
            runInATransaction: data.runInATransaction,
            status: data.status,
            statusReason: data.statusReason,
            progressPct: data.progressPct,
            message: data.message,
            parameters: parameters
          }
        })
      }
    }
  }
}
