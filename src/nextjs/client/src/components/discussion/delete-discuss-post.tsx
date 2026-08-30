import { useEffect, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation } from '@apollo/client/react'
import { deleteDiscussPostMutation } from '@/apollo/discussion'
import DeleteDialog from '@/components/dialogs/delete-dialog'

interface StatusAndMessage {
  status: boolean
  message?: string | null
}

interface Props {
  userProfileId: string
  postId: string
  deleteAction: boolean
  setDeleteAction: (value: boolean) => void
  setAlertSeverity: (severity: 'success' | 'error' | undefined) => void
  setMessage: (message: string | undefined) => void
}

export default function DeleteDiscussPost({
  userProfileId,
  postId,
  deleteAction,
  setDeleteAction,
  setAlertSeverity,
  setMessage
}: Props) {

  // State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [deleteConfirmed, setDeleteConfirmed] = useState<boolean>(false)

  const [sendDeleteDiscussPostMutation] =
    useMutation<{
      deleteDiscussPost: StatusAndMessage
    }>(deleteDiscussPostMutation, {
      fetchPolicy: 'no-cache'
    })

  // Functions
  async function remove() {

    // Mutation
    let deletedData: StatusAndMessage | undefined

    await sendDeleteDiscussPostMutation({
      variables: {
        userProfileId: userProfileId,
        id: postId
      }
    }).then(result => deletedData = result.data?.deleteDiscussPost)

    // Get results and surface messages
    if (deletedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to delete the post`)
    } else if (deletedData.status === true) {
      setAlertSeverity('success')
      setMessage(deletedData.message ?? undefined)
      toast(deletedData.message)

      // Back to the discuss list
      window.location.href = '/discuss'
      return
    } else {
      setAlertSeverity('error')
      setMessage(deletedData.message ?? undefined)
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
        type='post'
        name='post'
        message='Are you sure? This will permanently delete the post and all of its comments. This cannot be undone.'
        setOpen={setDeleteDialogOpen}
        setDeleteConfirmed={setDeleteConfirmed} />
    </>
  )
}
