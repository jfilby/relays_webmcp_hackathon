import { prisma } from '@/db'
import { CollaborationMutateService } from '@/services/collaboration/mutate-service'

// Services
const collaborationMutateService = new CollaborationMutateService()

// GraphQL args are schema-validated before the resolver runs
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

// Code
export async function createPlan(
  _parent: unknown,
  {
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
  }: CreatePlanArgs) {

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
  _parent: unknown,
  {
    id,
    userProfileId,
    title,
    description,
    rolesNeeded,
    commitmentLevel,
    compensation,
    deliverables,
    startBy
  }: UpdatePlanArgs) {

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
  _parent: unknown,
  {
    id,
    userProfileId,
    status
  }: SetPlanStatusArgs) {

  // Mutation
  return collaborationMutateService.setPlanStatus(
    prisma,
    userProfileId,
    id,
    status)
}

export async function addPlanStep(
  _parent: unknown,
  {
    userProfileId,
    planId,
    title,
    description
  }: AddPlanStepArgs) {

  // Mutation
  return collaborationMutateService.addPlanStep(
    prisma,
    userProfileId,
    planId,
    title,
    description ?? undefined)
}

export async function updatePlanStep(
  _parent: unknown,
  {
    id,
    userProfileId,
    title,
    description,
    status
  }: UpdatePlanStepArgs) {

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
  _parent: unknown,
  { id, userProfileId }: DeletePlanStepArgs) {

  // Mutation
  return collaborationMutateService.deletePlanStep(
    prisma,
    userProfileId,
    id)
}
