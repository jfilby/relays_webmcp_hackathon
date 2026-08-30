// Auto-approve all pending connections when the server runs in demo mode
// (IS_DEMO_MODE === 'true').
//
// Run as a housekeeping job from HousekeepingService.run(), which BatchService
// calls on its 15m interval. In demo mode nobody is around to accept incoming
// connection requests, so every pending edge is moved straight to active and
// each requester is notified of acceptance. A no-op outside demo mode.

import { PrismaClient } from '@/generated/prisma/client'
import { ConnectionModel } from '@/models/profiles/connection-model'
import { ProfileModel } from '@/models/profiles/profile-model'
import { NotificationsService } from '@/services/notifications/service'

// Models
const connectionModel = new ConnectionModel()
const profileModel = new ProfileModel()

// Services
const notificationsService = new NotificationsService()

// Code
// Connection statuses: P (pending), A (active)
const pendingStatus = 'P'
const activeStatus = 'A'

// Auto-approve all pending connections in demo mode
export async function autoApproveConnections(
  prisma: PrismaClient): Promise<void> {

  // Debug
  const fnName = 'autoApproveConnections()'

  // No-op outside demo mode
  if (process.env.IS_DEMO_MODE !== 'true') {
    return
  }

  // Pending connections
  const pending = await connectionModel.filter(
    prisma,
    undefined,
    undefined,
    pendingStatus)

  console.log(`${fnName}: ${pending.length} pending connections to approve`)

  // Approve each pending connection
  for (const connection of pending) {
    await connectionModel.update(
      prisma,
      connection.id,
      activeStatus,
      undefined,  // message
      new Date())  // acceptedAt

    // Notify the requester of acceptance
    const requester = await
      profileModel.getById(
        prisma,
        connection.fromProfileId)

    if (requester != null) {
      await notificationsService.notify(
        prisma,
        requester.userProfileId,
        'connection_accepted',
        'Connection',
        connection.id)
    }
  }

  // Report
  console.log(`${fnName}: done: ${pending.length} connections approved`)
}
