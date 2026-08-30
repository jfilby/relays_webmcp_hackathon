import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation } from '@apollo/client/react'
import { deleteFlaggedContentMutation } from '@/apollo/moderation'

interface StatusAndMessage {
  status: boolean
  message?: string | null
}

interface Props {
  userProfileId: string
  refModel: string
  refId: string
  action: boolean
  setAction: (value: boolean) => void
  onDone?: () => void
}

// Admin action: delete flagged content (a post with all its comments, or a
// comment). Resolves the flags so the item leaves the moderation queue.
export default function DeleteFlaggedContent({
  userProfileId,
  refModel,
  refId,
  action,
  setAction,
  onDone
}: Props) {

  // GraphQL
  const [sendDeleteFlaggedContentMutation] =
    useMutation<{
      deleteFlaggedContent: StatusAndMessage
    }>(deleteFlaggedContentMutation, {
      fetchPolicy: 'no-cache'
    })

  // Functions
  async function remove() {

    // Mutation
    const results = await
      sendDeleteFlaggedContentMutation({
        variables: {
          userProfileId: userProfileId,
          refModel: refModel,
          refId: refId
        }
      })

    const resultsData = results.data?.deleteFlaggedContent

    if (resultsData?.status === true) {
      toast(resultsData.message ?? 'Content deleted')
      onDone?.()
    } else {
      toast(resultsData?.message ?? 'Failed to delete the content')
    }

    setAction(false)
  }

  // Mutation fires on the rising edge of action
  useEffect(() => {

    if (action === true) {
      remove()
    }
  }, [action])

  // Render
  return (
    <Toaster />
  )
}
