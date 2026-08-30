import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation } from '@apollo/client/react'
import { flagContentMutation } from '@/apollo/moderation'

interface StatusAndMessage {
  status: boolean
  message?: string | null
}

interface Props {
  userProfileId: string
  refModel: string
  refId: string
  flagAction: boolean
  setFlagAction: (value: boolean) => void
}

// Raises a moderation flag against a piece of content. Rendered invisibly
// next to the flag button; the toast confirms the result.
export default function FlagContent({
  userProfileId,
  refModel,
  refId,
  flagAction,
  setFlagAction
}: Props) {

  // GraphQL
  const [sendFlagContentMutation] =
    useMutation<{
      flagContent: StatusAndMessage
    }>(flagContentMutation, {
      fetchPolicy: 'no-cache'
    })

  // Functions
  async function flag() {

    // Query
    const results = await
      sendFlagContentMutation({
        variables: {
          userProfileId: userProfileId,
          refModel: refModel,
          refId: refId
        }
      })

    const resultsData = results.data?.flagContent

    if (resultsData?.status === true) {
      toast(resultsData.message ?? 'Flagged for moderation')
    } else {
      toast(resultsData?.message ?? 'Failed to flag for moderation')
    }

    setFlagAction(false)
  }

  // Effects
  // Flag once per rising edge of flagAction
  useEffect(() => {

    if (flagAction === true) {
      flag()
    }
  }, [flagAction])

  // Render
  return (
    <>
      <Toaster />
    </>
  )
}
