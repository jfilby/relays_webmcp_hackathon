import { PrismaClient } from '@/generated/prisma/client'
import { NotificationsService } from '@/services/notifications/service'

// Services
const notificationsService = new NotificationsService()

// Class
export class ConnectionsService {

  // Consts
  clName = 'ConnectionsService'

  // Connection statuses: P (pending), A (active), R (rejected), B (blocked)
  pendingStatus = 'P'
  activeStatus = 'A'
  rejectedStatus = 'R'

  // Connection origins: S (search), P (project), C (collaboration plan),
  // I (introduction)
  defaultOrigin = 'S'

  // Code
  // Send a connection request from the signed-in user's profile
  async sendRequest(
    prisma: PrismaClient,
    fromUserProfileId: string,
    toProfileId: string,
    message: string | undefined) {

    // Debug
    const fnName = `${this.clName}.sendRequest()`

    // Resolve the sender's profile
    const fromProfile = await
      prisma.profile.findUnique({
        where: {
          userProfileId: fromUserProfileId
        }
      })

    if (fromProfile == null) {
      return {
        status: false,
        message: `You need a profile to connect with others`
      }
    }

    // Validate the target
    if (fromProfile.id === toProfileId) {
      return {
        status: false,
        message: `You can't connect with yourself`
      }
    }

    const toProfile = await
      prisma.profile.findUnique({
        where: {
          id: toProfileId
        }
      })

    if (toProfile == null || toProfile.isPublic === false) {
      return {
        status: false,
        message: `Profile not found`
      }
    }

    // An existing edge in either direction blocks a new request. A reverse
    // pending request is accepted instead of duplicated.
    const existingForward = await
      prisma.connection.findUnique({
        where: {
          fromProfileId_toProfileId: {
            fromProfileId: fromProfile.id,
            toProfileId: toProfileId
          }
        }
      })

    if (existingForward != null &&
        existingForward.status !== this.rejectedStatus) {
      return {
        status: false,
        message:
          existingForward.status === this.pendingStatus ?
            `Connection request already sent` :
            `You're already connected`
      }
    }

    const existingReverse = await
      prisma.connection.findUnique({
        where: {
          fromProfileId_toProfileId: {
            fromProfileId: toProfileId,
            toProfileId: fromProfile.id
          }
        }
      })

    if (existingReverse != null &&
        existingReverse.status !== this.rejectedStatus) {
      return {
        status: false,
        message:
          existingReverse.status === this.pendingStatus ?
            `They already sent you a connection request` :
            `You're already connected`
      }
    }

    // Create (or recreate after rejection) the pending edge
    try {
      if (existingForward != null && existingForward.status === this.rejectedStatus) {
        await
          prisma.connection.update({
            where: {
              id: existingForward.id
            },
            data: {
              status: this.pendingStatus,
              message: message != null && message.trim() !== '' ? message.trim() : null,
              origin: this.defaultOrigin
            }
          })
      } else {
        await
          prisma.connection.create({
            data: {
              fromProfileId: fromProfile.id,
              toProfileId: toProfileId,
              status: this.pendingStatus,
              origin: this.defaultOrigin,
              message: message != null && message.trim() !== '' ? message.trim() : undefined
            }
          })
      }
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }

    // Notify the recipient
    await notificationsService.notify(
      prisma,
      toProfile.userProfileId,
      'connection_request',
      'Connection',
      undefined)

    // Return
    return {
      status: true,
      message: `Connection request sent`
    }
  }

  // Respond to an incoming connection request (accept or reject)
  async respondToRequest(
    prisma: PrismaClient,
    userProfileId: string,
    connectionId: string,
    response: string) {

    // Debug
    const fnName = `${this.clName}.respondToRequest()`

    // Validate the response
    if (response !== this.activeStatus && response !== this.rejectedStatus) {
      return {
        status: false,
        message: `Invalid response`
      }
    }

    // Load the connection; only its target can respond
    const connection = await
      prisma.connection.findUnique({
        where: {
          id: connectionId
        }
      })

    if (connection == null || connection.status !== this.pendingStatus) {
      return {
        status: false,
        message: `Connection request not found`
      }
    }

    const myProfile = await
      prisma.profile.findUnique({
        where: {
          userProfileId: userProfileId
        }
      })

    if (myProfile == null ||
        connection.toProfileId !== myProfile.id) {
      return {
        status: false,
        message: `You can only respond to requests sent to you`
      }
    }

    // Update the connection
    await
      prisma.connection.update({
        where: {
          id: connection.id
        },
        data: {
          status: response,
          acceptedAt: response === this.activeStatus ? new Date() : null
        }
      })

    // Notify the requester on acceptance
    if (response === this.activeStatus) {
      const requester = await
        prisma.profile.findUnique({
          where: {
            id: connection.fromProfileId
          }
        })

      if (requester != null) {
        await notificationsService.notify(
          prisma,
          requester.userProfileId,
          'connection_accepted',
          'Connection',
          connection.id)
      }
    }

    // Return
    return {
      status: true,
      message:
        response === this.activeStatus ?
          `Connection accepted` :
          `Connection request rejected`
    }
  }

  // Remove an active connection between the signed-in user and someone else
  async removeConnection(
    prisma: PrismaClient,
    userProfileId: string,
    peerProfileId: string) {

    // Debug
    const fnName = `${this.clName}.removeConnection()`

    // Resolve the viewer's profile
    const profile = await
      prisma.profile.findUnique({
        where: {
          userProfileId: userProfileId
        }
      })

    if (profile == null) {
      return {
        status: false,
        message: `Profile not found`
      }
    }

    // The active edge may exist in either direction
    const forward = await
      prisma.connection.findUnique({
        where: {
          fromProfileId_toProfileId: {
            fromProfileId: profile.id,
            toProfileId: peerProfileId
          }
        }
      })

    const reverse = await
      prisma.connection.findUnique({
        where: {
          fromProfileId_toProfileId: {
            fromProfileId: peerProfileId,
            toProfileId: profile.id
          }
        }
      })

    const edge =
      (forward != null && forward.status === this.activeStatus ? forward : undefined) ??
      (reverse != null && reverse.status === this.activeStatus ? reverse : undefined)

    if (edge == null) {
      return {
        status: false,
        message: `Connection not found`
      }
    }

    // Delete
    await
      prisma.connection.delete({
        where: {
          id: edge.id
        }
      })

    // Return
    return {
      status: true,
      message: `Connection removed`
    }
  }

  // List incoming pending connection requests for the signed-in user's
  // profile, with each sender's display details.
  async getIncomingRequests(
    prisma: PrismaClient,
    userProfileId: string) {

    // Debug
    const fnName = `${this.clName}.getIncomingRequests()`

    // Resolve the viewer's profile
    const profile = await
      prisma.profile.findUnique({
        where: {
          userProfileId: userProfileId
        }
      })

    // No profile, no requests
    if (profile == null) {
      return {
        status: true,
        requests: []
      }
    }

    // Fetch the pending edges targeting the profile
    const connections = await
      prisma.connection.findMany({
        where: {
          toProfileId: profile.id,
          status: this.pendingStatus
        },
        orderBy: {
          created: 'desc'
        }
      })

    // No requests, no senders to fetch
    if (connections.length === 0) {
      return {
        status: true,
        requests: []
      }
    }

    // Fetch the senders for display
    const senders = await
      prisma.profile.findMany({
        where: {
          id: { in: connections.map(connection => connection.fromProfileId) }
        }
      })

    const sendersById = new Map(senders.map(sender => [sender.id, sender]))

    // Return
    return {
      status: true,
      requests: connections
        .map(connection => {
          const sender = sendersById.get(connection.fromProfileId)

          if (sender == null) {
            return null
          }

          return {
            id: connection.id,
            fromProfileId: sender.id,
            fromDisplayName: sender.displayName,
            fromAvatar: sender.avatar,
            fromType: sender.type,
            message: connection.message,
            created: connection.created.toISOString()
          }
        })
        .filter(request => request != null)
    }
  }
}
