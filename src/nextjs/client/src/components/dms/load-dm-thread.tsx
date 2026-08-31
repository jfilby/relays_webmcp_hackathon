// client/src/components/dms/load-dm-thread.tsx
//
// Data component: loads a DM thread for a peer over GraphQL, subscribes to
// realtime updates over Socket.io, and marks the thread as read.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { getDmMessagesQuery, markDmThreadReadMutation } from '@/apollo/dms'
import {
  getDmSocket,
  sendDm,
  type DmMessageEvent,
  type DmReadEvent,
  type DmSocket
} from '@/services/dms/dm-socket-service'
import type { DmMessageItem, DmPeer } from '@/types/dm-types'
import DmThread from './dm-thread'

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
  userProfileId: string
  withProfilePublicId: string
  onConversationsChanged?: () => void
}

export default function LoadDmThread({
  userProfileId,
  withProfilePublicId,
  onConversationsChanged
}: Props) {

  // State
  const [messages, setMessages] = useState<DmMessageItem[] | undefined>(undefined)
  const [peer, setPeer] = useState<DmPeer | undefined>(undefined)
  const [sending, setSending] = useState(false)

  // Refs
  const socketRef = useRef<DmSocket | null>(null)
  const pendingSendsRef = useRef(0)

  // GraphQL
  const { data, refetch: refetchMessages } =
    useQuery<{ getDmMessages: MessagesResults }>(getDmMessagesQuery, {
      variables: {
        userProfileId: userProfileId,
        withProfilePublicId: withProfilePublicId
      }
    })

  const [sendMarkDmThreadReadMutation] =
    useMutation<{ markDmThreadRead: MarkReadResult }>(
      markDmThreadReadMutation, {
        fetchPolicy: 'no-cache'
      })

  // Lift query data into state
  useEffect(() => {

    if (data == null) {
      return
    }
    const resultsData = data.getDmMessages

    if (resultsData.status === true) {
      setPeer(resultsData.peer ?? undefined)
      setMessages(resultsData.messages ?? [])
    }
  }, [data])

  // Functions
  const reload = useCallback(async () => {
    try {
      const results = await refetchMessages({
        userProfileId: userProfileId,
        withProfilePublicId: withProfilePublicId
      })
      const resultsData = results.data!.getDmMessages

      if (resultsData.status === true) {
        setPeer(resultsData.peer ?? undefined)
        setMessages(resultsData.messages ?? [])
      }
    } catch (error) {
      console.error('LoadDmThread.reload: error: ' + error)
    }
  }, [refetchMessages, userProfileId, withProfilePublicId])

  // Functions: send
  async function onSend(message: string) {

    // Consts
    const optimisticMessage: DmMessageItem = {
      id: `pending-${Date.now()}`,
      fromProfileId: userProfileId,
      toProfileId: peer?.id ?? '',
      message: message,
      readAt: null,
      created: new Date().toISOString()
    }

    setSending(true)
    pendingSendsRef.current += 1

    // Optimistic add
    setMessages(prevMessages => [
      ...(prevMessages ?? []),
      optimisticMessage
    ])

    // Send over the socket (the server persists and broadcasts; the dm:message
    // event reloads the thread with the persisted record)
    try {
      const socket = socketRef.current

      if (socket != null) {
        const results = await sendDm(
          socket,
          userProfileId,
          withProfilePublicId,
          message)

        if (results.status !== true) {
          console.error(`LoadDmThread.onSend: ${results.message}`)
          setMessages(prevMessages =>
            (prevMessages ?? []).filter(m => m.id !== optimisticMessage.id))
        }
      }
    } catch (error) {
      console.error('LoadDmThread.onSend: error: ' + error)
      setMessages(prevMessages =>
        (prevMessages ?? []).filter(m => m.id !== optimisticMessage.id))
    } finally {
      pendingSendsRef.current -= 1

      if (pendingSendsRef.current <= 0) {
        setSending(false)
      }
    }
  }

  // Effects: mark read + realtime
  useEffect(() => {

    if (withProfilePublicId == null || withProfilePublicId === '') {
      return
    }

    // Mark as read when the thread opens
    sendMarkDmThreadReadMutation({
      variables: {
        userProfileId: userProfileId,
        withProfilePublicId: withProfilePublicId
      }
    }).catch((error: unknown) => {
      console.error('LoadDmThread: markRead failed: ' + error)
    })

    // Realtime updates
    let disposed = false

    getDmSocket()
      .then(socket => {
        if (disposed) {
          return
        }

        socketRef.current = socket

        socket.on('dm:message', (_payload: DmMessageEvent) => {
          reload()
          onConversationsChanged?.()
        })

        socket.on('dm:read', (_payload: DmReadEvent) => {
          reload()
        })
      })
      .catch((error: unknown) => {
        console.error('LoadDmThread: socket failed: ' + error)
      })

    return () => {
      disposed = true
    }
  }, [withProfilePublicId, userProfileId, sendMarkDmThreadReadMutation, reload, onConversationsChanged])

  // Render
  return (
    <DmThread
      messages={messages}
      myProfileId={userProfileId}
      peer={peer}
      sending={sending}
      onSend={onSend} />
  )
}
