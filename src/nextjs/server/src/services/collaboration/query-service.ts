import { PrismaClient } from '@/generated/prisma/client'
import type { Prisma, CollaborationPlan } from '@/generated/prisma/client'

// Class
export class CollaborationQueryService {

  // Consts
  clName = 'CollaborationQueryService'

  // Code
  // Get a plan by id with its project and participant names
  async getCollaborationPlanById(
    prisma: PrismaClient,
    id: string) {

    // Debug
    const fnName = `${this.clName}.getCollaborationPlanById()`

    // Query
    const plan = await
      prisma.collaborationPlan.findUnique({
        where: {
          id: id
        }
      })

    // Validate
    if (plan == null) {
      return {
        status: false,
        message: `Collaboration plan not found`
      }
    }

    // Enrich and return the single plan
    const plans = await
      this.toGraphQLPlans(
        prisma,
        [plan])

    // Return
    return {
      status: true,
      plan: plans[0]
    }
  }

  // List plans. Filters: by project, or all plans created by / targeted at a
  // user profile.
  async searchCollaborationPlans(
    prisma: PrismaClient,
    projectId: string | undefined,
    userProfileId: string | undefined) {

    // Debug
    const fnName = `${this.clName}.searchCollaborationPlans()`

    // Build the filter
    const where: Prisma.CollaborationPlanWhereInput = {}

    if (projectId != null) {
      where.projectId = projectId
    }

    if (userProfileId != null) {
      // Resolve the viewer's profile once; the viewer sees plans they created
      // or are targeted by
      const profile = await
        prisma.profile.findUnique({
          where: {
            userProfileId: userProfileId
          }
        })

      if (profile == null) {
        return {
          status: true,
          plans: []
        }
      }

      where.OR = [
        { createdByProfileId: profile.id },
        { targetProfileId: profile.id }
      ]
    }

    // Query
    const plans = await
      prisma.collaborationPlan.findMany({
        where: where,
        orderBy: {
          created: 'desc'
        }
      })

    // Return
    return {
      status: true,
      plans: await this.toGraphQLPlans(
        prisma,
        plans)
    }
  }

  // Get the steps of a plan, ordered by sequence
  async getPlanStepsByPlanId(
    prisma: PrismaClient,
    planId: string) {

    // Debug
    const fnName = `${this.clName}.getPlanStepsByPlanId()`

    // Query
    const steps = await
      prisma.planStep.findMany({
        where: {
          planId: planId
        },
        orderBy: {
          seq: 'asc'
        }
      })

    // Return
    return {
      status: true,
      steps: steps.map(step => ({
        id: step.id,
        planId: step.planId,
        seq: step.seq,
        title: step.title,
        description: step.description,
        status: step.status
      }))
    }
  }

  // Enrich plans with project/creator/target names for display
  async toGraphQLPlans(
    prisma: PrismaClient,
    plans: CollaborationPlan[]) {

    // Debug
    const fnName = `${this.clName}.toGraphQLPlans()`

    // Nothing to enrich
    if (plans.length === 0) {
      return []
    }

    // Collect the referenced ids
    const projectIds = [...new Set(plans.map(plan => plan.projectId))]
    const profileIds = [
      ...new Set([
        ...plans.map(plan => plan.createdByProfileId),
        ...plans
          .filter(plan => plan.targetProfileId != null)
          .map(plan => plan.targetProfileId as string)
      ])
    ]

    // Fetch the related records for display
    const projects = await
      prisma.project.findMany({
        where: {
          id: { in: projectIds }
        },
        include: {
          instance: true
        }
      })

    const profiles = await
      prisma.profile.findMany({
        where: {
          id: { in: profileIds }
        }
      })

    const projectNameByProjectId = new Map(
      projects.map(project => [project.id, project.instance.name]))
    const nameByProfileId = new Map(
      profiles.map(profile => [profile.id, profile.displayName]))

    // Map to the GraphQL shape (dates as ISO strings)
    return plans.map(plan => ({
      id: plan.id,
      projectId: plan.projectId,
      projectName: projectNameByProjectId.get(plan.projectId) ?? null,
      createdByProfileId: plan.createdByProfileId,
      createdByName: nameByProfileId.get(plan.createdByProfileId) ?? null,
      targetProfileId: plan.targetProfileId,
      targetName:
        plan.targetProfileId != null ?
          nameByProfileId.get(plan.targetProfileId) ?? null :
          null,
      status: plan.status,
      title: plan.title,
      description: plan.description,
      rolesNeeded: plan.rolesNeeded,
      commitmentLevel: plan.commitmentLevel,
      compensation: plan.compensation,
      deliverables: plan.deliverables,
      startBy: plan.startBy != null ? plan.startBy.toISOString() : null,
      completedAt:
        plan.completedAt != null ? plan.completedAt.toISOString() : null,
      created: plan.created.toISOString(),
      updated:
        plan.updated != null ? plan.updated.toISOString() : undefined
    }))
  }
}
