import { PrismaClient, Profile } from '@/generated/prisma/client'
import { ConnectionModel } from '@/models/profiles/connection-model'
import { ProfileModel } from '@/models/profiles/profile-model'
import { NotificationsService } from '@/services/notifications/service'
import { AvatarStorageService } from '@/services/uploads/avatar-storage-service'


// Models
const connectionModel = new ConnectionModel()
const profileModel = new ProfileModel()

// Services
const notificationsService = new NotificationsService()
const avatarStorageService = new AvatarStorageService()

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
      profileModel.getByUserProfileId(
        prisma,
        fromUserProfileId)

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
      profileModel.getById(
        prisma,
        toProfileId)

    if (toProfile == null || toProfile.isPublic === false) {
      return {
        status: false,
        message: `Profile not found`
      }
    }

    // An existing edge in either direction blocks a new request. A reverse
    // pending request is accepted instead of duplicated.
    const existingForward = await
      connectionModel.getByFromTo(
        prisma,
        fromProfile.id,
        toProfileId)

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
      connectionModel.getByFromTo(
        prisma,
        toProfileId,
        fromProfile.id)

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
    // Create (or recreate after rejection) the edge. Requests to demo-data
    // profiles are auto-approved: the edge goes straight to active and the
    // requester is notified of acceptance instead of the recipient of a
    // pending request.
    const autoApprove = toProfile.isDemoData === true
    const status = autoApprove ? this.activeStatus : this.pendingStatus

    if (existingForward != null && existingForward.status === this.rejectedStatus) {
      await
        connectionModel.update(
          prisma,
          existingForward.id,
          status,
          message != null && message.trim() !== '' ? message.trim() : null,
          autoApprove ? new Date() : undefined,
          this.defaultOrigin)
    } else {
      await
        connectionModel.create(
          prisma,
          fromProfile.id,
          toProfileId,
          status,
          this.defaultOrigin,
          message != null && message.trim() !== '' ? message.trim() : undefined,
          autoApprove ? new Date() : undefined)
    }

    // Notify the recipient, or the requester when a demo profile auto-accepted
    if (autoApprove) {
      await notificationsService.notify(
        prisma,
        fromProfile.userProfileId,
        'connection_accepted',
        'Connection',
        undefined)
    } else {
      await notificationsService.notify(
        prisma,
        toProfile.userProfileId,
        'connection_request',
        'Connection',
        undefined)
    }

    // Return
    return {
      status: true,
      message: autoApprove ?
        `Connection request auto-approved` :
        `Connection request sent`
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
      connectionModel.getById(
        prisma,
        connectionId)

    if (connection == null || connection.status !== this.pendingStatus) {
      return {
        status: false,
        message: `Connection request not found`
      }
    }

    const myProfile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    if (myProfile == null ||
        connection.toProfileId !== myProfile.id) {
      return {
        status: false,
        message: `You can only respond to requests sent to you`
      }
    }

    // Update the connection
    await
      connectionModel.update(
        prisma,
        connection.id,
        response,
        undefined,
        response === this.activeStatus ? new Date() : null)

    // Notify the requester on acceptance
    if (response === this.activeStatus) {
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
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    if (profile == null) {
      return {
        status: false,
        message: `Profile not found`
      }
    }

    // The active edge may exist in either direction
    const forward = await
      connectionModel.getByFromTo(
        prisma,
        profile.id,
        peerProfileId)

    const reverse = await
      connectionModel.getByFromTo(
        prisma,
        peerProfileId,
        profile.id)

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
      connectionModel.deleteById(
        prisma,
        edge.id)

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
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    // No profile, no requests
    if (profile == null) {
      return {
        status: true,
        requests: []
      }
    }

    // Fetch the pending edges targeting the profile
    const connections = await
      connectionModel.getByToProfileIdAndStatus(
        prisma,
        profile.id,
        this.pendingStatus)

    // No requests, no senders to fetch
    if (connections.length === 0) {
      return {
        status: true,
        requests: []
      }
    }

    // Fetch the senders for display
    const sendersById: Record<string, Profile> = {}

    for (const connection of connections) {
      if (sendersById[connection.fromProfileId] == null) {
        const sender = await
          profileModel.getById(
            prisma,
            connection.fromProfileId)

        if (sender != null) {
          sendersById[connection.fromProfileId] = sender
        }
      }
    }

    // Return
    return {
      status: true,
      requests: connections
        .map(connection => {
          const sender = sendersById[connection.fromProfileId]

          if (sender == null) {
            return null
          }

          return {
            id: connection.id,
            fromProfileId: sender.id,
            fromDisplayName: sender.displayName,
            fromAvatar: avatarStorageService.resolveUrl(sender.avatar),
            fromType: sender.type,
            message: connection.message,
            created: connection.created.toISOString()
          }
        })
        .filter(request => request != null)
    }
  }

  // Get the connection status between the signed-in user's profile and a
  // peer profile: 'none', 'pending' or 'connected'.
  async getConnectionStatus(
    prisma: PrismaClient,
    userProfileId: string,
    peerProfileId: string) {

    // Resolve the viewer's profile
    const viewerProfile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    if (viewerProfile == null || viewerProfile.id === peerProfileId) {
      return {
        status: true,
        connectionStatus: 'none'
      }
    }

    // Check for an existing edge in either direction
    const forward = await
      connectionModel.getByFromTo(
        prisma,
        viewerProfile.id,
        peerProfileId)

    if (forward != null && forward.status === this.activeStatus) {
      return {
        status: true,
        connectionStatus: 'connected'
      }
    }

    const reverse = await
      connectionModel.getByFromTo(
        prisma,
        peerProfileId,
        viewerProfile.id)

    if (reverse != null && reverse.status === this.activeStatus) {
      return {
        status: true,
        connectionStatus: 'connected'
      }
    }

    if ((forward != null && forward.status === this.pendingStatus) ||
        (reverse != null && reverse.status === this.pendingStatus)) {
      return {
        status: true,
        connectionStatus: 'pending'
      }
    }

    // Return
    return {
      status: true,
      connectionStatus: 'none'
    }
  }
}
