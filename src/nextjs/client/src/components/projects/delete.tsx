import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation } from '@apollo/client/react'
import { deleteProjectMutation } from '@/apollo/projects'

interface Props {
  id: string
  userProfileId: string
  deleteAction: boolean
  setDeleteAction: (value: boolean) => void
  setAlertSeverity: (value: 'success' | 'error' | undefined) => void
  setMessage: (value: string | undefined) => void
  setDeletedAction: (value: boolean) => void
}

interface DeleteProjectResult {
  status: boolean
  message: string
}

export default function DeleteProject({
  id,
  userProfileId,
  deleteAction,
  setDeleteAction,
  setAlertSeverity,
  setMessage,
  setDeletedAction
}: Props) {

  // GraphQL
  const [sendDeleteProjectMutation] =
    useMutation<{
      deleteProject: DeleteProjectResult
    }>(deleteProjectMutation, {
      fetchPolicy: 'no-cache'
    })

  // Functions
  async function deleteProject() {

    // Query
    let deletedData: DeleteProjectResult | undefined

    await sendDeleteProjectMutation({
      variables: {
        id: id,
        userProfileId: userProfileId
      }
    }).then(result => deletedData = result.data?.deleteProject)

    // Get results and set fields
    if (deletedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to delete your project`)
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
      await deleteProject()
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