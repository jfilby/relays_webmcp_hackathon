import { prisma } from '@/db'
import { DmsService } from '@/services/dms/service'

// Services
const dmsService = new DmsService()

// GraphQL args are schema-validated before the resolver runs
interface SendDmArgs {
  userProfileId: string
  toProfilePublicId: string
  message: string
}


// Code
export async function sendDm(
  _parent: unknown,
  {
    userProfileId,
    toProfilePublicId,
    message
  }: SendDmArgs) {

  // Mutation
  return dmsService.sendDm(
    prisma,
    userProfileId,
    toProfilePublicId,
    message)
}

