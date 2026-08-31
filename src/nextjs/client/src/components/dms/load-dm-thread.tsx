// client/src/components/dms/load-dm-thread.tsx
//
// Data component: loads a DM thread for a peer over GraphQL, subscribes to
// realtime updates over Socket.io, and marks the thread as read.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import {
  getDmMessagesQuery
} from '@/apollo/dms'
import { getProfileByUserProfileIdQuery } from '@/apollo/profiles'
import {
  getDmSocket,
  markDmThreadRead as markDmThreadReadSocket,
  sendDm,
  type DmMessageEvent,
  type DmReadEvent,
  type DmSocket
} from '@/services/dms/dm-socket-service'
import type { DmMessageItem, DmPeer } from '@/types/dm-types'
import type { SubmitResult } from '@/webmcp/tools/types'
import { sendDmMessageTool } from '@/webmcp/tools/dms'
import { useWebMcpTools } from '@/webmcp/webmcp'
import DmThread from './dm-thread'

interface MessagesResults {
  status: boolean
  message?: string | null
  peer?: DmPeer | null
  messages?: DmMessageItem[] | null
}

interface ProfileResults {
  status: boolean
  message?: string | null
  profile?: { id: string } | null
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

  // The signed-in user's profile id; DM messages are keyed by profile id
  const [myProfileId, setMyProfileId] = useState('')
  const myProfileIdRef = useRef('')

  // GraphQL
  const { data, refetch: refetchMessages } =
    useQuery<{ getDmMessages: MessagesResults }>(getDmMessagesQuery, {
      variables: {
        userProfileId: userProfileId,
        withProfilePublicId: withProfilePublicId
      }
    })

  const { data: profileData } =
    useQuery<{ getProfileByUserProfileId: ProfileResults }>(
      getProfileByUserProfileIdQuery, {
        variables: {
          userProfileId: userProfileId
        }
      })

  // Lift the viewer profile id into state
  useEffect(() => {
    const results = profileData?.getProfileByUserProfileId

    if (results?.status === true && results.profile != null) {
      setMyProfileId(results.profile.id)
      myProfileIdRef.current = results.profile.id
    }
  }, [profileData])


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
  async function onSend(message: string): Promise<SubmitResult> {

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

      if (socket == null) {
        setMessages(prevMessages =>
          (prevMessages ?? []).filter(m => m.id !== optimisticMessage.id))

        return { status: 'error', message: `Messaging is not connected yet. Try again in a moment.` }
      }

      const results = await sendDm(
        socket,
        userProfileId,
        withProfilePublicId,
        message)

      if (results.status !== true) {
        console.error(`LoadDmThread.onSend: ${results.message}`)
        setMessages(prevMessages =>
          (prevMessages ?? []).filter(m => m.id !== optimisticMessage.id))

        return { status: 'error', message: results.message ?? `The message could not be sent` }
      }

      return { status: 'ok', message: `Message sent to ${peer?.displayName ?? withProfilePublicId}` }
    } catch (error) {
      console.error('LoadDmThread.onSend: error: ' + error)
      setMessages(prevMessages =>
        (prevMessages ?? []).filter(m => m.id !== optimisticMessage.id))

      return { status: 'error', message: `The message could not be sent` }
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

    const markRead = async () => {
      try {
        // The socket path persists the read state and emits dm:read to both
        // personal rooms, so the sender's tick updates in realtime
        const socket = await getDmSocket()
        await markDmThreadReadSocket(socket, userProfileId, withProfilePublicId)
      } catch (error) {
        console.error('LoadDmThread: markRead failed: ' + error)
      }
    }

    // Mark as read when the thread opens
    markRead()

    // Realtime updates
    let disposed = false

    getDmSocket()
      .then(socket => {
        if (disposed) {
          return
        }

        socketRef.current = socket

        socket.on('dm:message', async (payload: DmMessageEvent) => {
          const dm = payload.dm

          // The thread is open and visible, so an incoming message has been
          // seen: remember it as read so the sender's tick updates
          if (dm.fromProfileId !== myProfileIdRef.current) {
            await markRead()
          }

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
  }, [withProfilePublicId, userProfileId, reload, onConversationsChanged])

  // WebMCP
  useWebMcpTools(() => [
    sendDmMessageTool({
      hasPeer: () => peer != null,
      onSend
    })
  ])

  // Render
  return (
    <DmThread
      messages={messages}
      myProfileId={myProfileId}
      peer={peer}
      sending={sending}
      onSend={onSend} />
  )
}
