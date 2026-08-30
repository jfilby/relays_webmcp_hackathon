import { prisma } from '@/db'
import { ConnectionsService } from '@/services/connections/service'

// Services
const connectionsService = new ConnectionsService()

// GraphQL args are schema-validated before the resolver runs
interface SendConnectionRequestArgs {
  userProfileId: string
  toProfileId: string
  message?: string | null
}

interface RespondToConnectionRequestArgs {
  userProfileId: string
  connectionId: string
  response: string
}

interface RemoveConnectionArgs {
  userProfileId: string
  peerProfileId: string
}

// Code
export async function sendConnectionRequest(
  _parent: unknown,
  {
    userProfileId,
    toProfileId,
    message
  }: SendConnectionRequestArgs) {

  // Mutation
  return connectionsService.sendRequest(
    prisma,
    userProfileId,
    toProfileId,
    message ?? undefined)
}

export async function respondToConnectionRequest(
  _parent: unknown,
  {
    userProfileId,
    connectionId,
    response
  }: RespondToConnectionRequestArgs) {

  // Mutation
  return connectionsService.respondToRequest(
    prisma,
    userProfileId,
    connectionId,
    response)
}

export async function removeConnection(
  _parent: unknown,
  {
    userProfileId,
    peerProfileId
  }: RemoveConnectionArgs) {

  // Mutation
  return connectionsService.removeConnection(
    prisma,
    userProfileId,
    peerProfileId)
}
