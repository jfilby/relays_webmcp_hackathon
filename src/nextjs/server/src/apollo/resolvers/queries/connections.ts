import { prisma } from '@/db'
import { ConnectionsService } from '@/services/connections/service'

// Services
const connectionsService = new ConnectionsService()

// GraphQL args are schema-validated before the resolver runs
interface GetIncomingConnectionRequestsArgs {
  userProfileId: string
}

interface GetConnectionStatusArgs {
  userProfileId: string
  peerProfileId: string
}

// Code
export async function getIncomingConnectionRequests(
  _parent: unknown,
  { userProfileId }: GetIncomingConnectionRequestsArgs) {

  // Query
  return connectionsService.getIncomingRequests(
    prisma,
    userProfileId)
}

export async function getConnectionStatus(
  _parent: unknown,
  { userProfileId, peerProfileId }: GetConnectionStatusArgs) {

  // Query
  return connectionsService.getConnectionStatus(
    prisma,
    userProfileId,
    peerProfileId)
}
