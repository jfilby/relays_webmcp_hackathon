// client/src/components/dms/dm-popup.tsx
//
// The global DM pop-up, rendered on every page from the layout. Shows the
// signed-in user's conversations and a message thread; lives as a floating
// panel anchored bottom-right. Realtime updates flow over the shared
// Socket.io connection (see services/dms/dm-socket-service.ts).
import { useCallback, useEffect, useRef, useState } from 'react'
import { getCookie } from 'cookies-next'
import { useRouter } from 'next/router'
import { Avatar, Badge, Box, Button, Chip, IconButton, Paper, TextField, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ForumIcon from '@mui/icons-material/Forum'
import MinimizeIcon from '@mui/icons-material/Minimize'
import SendIcon from '@mui/icons-material/Send'
import { useMutation, useQuery } from '@apollo/client/react'
import {
  getDmConversationsQuery,
  getDmMessagesQuery,
  markDmThreadReadMutation
} from '@/apollo/dms'
import type { DmConversation, DmMessageItem, DmPeer } from '@/types/dm-types'

import {
  getDmSocket,
  joinDmRoom,
  markDmThreadRead as markDmThreadReadSocket,
  sendDm as sendDmSocket,
  type DmMessageEvent,
  type DmReadEvent,
  type DmSocket
} from '@/services/dms/dm-socket-service'
interface ConversationsResults {
  status: boolean
  message?: string | null
  conversations?: DmConversation[] | null
}

interface MessagesResults {
  status: boolean
  message?: string | null
  peer?: DmPeer | null
  messages?: DmMessageItem[] | null
}

interface MarkReadResult {
  status: boolean
  message: string
}

interface Props {
  userProfileId?: string
}

// Human-readable message time
function formatTime(value: string | undefined | null): string {

  if (value == null || value === '') {
    return ''
  }

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function DmPopup({ userProfileId: userProfileIdProp }: Props) {

  // Router
  const router = useRouter()

  // Session user: prefer the prop; fall back to the signedInUserUq cookie
  // set by the auth flow (see serene-core-client UsersService).
  const [cookieUserProfileId, setCookieUserProfileId] = useState<string>('')

  useEffect(() => {

    if (userProfileIdProp != null && userProfileIdProp !== '') {
      setCookieUserProfileId(userProfileIdProp)
      return
    }

    const cookieValue = getCookie('signedInUserUq')

    setCookieUserProfileId(typeof cookieValue === 'string' ? cookieValue : '')
  }, [userProfileIdProp])

  // Consts
  const userProfileId = userProfileIdProp != null && userProfileIdProp !== '' ?
    userProfileIdProp :
    cookieUserProfileId

  // State
  const [open, setOpen] = useState(false)
  const [activePeerPublicId, setActivePeerPublicId] = useState<string | undefined>(undefined)
  const [messages, setMessages] = useState<DmMessageItem[] | undefined>(undefined)
  const [peer, setPeer] = useState<DmPeer | undefined>(undefined)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [connected, setConnected] = useState(false)
  const [joined, setJoined] = useState(false)

  // Refs
  const socketRef = useRef<DmSocket | null>(null)
  const activePeerPublicIdRef = useRef<string | undefined>(undefined)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const threadBodyRef = useRef<HTMLDivElement | null>(null)

  // Keep the ref in sync for socket callbacks
  useEffect(() => {
    activePeerPublicIdRef.current = activePeerPublicId
  }, [activePeerPublicId])

  // GraphQL
  const { refetch: refetchConversations } =
    useQuery<{ getDmConversations: ConversationsResults }>(getDmConversationsQuery, {
      variables: {
        userProfileId: userProfileId
      },
      skip: true
    })

  const { refetch: refetchMessages } =
    useQuery<{ getDmMessages: MessagesResults }>(getDmMessagesQuery, {
      variables: {
        userProfileId: userProfileId,
        withProfilePublicId: activePeerPublicId ?? ''
      },
      skip: true
    })

  const [sendMarkDmThreadReadMutation] =
    useMutation<{ markDmThreadRead: MarkReadResult }>(
      markDmThreadReadMutation, {
        fetchPolicy: 'no-cache'
      })

  // Functions
  const loadConversations = useCallback(async () => {
    try {
      const results = await refetchConversations({
        userProfileId: userProfileId
      })
      // The list re-renders from the query cache; nothing else to do
      return results
    } catch (error) {
      console.error('DmPopup.loadConversations: error: ' + error)
      return null
    }
  }, [refetchConversations, userProfileId])

  const loadThread = useCallback(async (withProfilePublicId: string) => {
    try {
      const results = await refetchMessages({
        userProfileId: userProfileId,
        withProfilePublicId: withProfilePublicId
      })

      const resultsData = results.data?.getDmMessages

      if (resultsData == null) {
        return
      }

      if (resultsData.status === true) {
        setPeer(resultsData.peer ?? undefined)
        setMessages(resultsData.messages ?? [])
      }
    } catch (error) {
      console.error('DmPopup.loadThread: error: ' + error)
    }
  }, [refetchMessages, userProfileId])

  const markThreadRead = useCallback(async (withProfilePublicId: string) => {
    try {
      await sendMarkDmThreadReadMutation({
        variables: {
          userProfileId: userProfileId,
          withProfilePublicId: withProfilePublicId
        }
      })
    } catch (error) {
      console.error('DmPopup.markThreadRead: error: ' + error)
    }
  }, [sendMarkDmThreadReadMutation, userProfileId])

  const openThread = useCallback(async (peerPublicId: string) => {
    setActivePeerPublicId(peerPublicId)
    setMessages(undefined)
    await loadThread(peerPublicId)
  }, [loadThread])

  // Functions: send
  async function onSend() {

    // Validate
    if (draft.trim() === '' || activePeerPublicId == null || sending) {
      return
    }

    // Consts
    const message = draft.trim()

    setSending(true)
    setDraft('')

    // Optimistic add
    const optimisticMessage: DmMessageItem = {
      id: `pending-${Date.now()}`,
      fromProfileId: '',
      toProfileId: '',
      message: message,
      readAt: null,
      created: new Date().toISOString()
    }
    setMessages(prevMessages => [
      ...(prevMessages ?? []),
      optimisticMessage
    ])

    // Send over the socket (the server persists and broadcasts)
    try {
      const socket = socketRef.current

      if (socket != null) {
        const results = await sendDmSocket(
          socket,
          userProfileId,
          activePeerPublicId,
          message)

        if (results.status !== true) {
          console.error(`DmPopup.onSend: ${results.message}`)
          // Remove the optimistic message; the next refetch restores state
          setMessages(prevMessages =>
            (prevMessages ?? []).filter(m => m.id !== optimisticMessage.id))
          setDraft(message)
        }
      }
    } catch (error) {
      console.error('DmPopup.onSend: error: ' + error)
      setMessages(prevMessages =>
        (prevMessages ?? []).filter(m => m.id !== optimisticMessage.id))
      setDraft(message)
    } finally {
      setSending(false)
    }
  }

  // Effects: socket lifecycle
  useEffect(() => {

    let disposed = false

    getDmSocket()
      .then(socket => {
        if (disposed) {
          return
        }

        socketRef.current = socket

        socket.on('connect', () => {
          setConnected(true)
        })

        socket.on('disconnect', () => {
          setConnected(false)
        })

        // A persisted message arrived (for any of the user's conversations)
        socket.on('dm:message', (payload: DmMessageEvent) => {
          const dm = payload.dm

          // Update the open thread if the message belongs to it
          const currentPeerPublicId = activePeerPublicIdRef.current

          if (currentPeerPublicId != null) {
            loadThread(currentPeerPublicId)
          }

          // Refresh the conversation list (unread counts, ordering)
          loadConversations()

          // Ignore own messages (already shown optimistically)
          if (dm.fromProfileId === userProfileId) {
            return
          }
        })

        // The peer read our messages
        socket.on('dm:read', (payload: DmReadEvent) => {
          const currentPeerPublicId = activePeerPublicIdRef.current

          if (currentPeerPublicId != null) {
            loadThread(currentPeerPublicId)
          }
        })

        setJoined(false)
      }
    )

    return () => {
      disposed = true
    }
  }, [userProfileId, loadConversations, loadThread])

  // Join the personal room once connected
  useEffect(() => {

    if (connected !== true || joined === true) {
      return
    }

    const socket = socketRef.current

    if (socket == null) {
      return
    }

    joinDmRoom(socket, userProfileId)
      .then(result => {
        if (result === true) {
          setJoined(true)
        }
      })
      .catch(error => {
        console.error('DmPopup: join failed: ' + error)
      })
  }, [connected, joined, userProfileId])

  // Initial data load when the popup opens
  useEffect(() => {

    if (open !== true || joined !== true) {
      return
    }

    loadConversations()

    if (activePeerPublicId != null) {
      loadThread(activePeerPublicId)
    }
  }, [open, joined, activePeerPublicId, loadConversations, loadThread])

  // Mark the open thread as read
  useEffect(() => {

    if (open !== true || activePeerPublicId == null) {
      return
    }

    markThreadRead(activePeerPublicId)
  }, [open, activePeerPublicId, markThreadRead])

  // Auto-scroll the thread body to the newest message
  useEffect(() => {

    const threadBody = threadBodyRef.current

    if (threadBody != null) {
      threadBody.scrollTop = threadBody.scrollHeight
    }
  }, [messages])

  // Render
  return (
    <>
      {/* Floating action button */}
      {!open &&
        <IconButton
          aria-label='Messages'
          onClick={() => {
            setOpen(true)
          }}
          sx={{
            position: 'fixed',
            bottom: '1.5em',
            right: '1.5em',
            zIndex: 1200,
            width: '3.4em',
            height: '3.4em',
            backgroundColor: '#111111',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}>
          <Badge
            badgeContent={undefined}
            color='error'>
            <ForumIcon />
          </Badge>
        </IconButton>
      }

      {/* Popup panel */}
      {open &&
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            bottom: '1.5em',
            right: '1.5em',
            zIndex: 1200,
            width: '22em',
            height: '30em',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 0,
            overflow: 'hidden'
          }}>
          {/* Header */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5em',
            padding: '0.6em 0.9em',
            borderBottom: '1px solid #e4e4e4',
            backgroundColor: '#fafafa'
          }}>
            <Typography
              sx={{ fontWeight: 600, fontSize: '0.95rem' }}
              variant='body1'>
              {peer != null ?
                peer.displayName :
                'Messages'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
              {peer != null ?
                <IconButton
                  aria-label='Back to conversations'
                  onClick={() => {
                    setPeer(undefined)
                    setMessages(undefined)
                    setActivePeerPublicId(undefined)
                  }}
                  size='small'>
                  <Badge
                    badgeContent={undefined}
                    color='error'>
                    <ForumIcon fontSize='small' />
                  </Badge>
                </IconButton>
                :
                <></>
              }
              <IconButton
                aria-label='Open full messages page'
                onClick={() => {
                  setOpen(false)
                  router.push('/messages')
                }}
                size='small'>
                <MinimizeIcon fontSize='small' />
              </IconButton>
              <IconButton
                aria-label='Close messages'
                onClick={() => {
                  setOpen(false)
                }}
                size='small'>
                <CloseIcon fontSize='small' />
              </IconButton>
            </Box>
          </Box>

          {/* Body */}
          {peer != null ?
            <>
              {/* Thread */}
              <Box
                ref={threadBodyRef}
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '0.9em',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6em'
                }}>
                {messages != null ?
                  messages.map(message => {
                    const isMine = message.fromProfileId === '' ||
                      peer == null

                    return (
                      <Box
                        key={message.id}
                        sx={{
                          alignSelf: message.fromProfileId === userProfileId ?
                            'flex-end' :
                            'flex-start',
                          maxWidth: '85%'
                        }}>
                        <Box sx={{
                          padding: '0.55em 0.8em',
                          borderRadius: 10,
                          backgroundColor: message.fromProfileId === userProfileId ?
                            '#111111' :
                            '#efefef',
                          color: message.fromProfileId === userProfileId ?
                            '#ffffff' :
                            '#111111'
                        }}>
                          <Typography
                            sx={{ fontSize: '0.88rem', whiteSpace: 'pre-wrap' }}
                            variant='body2'>
                            {message.message}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontSize: '0.68rem',
                            color: '#9a9a9a',
                            textAlign: message.fromProfileId === userProfileId ?
                              'right' :
                              'left',
                            marginTop: '0.15em'
                          }}
                          variant='body2'>
                          {formatTime(message.created)}
                        </Typography>
                      </Box>
                    )
                  })
                  :
                  <Typography
                    sx={{ color: '#9a9a9a', textAlign: 'center', marginTop: '2em' }}
                    variant='body2'>
                    Loading..
                  </Typography>
                }
                <div ref={messagesEndRef} />
              </Box>

              {/* Compose */}
              <Box sx={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '0.5em',
                padding: '0.6em 0.9em',
                borderTop: '1px solid #e4e4e4'
              }}>
                <TextField
                  fullWidth
                  maxRows={3}
                  multiline
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      onSend()
                    }
                  }}
                  placeholder='Type a message..'
                  size='small'
                  value={draft} />
                <IconButton
                  aria-label='Send message'
                  disabled={sending || draft.trim() === ''}
                  onClick={onSend}
                  size='small'
                  sx={{
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#333333'
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#e0e0e0',
                      color: '#ffffff'
                    }
                  }}>
                  <SendIcon fontSize='small' />
                </IconButton>
              </Box>
            </>
            :
            /* Conversation list */
            <Box sx={{
              flex: 1,
              overflowY: 'auto'
            }}>
              <ConversationsList
                onOpenThread={openThread}
                userProfileId={userProfileId} />
            </Box>
          }
        </Paper>
      }
    </>
  )
}

// The conversation list, backed by the GraphQL query cache
function ConversationsList({
  userProfileId,
  onOpenThread
}: {
  userProfileId: string
  onOpenThread: (peerPublicId: string) => void
}) {

  // GraphQL
  const { data, loading, error } =
    useQuery<{ getDmConversations: ConversationsResults }>(getDmConversationsQuery, {
      variables: {
        userProfileId: userProfileId
      }
    })

  // Handle error
  if (error) {
    return (
      <Typography
        sx={{ color: '#b91c1c', padding: '1em', fontSize: '0.85rem' }}
        variant='body2'>
        Failed to load conversations
      </Typography>
    )
  }

  // Handle loading
  if (data == null) {
    return (
      <Typography
        sx={{ color: '#9a9a9a', padding: '1.5em', textAlign: 'center' }}
        variant='body2'>
        Loading..
      </Typography>
    )
  }

  // Consts
  const conversations = data.getDmConversations.conversations ?? []

  // Render
  return (
    <>
      {conversations.length === 0 ?
        <Typography
          sx={{ color: '#9a9a9a', padding: '1.5em', textAlign: 'center', fontSize: '0.88rem' }}
          variant='body2'>
          No conversations yet. Message someone from their profile.
        </Typography>
        :
        conversations.map(conversation => (
          <Box
            key={conversation.peer.id}
            onClick={() => onOpenThread(conversation.peer.publicId)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.7em',
              padding: '0.7em 0.9em',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}>
            <Avatar
              alt={`${conversation.peer.displayName} avatar`}
              src={conversation.peer.avatar || undefined}
              sx={{
                width: '2.4em',
                height: '2.4em',
                backgroundColor: '#111111',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem'
              }}>
              {conversation.peer.displayName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
                <Typography
                  sx={{
                    fontWeight: conversation.unreadCount > 0 ? 700 : 600,
                    fontSize: '0.88rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  variant='body2'>
                  {conversation.peer.displayName}
                </Typography>
                {conversation.peer.type === 'A' ?
                  <Chip
                    label='Agent'
                    size='small'
                    sx={{
                      height: '1.3em',
                      fontSize: '0.62rem'
                    }} />
                  :
                  <></>
                }
              </Box>
              <Typography
                sx={{
                  color: '#9a9a9a',
                  fontSize: '0.78rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                variant='body2'>
                {conversation.lastMessage != null ?
                  conversation.lastMessage.message :
                  ''}
              </Typography>
            </Box>
            {conversation.unreadCount > 0 ?
              <Chip
                label={conversation.unreadCount}
                color='primary'
                size='small'
                sx={{
                  height: '1.5em',
                  minWidth: '1.5em',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: '#111111',
                  color: '#ffffff'
                }} />
              :
              <></>
            }
          </Box>
        ))
      }
    </>
  )
}
