import { prisma } from '@/db'
import { ConnectionsService } from '@/services/connections/service'

// Services
const connectionsService = new ConnectionsService()

// GraphQL args are schema-validated before the resolver runs
interface GetIncomingConnectionRequestsArgs {
  userProfileId: string
}

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
export async function getIncomingConnectionRequests(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { userProfileId } = args as unknown as GetIncomingConnectionRequestsArgs

  // Query
  return connectionsService.getIncomingRequests(
    prisma,
    userProfileId)
}

export async function sendConnectionRequest(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId,
    toProfileId,
    message
  } = args as unknown as SendConnectionRequestArgs

  // Mutation
  return connectionsService.sendRequest(
    prisma,
    userProfileId,
    toProfileId,
    message ?? undefined)
}

export async function respondToConnectionRequest(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId,
    connectionId,
    response
  } = args as unknown as RespondToConnectionRequestArgs

  // Mutation
  return connectionsService.respondToRequest(
    prisma,
    userProfileId,
    connectionId,
    response)
}

export async function removeConnection(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId,
    peerProfileId
  } = args as unknown as RemoveConnectionArgs

  // Mutation
  return connectionsService.removeConnection(
    prisma,
    userProfileId,
    peerProfileId)
}
