import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getModerationQueueQuery } from '@/apollo/moderation'
import type { ModerationFlagItem } from '@/types/client-only-types'

interface ModerationQueueResults {
  status: boolean
  message?: string | null
  items?: ModerationFlagItem[] | null
}

interface Props {
  userProfileId: string
  refreshToken?: number
  setItems: (items: ModerationFlagItem[] | undefined) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
}

// Loads the admin moderation queue. The server rejects non-admins, so a
// failed load is surfaced through the message props.
export default function LoadModerationQueue({
  userProfileId,
  refreshToken,
  setItems,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const { refetch: fetchGetModerationQueueQuery } =
    useQuery<{ getModerationQueue: ModerationQueueResults }>(
      getModerationQueueQuery, {
      skip: true
    })

  // Functions
  async function getQueue() {

    // Query
    const { data } = await
      fetchGetModerationQueueQuery({
        userProfileId: userProfileId
      })

    if (data == null) {
      setItems(undefined)

      if (setAlertSeverity != null && setMessage != null) {
        setAlertSeverity('error')
        setMessage(`Failed to load the moderation queue`)
      }

      return
    }

    const results = data.getModerationQueue

    if (results.status === true) {
      setItems(results.items ?? [])
    } else {
      setItems(undefined)

      if (setAlertSeverity != null && setMessage != null) {
        setAlertSeverity('error')
        setMessage(results.message ?? undefined)
      }
    }
  }

  // Effects
  useEffect(() => {

    getQueue()
  }, [userProfileId, refreshToken])

  // Render
  return (
    <></>
  )
}
