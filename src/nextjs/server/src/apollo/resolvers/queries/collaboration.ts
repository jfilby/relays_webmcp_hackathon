import { prisma } from '@/db'
import { CollaborationQueryService } from '@/services/collaboration/query-service'

// Services
const collaborationQueryService = new CollaborationQueryService()

// GraphQL args are schema-validated before the resolver runs
interface GetPlanByIdArgs {
  id: string
}

interface SearchCollaborationPlansArgs {
  projectId?: string | null
  userProfileId?: string | null
}

interface GetPlanStepsByPlanIdArgs {
  planId: string
}

// Code
export async function getCollaborationPlanById(
  _parent: unknown,
  { id }: GetPlanByIdArgs) {

  // Query
  return collaborationQueryService.getCollaborationPlanById(
    prisma,
    id)
}

export async function searchCollaborationPlans(
  _parent: unknown,
  {
    projectId,
    userProfileId
  }: SearchCollaborationPlansArgs) {

  // Query
  return collaborationQueryService.searchCollaborationPlans(
    prisma,
    projectId ?? undefined,
    userProfileId ?? undefined)
}

export async function getPlanStepsByPlanId(
  _parent: unknown,
  { planId }: GetPlanStepsByPlanIdArgs) {

  // Query
  return collaborationQueryService.getPlanStepsByPlanId(
    prisma,
    planId)
}
