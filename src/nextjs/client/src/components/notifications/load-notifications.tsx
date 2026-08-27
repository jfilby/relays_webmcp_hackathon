import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation, useQuery } from '@apollo/client/react'
import { getNotificationsQuery, markNotificationAsReadMutation } from '@/apollo/notifications'
import type { NotificationItem } from '@/types/client-only-types'

interface NotificationsResults {
  status: boolean
  message?: string | null
  notifications?: NotificationItem[] | null
}

interface MarkReadResult {
  status: boolean
  message: string
}

interface Props {
  userProfileId: string
  markReadNotificationId?: string
  markReadAction: boolean
  setMarkReadAction: (value: boolean) => void
  setMarkingRead: (value: string | undefined) => void
  setNotifications: (notifications: NotificationItem[] | undefined) => void
  setAlertSeverity: (severity: 'success' | 'error' | undefined) => void
  setMessage: (message: string | undefined) => void
}

export default function LoadNotifications({
  userProfileId,
  markReadNotificationId,
  markReadAction,
  setMarkReadAction,
  setMarkingRead,
  setNotifications,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const { refetch: fetchGetNotificationsQuery } =
    useQuery<{ getNotifications: NotificationsResults }>(
      getNotificationsQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  const [sendMarkNotificationAsReadMutation] =
    useMutation<{
      markNotificationAsRead: MarkReadResult
    }>(markNotificationAsReadMutation, {
      fetchPolicy: 'no-cache'
    })

  // Functions
  async function getNotifications() {

    // Query
    const { data } = await
      fetchGetNotificationsQuery({
        userProfileId: userProfileId,
        unreadOnly: false
      })

    if (data == null) {
      setNotifications(undefined)
      return
    }

    const results = data.getNotifications

    if (results.status === true) {
      setNotifications(results.notifications ?? [])
    } else {
      setNotifications(undefined)
      setAlertSeverity('error')
      setMessage(results.message ?? undefined)
    }
  }

  async function markNotificationAsRead() {

    // Mutation
    let markedData: MarkReadResult | undefined

    await sendMarkNotificationAsReadMutation({
      variables: {
        userProfileId: userProfileId,
        id: markReadNotificationId
      }
    }).then(result => markedData = result.data?.markNotificationAsRead)

    // Get results and surface messages
    if (markedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to mark the notification as read`)
    } else if (markedData.status === true) {
      setAlertSeverity('success')
      setMessage(markedData.message)
      toast(markedData.message)
    } else {
      setAlertSeverity('error')
      setMessage(markedData.message)
    }

    // Refresh the notifications list
    await getNotifications()

    // Done
    setMarkingRead(undefined)
    setMarkReadAction(false)
  }

  // Effects
  useEffect(() => {

    const fetchData = async () => {
      await getNotifications()
    }

    // Return early if no signed-in user id
    if (userProfileId == null || userProfileId === '') {
      return
    }

    // Async call
    const result = fetchData()
      .catch(console.error)

  }, [])

  useEffect(() => {

    // Return early if no mark as read action requested
    if (markReadAction !== true) {
      return
    }

    const fetchData = async () => {
      await markNotificationAsRead()
        .catch(console.error)
    }

    fetchData()

  }, [markReadAction])

  // Render
  return (
    <>
      <Toaster />
    </>
  )
}
