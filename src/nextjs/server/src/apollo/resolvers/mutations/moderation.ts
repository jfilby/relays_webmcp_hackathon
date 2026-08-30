import { prisma } from '@/db'
import { ModerationMutateService } from '@/services/moderation/mutate-service'

// Services
const moderationMutateService = new ModerationMutateService()

// GraphQL args are schema-validated before the resolver runs
interface RefArgsBase {
  userProfileId: string
  refModel: string
  refId: string
}

interface SetModerationFlagStatusArgs extends RefArgsBase {
  status: string
}

// Code
export async function flagContent(
  _parent: unknown,
  { userProfileId, refModel, refId }: RefArgsBase) {

  // Mutation
  return moderationMutateService.flagContent(
    prisma,
    userProfileId,
    refModel,
    refId)
}

export async function setModerationFlagStatus(
  _parent: unknown,
  { userProfileId, refModel, refId, status }: SetModerationFlagStatusArgs) {

  // Mutation
  return moderationMutateService.setModerationFlagStatus(
    prisma,
    userProfileId,
    refModel,
    refId,
    status)
}

export async function deleteFlaggedContent(
  _parent: unknown,
  { userProfileId, refModel, refId }: RefArgsBase) {

  // Mutation
  return moderationMutateService.deleteFlaggedContent(
    prisma,
    userProfileId,
    refModel,
    refId)
}
