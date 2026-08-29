import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes } from '@/types/demo-data-types'
import { CoreDemoDataSetupService } from './core-service'

// Models
import { BatchJobModel } from '@/models/batch/batch-job-model'

// Services
const coreDemoDataService = new CoreDemoDataSetupService()

// Models
const batchJobModel = new BatchJobModel()

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

      const existing = await batchJobModel.getByJobTypeAndRefModelAndRefId(
        prisma,
        data.jobType,
        data.refModel ?? null,
        data.refId ?? null)

      if (existing == null) {
        await batchJobModel.create(
          prisma,
          instanceId,
          data.runInATransaction,
          data.status,
          data.statusReason,
          data.progressPct,
          data.message,
          data.jobType,
          data.refModel,
          data.refId,
          parameters,
          userProfileId)
      } else {
        await batchJobModel.update(
          prisma,
          existing.id,
          instanceId,
          data.runInATransaction,
          data.status,
          data.statusReason,
          data.progressPct,
          data.message,
          undefined,  // jobType
          undefined,  // refModel
          undefined,  // refId
          parameters,
          userProfileId)
      }
    }
  }
}
