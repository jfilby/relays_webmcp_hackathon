import { prisma } from '@/db'
import { DmsService } from '@/services/dms/service'

// Services
const dmsService = new DmsService()

// GraphQL args are schema-validated before the resolver runs
interface UserProfileIdArgs {
  userProfileId: string
}

interface GetDmMessagesArgs {
  userProfileId: string
  withProfilePublicId: string
}

// Code
export async function getDmConversations(
  _parent: unknown,
  { userProfileId }: UserProfileIdArgs) {

  // Query
  return dmsService.getConversations(
    prisma,
    userProfileId)
}

export async function getDmMessages(
  _parent: unknown,
  {
    userProfileId,
    withProfilePublicId
  }: GetDmMessagesArgs) {

  // Query
  return dmsService.getMessages(
    prisma,
    userProfileId,
    withProfilePublicId)
}
