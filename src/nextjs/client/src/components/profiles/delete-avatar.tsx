import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation } from '@apollo/client/react'
import { deleteProfileAvatarMutation } from '@/apollo/profiles'

interface DeleteProfileAvatarResult {
  status: boolean
  message: string
}

interface Props {
  userProfileId: string
  deleteAction: boolean
  setDeleteAction: (value: boolean) => void
  setAlertSeverity: (value: 'success' | 'error' | undefined) => void
  setMessage: (value: string | undefined) => void
  setDeletedAction: (value: boolean) => void
}

export default function DeleteAvatar({
  userProfileId,
  deleteAction,
  setDeleteAction,
  setAlertSeverity,
  setMessage,
  setDeletedAction
}: Props) {

  // GraphQL
  const [sendDeleteProfileAvatarMutation] =
    useMutation<{
      deleteProfileAvatar: DeleteProfileAvatarResult
    }>(deleteProfileAvatarMutation, {
      fetchPolicy: 'no-cache'
    })

  // Functions
  async function deleteAvatar() {

    // Query
    let deletedData: DeleteProfileAvatarResult | undefined

    await sendDeleteProfileAvatarMutation({
      variables: {
        userProfileId: userProfileId
      }
    }).then(result => deletedData = result.data?.deleteProfileAvatar)

    // Get results and set fields
    if (deletedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to delete your profile photo`)
      setDeleteAction(false)
      return
    }

    if (deletedData.status === true) {
      setAlertSeverity('success')
      toast(deletedData.message)
      setDeletedAction(true)
    } else {
      setAlertSeverity('error')
      setMessage(deletedData.message)
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

    const fetchData = async () => {
      await deleteAvatar()
        .catch(console.error)
    }

    fetchData()

  }, [deleteAction])

  // Render
  return (
    <>
      <Toaster />
    </>
  )
}
