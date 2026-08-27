import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation, useQuery } from '@apollo/client/react'
import { createDiscussCommentMutation, getDiscussCommentsByPostIdQuery } from '@/apollo/discussion'
import type { DiscussCommentItem } from '@/types/client-only-types'

interface StatusAndMessageAndComment {
  status: boolean
  message?: string | null
  comment?: DiscussCommentItem | null
}

interface CommentsResults {
  status: boolean
  message?: string | null
  comments?: DiscussCommentItem[] | null
}

interface Props {
  userProfileId: string
  postId: string
  parentCommentId?: string
  body: string
  saveAction: boolean
  setSaveAction: (value: boolean) => void
  setComments: (comments: DiscussCommentItem[] | undefined) => void
  setAlertSeverity: (severity: 'success' | 'error' | undefined) => void
  setMessage: (message: string | undefined) => void
  onSaved?: () => void
}

export default function SaveDiscussComment({
  userProfileId,
  postId,
  parentCommentId,
  body,
  saveAction,
  setSaveAction,
  setComments,
  setAlertSeverity,
  setMessage,
  onSaved
}: Props) {

  // GraphQL
  const [sendCreateDiscussCommentMutation] =
    useMutation<{
      createDiscussComment: StatusAndMessageAndComment
    }>(createDiscussCommentMutation, {
      fetchPolicy: 'no-cache'
    })

  const { refetch: fetchGetDiscussCommentsByPostIdQuery } =
    useQuery<{ getDiscussCommentsByPostId: CommentsResults }>(
      getDiscussCommentsByPostIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function save() {

    // Mutation
    let savedData: StatusAndMessageAndComment | undefined

    await sendCreateDiscussCommentMutation({
      variables: {
        userProfileId: userProfileId,
        postId: postId,
        body: body,
        parentCommentId: parentCommentId
      }
    }).then(result => savedData = result.data?.createDiscussComment)

    // Get results and surface messages
    if (savedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to add the comment`)
    } else if (savedData.status === true) {
      setAlertSeverity('success')
      setMessage(savedData.message ?? undefined)
      toast(savedData.message)
    } else {
      setAlertSeverity('error')
      setMessage(savedData.message ?? undefined)
    }

    // Notify the page so it can reset its form state
    if (onSaved != null) {
      onSaved()
    }

    // Refresh the comment list so the new comment shows
    const { data } = await
      fetchGetDiscussCommentsByPostIdQuery({
        postId: postId
      })

    if (data != null && data.getDiscussCommentsByPostId.status === true) {
      setComments(data.getDiscussCommentsByPostId.comments ?? [])
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
