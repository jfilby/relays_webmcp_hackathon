import { useEffect, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation, useQuery } from '@apollo/client/react'
import {
  deleteDiscussCommentMutation,
  getDiscussCommentsByPostIdQuery
} from '@/apollo/discussion'
import type { DiscussCommentItem } from '@/types/client-only-types'
import DeleteDialog from '@/components/dialogs/delete-dialog'

interface StatusAndMessage {
  status: boolean
  message?: string | null
}

interface CommentsResults {
  status: boolean
  message?: string | null
  comments?: DiscussCommentItem[] | null
}

interface Props {
  userProfileId: string
  postId: string
  commentId?: string
  deleteAction: boolean
  setDeleteAction: (value: boolean) => void
  setComments: (comments: DiscussCommentItem[] | undefined) => void
  setAlertSeverity: (severity: 'success' | 'error' | undefined) => void
  setMessage: (message: string | undefined) => void
}

export default function DeleteDiscussComment({
  userProfileId,
  postId,
  commentId,
  deleteAction,
  setDeleteAction,
  setComments,
  setAlertSeverity,
  setMessage
}: Props) {

  // State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [deleteConfirmed, setDeleteConfirmed] = useState<boolean>(false)

  // GraphQL
  const [sendDeleteDiscussCommentMutation] =
    useMutation<{
      deleteDiscussComment: StatusAndMessage
    }>(deleteDiscussCommentMutation, {
      fetchPolicy: 'no-cache'
    })

  const { refetch: fetchGetDiscussCommentsByPostIdQuery } =
    useQuery<{ getDiscussCommentsByPostId: CommentsResults }>(
      getDiscussCommentsByPostIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function remove() {

    // Mutation
    let deletedData: StatusAndMessage | undefined

    await sendDeleteDiscussCommentMutation({
      variables: {
        userProfileId: userProfileId,
        id: commentId ?? ''
      }
    }).then(result => deletedData = result.data?.deleteDiscussComment)

    // Get results and surface messages
    if (deletedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to delete the comment`)
    } else if (deletedData.status === true) {
      setAlertSeverity('success')
      setMessage(deletedData.message ?? undefined)
      toast(deletedData.message)
    } else {
      setAlertSeverity('error')
      setMessage(deletedData.message ?? undefined)
    }

    // Refresh the comment list so the removal shows
    const { data } = await
      fetchGetDiscussCommentsByPostIdQuery({
        postId: postId
      })

    if (data != null && data.getDiscussCommentsByPostId.status === true) {
      setComments(data.getDiscussCommentsByPostId.comments ?? [])
    }

    // Done
    setDeleteAction(false)
  }

  // Effects
  useEffect(() => {

    // Return early if no delete action requested
    if (deleteAction !== true) {
      return
    }

    // Ask for confirmation before deleting
    setDeleteAction(false)
    setDeleteDialogOpen(true)

  }, [deleteAction])

  // Run the delete once confirmed by the dialog
  useEffect(() => {

    // Return early if not confirmed
    if (deleteConfirmed !== true) {
      return
    }

    setDeleteConfirmed(false)

    const fetchData = async () => {
      await remove()
        .catch(console.error)
    }

    fetchData()

  }, [deleteConfirmed])

  // Render
  return (
    <>
      <Toaster />

      <DeleteDialog
        open={deleteDialogOpen}
        type='comment'
        name='comment'
        message='Are you sure? This will permanently delete the comment. This cannot be undone.'
        setOpen={setDeleteDialogOpen}
        setDeleteConfirmed={setDeleteConfirmed} />
    </>
  )
}
