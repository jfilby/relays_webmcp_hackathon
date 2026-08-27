import { PrismaClient } from '@/generated/prisma/client'
import { CollaborationPlanModel } from '@/models/collaboration/collaboration-plan-model'
import { NotificationsService } from '@/services/notifications/service'

// Models
const collaborationPlanModel = new CollaborationPlanModel()

// Services
const notificationsService = new NotificationsService()

// Class
export class CollaborationMutateService {

  // Consts
  clName = 'CollaborationMutateService'

  // Plan statuses: D (draft), O (open), A (accepted), C (completed),
  // X (cancelled)
  validPlanStatuses = ['D', 'O', 'A', 'C', 'X']

  // Step statuses: P (pending), A (active), C (completed), X (skipped)
  validStepStatuses = ['P', 'A', 'C', 'X']

  // Commitment levels: H (hours/week), W (weeks), M (months)
  validCommitmentLevels = ['H', 'W', 'M']

  // Compensation: N (none), E (equity), P (paid)
  validCompensationOptions = ['N', 'E', 'P']

  // Code
  // Create a collaboration plan for a project
  async createPlan(
    prisma: PrismaClient,
    userProfileId: string,
    projectId: string,
    title: string,
    description: string | undefined,
    targetProfileId: string | undefined,
    rolesNeeded: string[],
    commitmentLevel: string | undefined,
    compensation: string | undefined,
    deliverables: string | undefined,
    startBy: Date | undefined) {

    // Debug
    const fnName = `${this.clName}.createPlan()`

    // Validate the title
    if (title == null || title.trim() === '') {
      return {
        status: false,
        message: `Title is required`
      }
    }

    // Resolve the creator's profile
    const creatorProfile = await
      prisma.profile.findUnique({
        where: {
          userProfileId: userProfileId
        }
      })

    if (creatorProfile == null) {
      return {
        status: false,
        message: `You need a profile to create a plan`
      }
    }

    // Validate the project exists
    const project = await
      prisma.project.findUnique({
        where: {
          id: projectId
        }
      })

    if (project == null) {
      return {
        status: false,
        message: `Project not found`
      }
    }

    // Validate the target, if given
    let resolvedTargetProfileId: string | undefined = undefined

    if (targetProfileId != null && targetProfileId.trim() !== '') {
      if (creatorProfile.id === targetProfileId.trim()) {
        return {
          status: false,
          message: `You can't target yourself`
        }
      }

      const targetProfile = await
        prisma.profile.findUnique({
          where: {
            id: targetProfileId.trim()
          }
        })

      if (targetProfile == null) {
        return {
          status: false,
          message: `Target profile not found`
        }
      }

      resolvedTargetProfileId = targetProfile.id
    }

    // Validate the commitment level and compensation
    if (commitmentLevel != null &&
        this.validCommitmentLevels.includes(commitmentLevel) === false) {
      return {
        status: false,
        message: `Invalid commitment level`
      }
    }

    if (compensation != null &&
        this.validCompensationOptions.includes(compensation) === false) {
      return {
        status: false,
        message: `Invalid compensation`
      }
    }

    // Create the plan (open by default)
    const plan = await
      collaborationPlanModel.create(
        prisma,
        creatorProfile.id,
        projectId,
        'O',
        title.trim(),
        resolvedTargetProfileId,
        description != null && description.trim() !== '' ? description.trim() : undefined,
        startBy,
        rolesNeeded != null ?
          rolesNeeded.filter(role => role.trim() !== '').map(role => role.trim()) :
          [],
        commitmentLevel != null && commitmentLevel.trim() !== '' ?
          commitmentLevel :
          undefined,
        compensation != null && compensation.trim() !== '' ? compensation : undefined,
        deliverables != null && deliverables.trim() !== '' ? deliverables.trim() : undefined)

    // Notify the target, if there is one
    if (resolvedTargetProfileId != null) {
      const target = await
        prisma.profile.findUnique({
          where: {
            id: resolvedTargetProfileId
          }
        })

      if (target != null) {
        await notificationsService.notify(
          prisma,
          target.userProfileId,
          'plan_targeted',
          'CollaborationPlan',
          plan.id)
      }
    }

    // Return
    return {
      status: true,
      message: `Collaboration plan created`,
      plan: {
        id: plan.id
      }
    }
  }

  // Update the details of a plan (its creator only)
  async updatePlan(
    prisma: PrismaClient,
    userProfileId: string,
    planId: string,
    title: string | undefined,
    description: string | undefined,
    rolesNeeded: string[] | undefined,
    commitmentLevel: string | undefined,
    compensation: string | undefined,
    deliverables: string | undefined,
    startBy: Date | undefined) {

    // Debug
    const fnName = `${this.clName}.updatePlan()`

    // Load the plan to verify ownership
    const existing = await
      prisma.collaborationPlan.findUnique({
        where: {
          id: planId
        }
      })

    if (existing == null) {
      return {
        status: false,
        message: `Collaboration plan not found`
      }
    }

    const isCreator = await
      this.isCreator(
        prisma,
        userProfileId,
        existing.createdByProfileId)

    if (isCreator === false) {
      return {
        status: false,
        message: `You can only edit your own plans`
      }
    }

    // Validate the provided values
    if (title != null &&
        (title.trim() === '' ||
          title.length > 100)) {
      return {
        status: false,
        message: `Title is required (max 100 characters)`
      }
    }

    if (commitmentLevel != null &&
        this.validCommitmentLevels.includes(commitmentLevel) === false) {
      return {
        status: false,
        message: `Invalid commitment level`
      }
    }

    if (compensation != null &&
        this.validCompensationOptions.includes(compensation) === false) {
      return {
        status: false,
        message: `Invalid compensation`
      }
    }

    // Update the plan
    const plan = await
      collaborationPlanModel.update(
        prisma,
        planId,
        existing.targetProfileId,
        existing.status,
        title != null && title.trim() !== '' ? title.trim() : undefined,
        description != null && description.trim() !== '' ? description.trim() : undefined,
        startBy,
        rolesNeeded != null ?
          rolesNeeded.filter(role => role.trim() !== '').map(role => role.trim()) :
          undefined,
        commitmentLevel != null && commitmentLevel.trim() !== '' ?
          commitmentLevel :
          undefined,
        compensation != null && compensation.trim() !== '' ? compensation : undefined,
        deliverables != null && deliverables.trim() !== '' ? deliverables.trim() : undefined,
        existing.completedAt)

    // Return
    return {
      status: true,
      message: `Your plan was updated`,
      plan: {
        id: plan.id
      }
    }
  }

  // Set a plan's lifecycle status. Either the creator or the targeted profile
  // may transition it; the other party is notified.
  async setPlanStatus(
    prisma: PrismaClient,
    userProfileId: string,
    planId: string,
    status: string) {

    // Debug
    const fnName = `${this.clName}.setPlanStatus()`

    // Validate the status
    if (this.validPlanStatuses.includes(status) === false) {
      return {
        status: false,
        message: `Invalid plan status`
      }
    }

    // Load the plan
    const existing = await
      prisma.collaborationPlan.findUnique({
        where: {
          id: planId
        }
      })

    if (existing == null) {
      return {
        status: false,
        message: `Collaboration plan not found`
      }
    }

    // The actor must be the creator or the target
    const actorProfile = await
      prisma.profile.findUnique({
        where: {
          userProfileId: userProfileId
        }
      })

    if (actorProfile == null ||
        (actorProfile.id !== existing.createdByProfileId &&
          actorProfile.id !== existing.targetProfileId)) {
      return {
        status: false,
        message: `You can only change your own plans`
      }
    }

    // Update the status; completion records when it happened
    await
      collaborationPlanModel.update(
        prisma,
        planId,
        existing.targetProfileId,
        status,
        existing.title,
        existing.description,
        existing.startBy,
        existing.rolesNeeded,
        existing.commitmentLevel,
        existing.compensation,
        existing.deliverables,
        status === 'C' ? new Date() : existing.completedAt)

    // Notify the other party
    const counterpartProfileId =
      actorProfile.id === existing.createdByProfileId ?
        existing.targetProfileId :
        existing.createdByProfileId

    if (counterpartProfileId != null) {
      const counterpart = await
        prisma.profile.findUnique({
          where: {
            id: counterpartProfileId
          }
        })

      if (counterpart != null) {
        await notificationsService.notify(
          prisma,
          counterpart.userProfileId,
          'plan_status_changed',
          'CollaborationPlan',
          planId)
      }
    }

    // Return
    return {
      status: true,
      message: `Plan updated`
    }
  }

  // Add a step to a plan (its creator only). The sequence number is assigned
  // automatically as one past the current maximum.
  async addPlanStep(
    prisma: PrismaClient,
    userProfileId: string,
    planId: string,
    title: string,
    description: string | undefined) {

    // Debug
    const fnName = `${this.clName}.addPlanStep()`

    // Validate the title
    if (title == null || title.trim() === '') {
      return {
        status: false,
        message: `Step title is required`
      }
    }

    // Load the plan to verify ownership
    const plan = await
      prisma.collaborationPlan.findUnique({
        where: {
          id: planId
        }
      })

    if (plan == null) {
      return {
        status: false,
        message: `Collaboration plan not found`
      }
    }

    const isCreator = await
      this.isCreator(
        prisma,
        userProfileId,
        plan.createdByProfileId)

    if (isCreator === false) {
      return {
        status: false,
        message: `You can only edit your own plans`
      }
    }

    // Compute the next sequence number
    const aggregate = await
      prisma.planStep.aggregate({
        where: {
          planId: planId
        },
        _max: {
          seq: true
        }
      })

    const nextSeq = (aggregate._max.seq ?? 0) + 1

    // Create the step
    const step = await
      prisma.planStep.create({
        data: {
          planId: planId,
          seq: nextSeq,
          title: title.trim(),
          description:
            description != null && description.trim() !== '' ?
              description.trim() :
              undefined,
          status: 'P'
        }
      })

    // Return
    return {
      status: true,
      message: `Step added`,
      step: {
        id: step.id,
        planId: step.planId,
        seq: step.seq,
        title: step.title,
        description: step.description,
        status: step.status
      }
    }
  }

  // Update a step of a plan (the plan's creator only)
  async updatePlanStep(
    prisma: PrismaClient,
    userProfileId: string,
    stepId: string,
    title: string | undefined,
    description: string | undefined,
    status: string | undefined) {

    // Debug
    const fnName = `${this.clName}.updatePlanStep()`

    // Load the step and its plan to verify ownership
    const step = await
      prisma.planStep.findUnique({
        where: {
          id: stepId
        }
      })

    if (step == null) {
      return {
        status: false,
        message: `Plan step not found`
      }
    }

    const plan = await
      prisma.collaborationPlan.findUnique({
        where: {
          id: step.planId
        }
      })

    if (plan == null) {
      return {
        status: false,
        message: `Collaboration plan not found`
      }
    }

    const isCreator = await
      this.isCreator(
        prisma,
        userProfileId,
        plan.createdByProfileId)

    if (isCreator === false) {
      return {
        status: false,
        message: `You can only edit your own plans`
      }
    }

    // Validate the status, if being changed
    if (status != null &&
        this.validStepStatuses.includes(status) === false) {
      return {
        status: false,
        message: `Invalid step status`
      }
    }

    // Update the step
    const updated = await
      prisma.planStep.update({
        where: {
          id: step.id
        },
        data: {
          title: title != null && title.trim() !== '' ? title.trim() : undefined,
          description:
            description != null && description.trim() !== '' ?
              description.trim() :
              undefined,
          status: status ?? undefined
        }
      })

    // Return
    return {
      status: true,
      message: `Step updated`,
      step: {
        id: updated.id,
        planId: updated.planId,
        seq: updated.seq,
        title: updated.title,
        description: updated.description,
        status: updated.status
      }
    }
  }

  // Delete a step of a plan (the plan's creator only). Steps after it are
  // renumbered so sequences stay contiguous.
  async deletePlanStep(
    prisma: PrismaClient,
    userProfileId: string,
    stepId: string) {

    // Debug
    const fnName = `${this.clName}.deletePlanStep()`

    // Load the step and its plan to verify ownership
    const step = await
      prisma.planStep.findUnique({
        where: {
          id: stepId
        }
      })

    if (step == null) {
      return {
        status: false,
        message: `Plan step not found`
      }
    }

    const plan = await
      prisma.collaborationPlan.findUnique({
        where: {
          id: step.planId
        }
      })

    if (plan == null) {
      return {
        status: false,
        message: `Collaboration plan not found`
      }
    }

    const isCreator = await
      this.isCreator(
        prisma,
        userProfileId,
        plan.createdByProfileId)

    if (isCreator === false) {
      return {
        status: false,
        message: `You can only edit your own plans`
      }
    }

    // Delete the step
    await
      prisma.planStep.delete({
        where: {
          id: step.id
        }
      })

    // Renumber later steps to keep the sequence contiguous
    const laterSteps = await
      prisma.planStep.findMany({
        where: {
          planId: step.planId,
          seq: { gt: step.seq }
        },
        orderBy: {
          seq: 'asc'
        }
      })

    for (const laterStep of laterSteps) {
      await
        prisma.planStep.update({
          where: {
            id: laterStep.id
          },
          data: {
            seq: laterStep.seq - 1
          }
        })
    }

    // Return
    return {
      status: true,
      message: `Step deleted`
    }
  }

  // Is the given user profile the plan's creator?
  async isCreator(
    prisma: PrismaClient,
    userProfileId: string,
    createdByProfileId: string): Promise<boolean> {

    // Debug
    const fnName = `${this.clName}.isCreator()`

    // Resolve the viewer's profile
    const profile = await
      prisma.profile.findUnique({
        where: {
          userProfileId: userProfileId
        }
      })

    // Return
    return profile != null && profile.id === createdByProfileId
  }
}
