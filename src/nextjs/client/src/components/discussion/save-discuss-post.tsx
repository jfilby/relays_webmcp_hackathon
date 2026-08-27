import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation } from '@apollo/client/react'
import { createDiscussPostMutation } from '@/apollo/discussion'
import type { DiscussPostItem } from '@/types/client-only-types'

interface StatusAndMessageAndPost {
  status: boolean
  message?: string | null
  post?: DiscussPostItem | null
}

interface Props {
  userProfileId: string
  title: string
  body: string
  saveAction: boolean
  setSaveAction: (value: boolean) => void
  setAlertSeverity: (severity: 'success' | 'error' | undefined) => void
  setMessage: (message: string | undefined) => void
}

export default function SaveDiscussPost({
  userProfileId,
  title,
  body,
  saveAction,
  setSaveAction,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const [sendCreateDiscussPostMutation] =
    useMutation<{
      createDiscussPost: StatusAndMessageAndPost
    }>(createDiscussPostMutation, {
      fetchPolicy: 'no-cache'
    })

  // Functions
  async function save() {

    // Mutation
    let savedData: StatusAndMessageAndPost | undefined

    await sendCreateDiscussPostMutation({
      variables: {
        userProfileId: userProfileId,
        title: title,
        body: body
      }
    }).then(result => savedData = result.data?.createDiscussPost)

    // Get results and surface messages
    if (savedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to create the post`)
    } else if (savedData.status === true) {
      setAlertSeverity('success')
      setMessage(savedData.message ?? undefined)
      toast(savedData.message)

      // Go to the new post's page
      if (savedData.post != null) {
        window.location.href = `/discuss/${savedData.post.id}`
        return
      }
    } else {
      setAlertSeverity('error')
      setMessage(savedData.message ?? undefined)
    }

    // Done
    setSaveAction(false)
  }

  // Effects
  useEffect(() => {

    // Return early if no save action requested
    if (saveAction !== true) {
      return
    }

    const fetchData = async () => {
      await save()
        .catch(console.error)
    }

    fetchData()

  }, [saveAction])

  // Render
  return (
    <>
      <Toaster />
    </>
  )
}
