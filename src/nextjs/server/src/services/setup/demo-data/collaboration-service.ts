import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes } from '@/types/demo-data-types'
import { ProfilesDemoDataSetupService } from './profiles-service'
import { ProjectsDemoDataSetupService } from './projects-service'

// Models
import { CollaborationPlanModel } from '@/models/collaboration/collaboration-plan-model'
import { PlanStepModel } from '@/models/collaboration/plan-step-model'

// Services
const profilesDemoDataService = new ProfilesDemoDataSetupService()
const projectsDemoDataService = new ProjectsDemoDataSetupService()

// Models
const collaborationPlanModel = new CollaborationPlanModel()
const planStepModel = new PlanStepModel()

// Class
// Upserts demo collaboration plans and their steps. CollaborationPlan has no
// unique constraint, so plans are located by project + title.

export class CollaborationDemoDataSetupService {

  // Consts
  clName = 'CollaborationDemoDataSetupService'

  // Code
  async setup(prisma: PrismaClient) {

    // Debug
    const fnName = `${this.clName}.setup()`

    // Upsert plans
    for (const data of DemoDataTypes.collaborationPlans) {
      const createdByProfile = await profilesDemoDataService.getProfileByKey(
        prisma,
        data.createdByProfileKey)
      const project = await projectsDemoDataService.getProjectByKey(
        prisma,
        data.projectKey)
      const targetProfileId = data.targetProfileKey != null ?
        (await profilesDemoDataService.getProfileByKey(
          prisma,
          data.targetProfileKey)).id :
        null
      const startBy = data.startBy != null ? new Date(data.startBy) : null

      var plan = await collaborationPlanModel.getByProjectIdAndTitle(
        prisma,
        project.id,
        data.title)

      if (plan == null) {
        plan = await collaborationPlanModel.create(
          prisma,
          createdByProfile.id,
          project.id,
          data.status,
          data.title,
          targetProfileId ?? undefined,
          data.description,
          startBy,
          data.rolesNeeded ?? [],
          data.commitmentLevel,
          data.compensation,
          data.deliverables)
      } else {
        plan = await collaborationPlanModel.update(
          prisma,
          plan.id,
          targetProfileId,
          data.status,
          data.title,
          data.description,
          startBy,
          data.rolesNeeded ?? [],
          data.commitmentLevel,
          data.compensation,
          data.deliverables,
          undefined,  // completedAt
          createdByProfile.id)
      }

      // Upsert steps
      for (const step of data.steps ?? []) {
        await planStepModel.upsert(
          prisma,
          undefined,
          plan.id,
          step.seq,
          step.title,
          step.description,
          step.status)
      }
    }
  }
}
