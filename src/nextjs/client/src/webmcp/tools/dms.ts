//
// WebMCP tool factories for the direct-messages page. Each factory returns
// the tool definition used by a page or data component, taking its
// dependencies (state accessors and submit functions) as an explicit object,
// so the tools can be exercised by evals without a DOM.
//
import type { DmConversation } from '@/types/dm-types'
import type { WebMcpTool } from '../webmcp'
import type { SubmitResult } from './types'

// list_dm_conversations: the conversation list as data.
export interface ListDmConversationsToolDeps {
  isSignedIn: () => boolean
  getConversations: () => DmConversation[] | undefined
}

export function listDmConversationsTool(deps: ListDmConversationsToolDeps): WebMcpTool {

  return {
    name: 'list_dm_conversations',
    title: 'List DM conversations',
    description: `List the signed-in user's direct-message conversations, with each peer's publicId, the latest message and the unread count. Use a peer's publicId with open_dm_thread to open the conversation.`,
    inputSchema: {
      type: 'object'
    },
    execute: () => {

      if (deps.isSignedIn() !== true) {
        throw new Error(`Sign in to see your messages`)
      }

      const conversations = deps.getConversations()

      if (conversations == null) {
        throw new Error(`Conversations are still loading. Try again in a moment.`)
      }

      if (conversations.length === 0) {
        return `You have no DM conversations yet.`
      }

      const lines = conversations.map(conversation => {
        const preview = conversation.lastMessage?.message ?? ''
        const unread = conversation.unreadCount > 0 ? ` (${conversation.unreadCount} unread)` : ''

        return `• ${conversation.peer.displayName} (publicId: ${conversation.peer.publicId})${preview !== '' ? ` — last message: "${preview}"` : ''}${unread}`
      })

      return `DM conversations:\n${lines.join('\n')}`
    }
  }
}

// open_dm_thread: opens a conversation by peer publicId.
export interface OpenDmThreadToolDeps {
  isSignedIn: () => boolean
  getConversations: () => DmConversation[] | undefined
  onOpenThread: (peerPublicId: string) => void
}

export function openDmThreadTool(deps: OpenDmThreadToolDeps): WebMcpTool {

  return {
    name: 'open_dm_thread',
    title: 'Open DM thread',
    description: `Open the direct-message thread with a peer on the messages page. Use list_dm_conversations to find the peer's publicId.`,
    inputSchema: {
      type: 'object',
      properties: {
        peerPublicId: {
          type: 'string',
          description: `Public ID of the peer to open a conversation with.`
        }
      },
      required: ['peerPublicId']
    },
    execute: (args) => {

      if (deps.isSignedIn() !== true) {
        throw new Error(`Sign in to see your messages`)
      }

      const peerPublicId = typeof args.peerPublicId === 'string' ? args.peerPublicId.trim() : ''

      if (peerPublicId === '') {
        throw new Error(`A peer public ID is required. Use list_dm_conversations to find one.`)
      }

      const conversations = deps.getConversations()
      const conversation = conversations?.find(entry => entry.peer.publicId === peerPublicId)

      if (conversations != null && conversation == null) {
        throw new Error(`No conversation found with peer public ID "${peerPublicId}". Use list_dm_conversations to see the available peers.`)
      }

      deps.onOpenThread(peerPublicId)

      return conversation != null ?
        `Opened conversation with ${conversation.peer.displayName}` :
        `Opening conversation with ${peerPublicId}`
    }
  }
}

// send_dm_message: sends a message in the currently open thread.
export interface SendDmMessageToolDeps {
  // True when a peer thread is open and loaded.
  hasPeer: () => boolean
  onSend: (message: string) => Promise<SubmitResult>
}

export function sendDmMessageTool(deps: SendDmMessageToolDeps): WebMcpTool {

  return {
    name: 'send_dm_message',
    title: 'Send DM message',
    description: `Send a direct message in the conversation thread currently open on the messages page. Open a thread with open_dm_thread first.`,
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: `Text of the message to send.`
        }
      },
      required: ['message']
    },
    execute: async (args) => {

      if (deps.hasPeer() !== true) {
        throw new Error(`No conversation is open. Use open_dm_thread to open one first.`)
      }

      const message = typeof args.message === 'string' ? args.message.trim() : ''

      if (message === '') {
        throw new Error(`Message text is required`)
      }

      const result = await deps.onSend(message)

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}
