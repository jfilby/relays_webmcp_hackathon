import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation } from '@apollo/client/react'
import { setModerationFlagStatusMutation } from '@/apollo/moderation'

interface StatusAndMessage {
  status: boolean
  message?: string | null
}

interface Props {
  userProfileId: string
  refModel: string
  refId: string
  status: string
  action: boolean
  setAction: (value: boolean) => void
  onDone?: () => void
}

// Admin action: dismiss or resolve every pending flag on an item. Rendered
// invisibly next to the moderation queue actions; the toast confirms the
// result.
export default function SetModerationFlagStatus({
  userProfileId,
  refModel,
  refId,
  status,
  action,
  setAction,
  onDone
}: Props) {

  // GraphQL
  const [sendSetModerationFlagStatusMutation] =
    useMutation<{
      setModerationFlagStatus: StatusAndMessage
    }>(setModerationFlagStatusMutation, {
      fetchPolicy: 'no-cache'
    })

  // Functions
  async function update() {

    // Mutation
    const results = await
      sendSetModerationFlagStatusMutation({
        variables: {
          userProfileId: userProfileId,
          refModel: refModel,
          refId: refId,
          status: status
        }
      })

    const resultsData = results.data?.setModerationFlagStatus

    if (resultsData?.status === true) {
      toast(resultsData.message ?? 'Flags updated')
      onDone?.()
    } else {
      toast(resultsData?.message ?? 'Failed to update the flags')
    }

    setAction(false)
  }

  useEffect(() => {

    if (action === true) {
      update()
    }
  }, [action])

  // Render
  return (
    <Toaster />
  )
}
