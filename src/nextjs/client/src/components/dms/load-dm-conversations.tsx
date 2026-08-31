// client/src/components/dms/load-dm-conversations.tsx
//
// Data component: loads the signed-in user's DM conversations over GraphQL
// and passes them to a visual renderer. Supports external refresh triggers
// (e.g. realtime events) via the refreshKey prop.
import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { getDmConversationsQuery } from '@/apollo/dms'
import type { DmConversation } from '@/types/dm-types'
import DmConversationList from './dm-conversation-list'

interface ConversationsResults {
  status: boolean
  message?: string | null
  conversations?: DmConversation[] | null
}

interface Props {
  userProfileId: string
  myProfileId: string
  onOpenThread: (peerPublicId: string) => void
  refreshKey?: number
  setConversations?: (conversations: DmConversation[]) => void
}

export default function LoadDmConversations({
  userProfileId,
  myProfileId,
  onOpenThread,
  refreshKey = 0,
  setConversations
}: Props) {

  // GraphQL
  const { data, loading, error, refetch } =
    useQuery<{ getDmConversations: ConversationsResults }>(getDmConversationsQuery, {
      variables: {
        userProfileId: userProfileId
      }
    })

  // State
  const [conversations, setConversationsState] = useState<DmConversation[] | undefined>(undefined)

  // Lift query data into state
  useEffect(() => {

    if (data == null) {
      return
    }

    const resultsData = data.getDmConversations

    if (resultsData.status === true) {
      setConversationsState(resultsData.conversations ?? [])
      setConversations?.(resultsData.conversations ?? [])
    }
  }, [data, setConversations])

  // External refresh trigger
  useEffect(() => {

    if (refreshKey === 0) {
      return
    }

    refetch({
      userProfileId: userProfileId
    }).catch((error: unknown) => {
      console.error('LoadDmConversations: refetch failed: ' + error)
    })
  }, [refreshKey, refetch, userProfileId])

  // Render
  return (
    <DmConversationList
      conversations={conversations}
      error={error != null}
      loading={loading}
      myProfileId={myProfileId}
      onOpenThread={onOpenThread}
    />
  )
}
