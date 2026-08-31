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

interface MarkDmThreadReadArgs {
  userProfileId: string
  withProfilePublicId: string
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

export async function markDmThreadRead(
  _parent: unknown,
  {
    userProfileId,
    withProfilePublicId
  }: MarkDmThreadReadArgs) {

  // Mutation
  return dmsService.markThreadRead(
    prisma,
    userProfileId,
    withProfilePublicId)
}
