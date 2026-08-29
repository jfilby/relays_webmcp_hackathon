import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes } from '@/types/demo-data-types'
import { ProfilesDemoDataSetupService } from './profiles-service'
import { ProjectsDemoDataSetupService } from './projects-service'

// Services
const profilesDemoDataService = new ProfilesDemoDataSetupService()
const projectsDemoDataService = new ProjectsDemoDataSetupService()

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

      var plan = await prisma.collaborationPlan.findFirst({
        where: {
          projectId: project.id,
          title: data.title
        }
      })

      if (plan == null) {
        plan = await prisma.collaborationPlan.create({
          data: {
            createdByProfileId: createdByProfile.id,
            projectId: project.id,
            targetProfileId: targetProfileId,
            status: data.status,
            title: data.title,
            description: data.description,
            rolesNeeded: data.rolesNeeded ?? [],
            commitmentLevel: data.commitmentLevel,
            compensation: data.compensation,
            deliverables: data.deliverables,
            startBy: data.startBy != null ? new Date(data.startBy) : null
          }
        })
      } else {
        plan = await prisma.collaborationPlan.update({
          where: {
            id: plan.id
          },
          data: {
            targetProfileId: targetProfileId,
            status: data.status,
            title: data.title,
            description: data.description,
            rolesNeeded: data.rolesNeeded ?? [],
            commitmentLevel: data.commitmentLevel,
            compensation: data.compensation,
            deliverables: data.deliverables,
            startBy: data.startBy != null ? new Date(data.startBy) : null
          }
        })
      }

      // Upsert steps
      for (const step of data.steps ?? []) {
        await prisma.planStep.upsert({
          where: {
            planId_seq: {
              planId: plan.id,
              seq: step.seq
            }
          },
          create: {
            planId: plan.id,
            seq: step.seq,
            title: step.title,
            description: step.description,
            status: step.status
          },
          update: {
            title: step.title,
            description: step.description,
            status: step.status
          }
        })
      }
    }
  }
}
