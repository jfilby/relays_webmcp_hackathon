import { PrismaClient, Profile } from '@/generated/prisma/client'
import { DirectMessageModel } from '@/models/dms/direct-message-model'
import { ProfileModel } from '@/models/profiles/profile-model'
import {
  DmConversation,
  DmMessageItem,
  DmPeer
} from '@/types/dm-types'

// Models
const directMessageModel = new DirectMessageModel()
const profileModel = new ProfileModel()

// Class
export class DmsService {

  // Consts
  clName = 'DmsService'

  // Code
  // Format a profile for display to a DM viewer
  toDmPeer(profile: Profile): DmPeer {
    return {
      id: profile.id,
      publicId: profile.publicId,
      displayName: profile.displayName,
      avatar: profile.avatar,
      type: profile.type
    }
  }

  formatMessageItem(message: any): DmMessageItem {
    return {
      id: message.id,
      fromProfileId: message.fromProfileId,
      toProfileId: message.toProfileId,
      message: message.message,
      readAt: message.readAt != null ?
        message.readAt.toISOString() :
        null,
      created: message.created.toISOString()
    }
  }

  // Resolve the signed-in user's profile
  async getMyProfile(
    prisma: PrismaClient,
    userProfileId: string): Promise<Profile | null> {

    return profileModel.getByUserProfileId(
      prisma,
      userProfileId)
  }

  // Send a direct message from the signed-in user's profile to a peer
  // profile identified by its public id
  async sendDm(
    prisma: PrismaClient,
    userProfileId: string,
    toProfilePublicId: string,
    message: string) {

    // Debug
    const fnName = `${this.clName}.sendDm()`

    // Resolve the sender's profile
    const fromProfile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    if (fromProfile == null) {
      return {
        status: false,
        message: 'No profile found for the signed-in user'
      }
    }

    // Resolve the recipient's profile
    const toProfile = await
      profileModel.getByPublicId(
        prisma,
        toProfilePublicId)

    if (toProfile == null) {
      return {
        status: false,
        message: 'Recipient profile not found'
      }
    }

    // Don't allow messaging yourself
    if (toProfile.id === fromProfile.id) {
      return {
        status: false,
        message: 'You cannot message your own profile'
      }
    }

    // Validate the message text
    const trimmedMessage = message.trim()

    if (trimmedMessage === '') {
      return {
        status: false,
        message: 'Message cannot be empty'
      }
    }

    if (trimmedMessage.length > 5000) {
      return {
        status: false,
        message: 'Message is too long (maximum 5000 characters)'
      }
    }

    // Create the message
    const dm = await directMessageModel.create(
      prisma,
      fromProfile.id,
      toProfile.id,
      trimmedMessage)

    // Return
    return {
      status: true,
      messageItem: this.formatMessageItem(dm),
      peer: this.toDmPeer(toProfile)
    }
  }

  // List the signed-in user's DM conversations, most recently active first
  async getConversations(
    prisma: PrismaClient,
    userProfileId: string) {

    // Debug
    const fnName = `${this.clName}.getConversations()`

    // Resolve the viewer's profile
    const profile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    // No profile, no conversations
    if (profile == null) {
      return {
        status: true,
        conversations: []
      }
    }

    // Get the conversation summaries
    const summaries = await
      directMessageModel.getConversationSummaries(
        prisma,
        profile.id)

    // Fetch the peers and last messages for display
    const conversations: DmConversation[] = []

    for (const summary of summaries) {
      const peer = await
        profileModel.getById(
          prisma,
          summary.peerProfileId)

      if (peer == null) {
        continue
      }

      const lastMessage = summary.lastMessageId != null ?
        await prisma.directMessage.findUnique({
          where: {
            id: summary.lastMessageId
          }
        }) :
        null

      conversations.push({
        peer: this.toDmPeer(peer),
        lastMessage: lastMessage != null ?
          this.formatMessageItem(lastMessage) :
          null,
        unreadCount: Number(summary.unreadCount),
        created: lastMessage != null ?
          lastMessage.created.toISOString() :
          peer.created.toISOString()
      })
    }

    // Sort by the latest activity, newest first
    conversations.sort((a, b) =>
      b.created.localeCompare(a.created))

    // Return
    return {
      status: true,
      conversations: conversations
    }
  }

  // Load the message thread between the signed-in user's profile and a peer
  // profile identified by its public id
  async getMessages(
    prisma: PrismaClient,
    userProfileId: string,
    withProfilePublicId: string) {

    // Debug
    const fnName = `${this.clName}.getMessages()`

    // Resolve the viewer's profile
    const profile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    if (profile == null) {
      return {
        status: false,
        message: 'No profile found for the signed-in user',
        peer: null,
        messages: []
      }
    }

    // Resolve the peer's profile
    const peer = await
      profileModel.getByPublicId(
        prisma,
        withProfilePublicId)

    if (peer == null) {
      return {
        status: false,
        message: 'Peer profile not found',
        peer: null,
        messages: []
      }
    }

    // Load the thread
    const messages = await
      directMessageModel.getThread(
        prisma,
        profile.id,
        peer.id)

    // Return
    return {
      status: true,
      peer: this.toDmPeer(peer),
      messages: messages.map(message =>
        this.formatMessageItem(message))
    }
  }

  // Mark the signed-in user's received messages in a thread as read
  async markThreadRead(
    prisma: PrismaClient,
    userProfileId: string,
    withProfilePublicId: string) {

    // Debug
    const fnName = `${this.clName}.markThreadRead()`

    // Resolve the viewer's profile
    const profile = await
      profileModel.getByUserProfileId(
        prisma,
        userProfileId)

    if (profile == null) {
      return {
        status: false,
        message: 'No profile found for the signed-in user'
      }
    }

    // Resolve the peer's profile
    const peer = await
      profileModel.getByPublicId(
        prisma,
        withProfilePublicId)

    if (peer == null) {
      return {
        status: false,
        message: 'Peer profile not found'
      }
    }

    // Mark as read
    await directMessageModel.markThreadRead(
      prisma,
      profile.id,
      peer.id,
      new Date())

    // Return
    return {
      status: true
    }
  }
}
