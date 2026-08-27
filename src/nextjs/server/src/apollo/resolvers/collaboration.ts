import { prisma } from '@/db'
import { CollaborationQueryService } from '@/services/collaboration/query-service'
import { CollaborationMutateService } from '@/services/collaboration/mutate-service'

// Services
const collaborationQueryService = new CollaborationQueryService()
const collaborationMutateService = new CollaborationMutateService()

// GraphQL args are schema-validated before the resolver runs
interface GetPlanStepsByPlanIdArgs {
  planId: string
}

interface CreatePlanArgs {
  userProfileId: string
  projectId: string
  title: string
  description?: string | null
  targetProfileId?: string | null
  rolesNeeded?: string[] | null
  commitmentLevel?: string | null
  compensation?: string | null
  deliverables?: string | null
  startBy?: string | null
}

interface UpdatePlanArgs {
  id: string
  userProfileId: string
  title?: string | null
  description?: string | null
  rolesNeeded?: string[] | null
  commitmentLevel?: string | null
  compensation?: string | null
  deliverables?: string | null
  startBy?: string | null
}

interface SetPlanStatusArgs {
  id: string
  userProfileId: string
  status: string
}

interface AddPlanStepArgs {
  userProfileId: string
  planId: string
  title: string
  description?: string | null
}

interface UpdatePlanStepArgs {
  id: string
  userProfileId: string
  title?: string | null
  description?: string | null
  status?: string | null
}

interface DeletePlanStepArgs {
  id: string
  userProfileId: string
}

interface SearchCollaborationPlansArgs {
  projectId?: string | null
  userProfileId?: string | null
}

interface GetPlanByIdArgs {
  id: string
}

// Code
export async function getCollaborationPlanById(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { id } = args as unknown as { id: string }

  // Query
  return collaborationQueryService.getCollaborationPlanById(
    prisma,
    id)
}

export async function searchCollaborationPlans(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    projectId,
    userProfileId
  } = args as unknown as {
    projectId?: string | null
    userProfileId?: string | null
  }

  // Query
  return collaborationQueryService.searchCollaborationPlans(
    prisma,
    projectId ?? undefined,
    userProfileId ?? undefined)
}

export async function getPlanStepsByPlanId(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { planId } = args as unknown as GetPlanStepsByPlanIdArgs

  // Query
  return collaborationQueryService.getPlanStepsByPlanId(
    prisma,
    planId)
}

export async function createPlan(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId,
    projectId,
    title,
    description,
    targetProfileId,
    rolesNeeded,
    commitmentLevel,
    compensation,
    deliverables,
    startBy
  } = args as unknown as {
    userProfileId: string
    projectId: string
    title: string
    description?: string | null
    targetProfileId?: string | null
    rolesNeeded?: string[] | null
    commitmentLevel?: string | null
    compensation?: string | null
    deliverables?: string | null
    startBy?: string | null
  }

  // Mutation
  return collaborationMutateService.createPlan(
    prisma,
    userProfileId,
    projectId,
    title,
    description ?? undefined,
    targetProfileId ?? undefined,
    rolesNeeded ?? [],
    commitmentLevel ?? undefined,
    compensation ?? undefined,
    deliverables ?? undefined,
    startBy != null ? new Date(startBy) : undefined)
}

export async function updatePlan(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    id,
    userProfileId,
    title,
    description,
    rolesNeeded,
    commitmentLevel,
    compensation,
    deliverables,
    startBy
  } = args as unknown as {
    id: string
    userProfileId: string
    title?: string | null
    description?: string | null
    rolesNeeded?: string[] | null
    commitmentLevel?: string | null
    compensation?: string | null
    deliverables?: string | null
    startBy?: string | null
  }

  // Mutation
  return collaborationMutateService.updatePlan(
    prisma,
    userProfileId,
    id,
    title ?? undefined,
    description ?? undefined,
    rolesNeeded ?? undefined,
    commitmentLevel ?? undefined,
    compensation ?? undefined,
    deliverables ?? undefined,
    startBy != null ? new Date(startBy) : undefined)
}

export async function setPlanStatus(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    id,
    userProfileId,
    status
  } = args as unknown as {
    id: string
    userProfileId: string
    status: string
  }

  // Mutation
  return collaborationMutateService.setPlanStatus(
    prisma,
    userProfileId,
    id,
    status)
}

export async function addPlanStep(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId,
    planId,
    title,
    description
  } = args as unknown as {
    userProfileId: string
    planId: string
    title: string
    description?: string | null
  }

  // Mutation
  return collaborationMutateService.addPlanStep(
    prisma,
    userProfileId,
    planId,
    title,
    description ?? undefined)
}

export async function updatePlanStep(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    id,
    userProfileId,
    title,
    description,
    status
  } = args as unknown as {
    id: string
    userProfileId: string
    title?: string | null
    description?: string | null
    status?: string | null
  }

  // Mutation
  return collaborationMutateService.updatePlanStep(
    prisma,
    userProfileId,
    id,
    title ?? undefined,
    description ?? undefined,
    status ?? undefined)
}

export async function deletePlanStep(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { id, userProfileId } = args as unknown as {
    id: string
    userProfileId: string
  }

  // Mutation
  return collaborationMutateService.deletePlanStep(
    prisma,
    userProfileId,
    id)
}
