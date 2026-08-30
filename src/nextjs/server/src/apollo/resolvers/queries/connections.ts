import { prisma } from '@/db'
import { ConnectionsService } from '@/services/connections/service'

// Services
const connectionsService = new ConnectionsService()

// GraphQL args are schema-validated before the resolver runs
interface GetIncomingConnectionRequestsArgs {
  userProfileId: string
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
