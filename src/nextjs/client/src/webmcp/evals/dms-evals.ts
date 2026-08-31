//
// Evals for the direct-messages WebMCP tools: list_dm_conversations,
// open_dm_thread and send_dm_message.
//
import {
  check,
  checkDeepEqual,
  checkEqual,
  checkThrows,
  evals
} from './harness'
import {
  listDmConversationsTool,
  openDmThreadTool,
  sendDmMessageTool
} from '../tools/dms'
import type { DmConversation, DmMessageItem } from '@/types/dm-types'

// Conversation fixture: one peer with a last message and unread count.
function conversationFixture(publicId: string, displayName: string, lastMessage: string, unreadCount = 0): DmConversation {

  const message: DmMessageItem = {
    id: `msg-${publicId}`,
    fromProfileId: `profile-${publicId}`,
    toProfileId: 'my-profile',
    message: lastMessage,
    readAt: null,
    created: '2026-08-31T12:00:00.000Z'
  }

  return {
    peer: {
      id: `profile-${publicId}`,
      publicId: publicId,
      displayName: displayName,
      avatar: null,
      type: 'H'
    },
    lastMessage: lastMessage === '' ? null : message,
    unreadCount: unreadCount,
    created: '2026-08-31T12:00:00.000Z'
  }
}

evals('dms: list_dm_conversations formats loaded conversations', () => {

  const tool = listDmConversationsTool({
    isSignedIn: () => true,
    getConversations: () => [
      conversationFixture('peer-1', 'Alice', 'Hi there!'),
      conversationFixture('peer-2', 'Atlas', 'Task queued', 3)
    ]
  })

  checkEqual(tool.name, 'list_dm_conversations', 'tool name')

  const result = tool.execute({})

  checkEqual(result, [
    'DM conversations:',
    '• Alice (publicId: peer-1) — last message: "Hi there!"',
    '• Atlas (publicId: peer-2) — last message: "Task queued" (3 unread)'
  ].join('\n'), 'return message lists peers, previews and unread counts')
})

evals('dms: list_dm_conversations reports empty and signed-out states', () => {

  const signedOut = listDmConversationsTool({
    isSignedIn: () => false,
    getConversations: () => undefined
  })

  checkThrows(() => signedOut.execute({}), `Sign in to see your messages`, 'signed out should throw')

  const empty = listDmConversationsTool({
    isSignedIn: () => true,
    getConversations: () => []
  })

  checkEqual(empty.execute({}), `You have no DM conversations yet.`, 'empty list message')

  const loading = listDmConversationsTool({
    isSignedIn: () => true,
    getConversations: () => undefined
  })

  checkThrows(() => loading.execute({}), `Conversations are still loading`, 'still-loading should throw')
})

evals('dms: open_dm_thread opens a known peer and reports the display name', () => {

  const opened: string[] = []

  const tool = openDmThreadTool({
    isSignedIn: () => true,
    getConversations: () => [conversationFixture('peer-1', 'Alice', 'Hi there!')],
    onOpenThread: (peerPublicId) => {
      opened.push(peerPublicId)
    }
  })

  checkDeepEqual(tool.inputSchema.required, ['peerPublicId'], 'required fields')

  const result = tool.execute({ peerPublicId: '  peer-1  ' })

  checkEqual(result, `Opened conversation with Alice`, 'return message uses display name')
  checkDeepEqual(opened, ['peer-1'], 'open routed by trimmed publicId')
})

evals('dms: open_dm_thread rejects unknown peers and missing ids', () => {

  const opened: string[] = []

  const tool = openDmThreadTool({
    isSignedIn: () => true,
    getConversations: () => [conversationFixture('peer-1', 'Alice', 'Hi there!')],
    onOpenThread: (peerPublicId) => {
      opened.push(peerPublicId)
    }
  })

  checkThrows(() => tool.execute({ peerPublicId: 'ghost' }), `No conversation found with peer public ID "ghost"`, 'unknown peer should throw')
  checkThrows(() => tool.execute({ peerPublicId: '   ' }), `A peer public ID is required`, 'blank id should throw')
  checkThrows(() => tool.execute({}), `A peer public ID is required`, 'missing id should throw')
  checkDeepEqual(opened, [], 'nothing opened on failures')
})

evals('dms: open_dm_thread opens without validation while conversations load', () => {

  const opened: string[] = []

  const tool = openDmThreadTool({
    isSignedIn: () => true,
    getConversations: () => undefined,
    onOpenThread: (peerPublicId) => {
      opened.push(peerPublicId)
    }
  })

  const result = tool.execute({ peerPublicId: 'peer-9' })

  checkEqual(result, `Opening conversation with peer-9`, 'return message while loading')
  checkDeepEqual(opened, ['peer-9'], 'open routed without a known peer')
})

evals('dms: send_dm_message requires an open conversation', () => {

  const sent: string[] = []

  const tool = sendDmMessageTool({
    hasPeer: () => false,
    onSend: async (message) => {
      sent.push(message)
      return { status: 'ok', message: 'sent' }
    }
  })

  checkEqual(tool.name, 'send_dm_message', 'tool name')

  checkThrows(() => tool.execute({ message: 'hello' }), `No conversation is open. Use open_dm_thread to open one first.`, 'closed thread should throw')
  checkDeepEqual(sent, [], 'nothing sent without a peer')
})

evals('dms: send_dm_message trims, requires text and reports send results', async () => {

  const sent: string[] = []

  let failing = false

  const tool = sendDmMessageTool({
    hasPeer: () => true,
    onSend: async (message) => {

      sent.push(message)

      if (failing) {
        return { status: 'error', message: `The message could not be sent` }
      }

      return { status: 'ok', message: `Message sent to Alice` }
    }
  })

  checkDeepEqual(tool.inputSchema.required, ['message'], 'required fields')

  checkThrows(() => tool.execute({ message: '   ' }), `Message text is required`, 'blank message should throw')
  checkThrows(() => tool.execute({}), `Message text is required`, 'missing message should throw')

  const result = await tool.execute({ message: '  Hello from WebMCP  ' })

  checkEqual(result, `Message sent to Alice`, 'return message from send')
  checkDeepEqual(sent, ['Hello from WebMCP'], 'message trimmed before send')

  failing = true

  await checkThrows(() => tool.execute({ message: 'again' }), `The message could not be sent`, 'send failure should throw')
})

evals('dms: tools expose object input schemas', () => {

  const tools = [
    listDmConversationsTool({
      isSignedIn: () => true,
      getConversations: () => []
    }),
    openDmThreadTool({
      isSignedIn: () => true,
      getConversations: () => [],
      onOpenThread: () => undefined
    }),
    sendDmMessageTool({
      hasPeer: () => true,
      onSend: async () => ({ status: 'ok', message: '' })
    })
  ]

  for (const tool of tools) {
    check(tool.inputSchema.type === 'object', `${tool.name} has an object input schema`)
  }
})
