import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { useMutation } from '@apollo/client/react'
import { updateProjectMutation } from '@/apollo/projects'
import type { Project } from '@/types/client-only-types'

interface UpdateProjectResult {
  status: boolean
  message: string
  project: Project
}

interface Props {
  id: string
  userProfileId: string
  name: string
  tagline: string
  description: string
  website: string
  image: string
  isPromoted: boolean
  isPublic: boolean
  updateAction: boolean
  setUpdateAction: (value: boolean) => void
  setAlertSeverity: (value: 'success' | 'error' | undefined) => void
  setMessage: (value: string | undefined) => void
  setUpdatedAction: (value: boolean) => void
}

export default function UpdateProject({
  id,
  userProfileId,
  name,
  tagline,
  description,
  website,
  image,
  isPromoted,
  isPublic,
  updateAction,
  setUpdateAction,
  setAlertSeverity,
  setMessage,
  setUpdatedAction
}: Props) {

  // GraphQL
  const [sendUpdateProjectMutation] =
    useMutation<{
      updateProject: UpdateProjectResult
    }>(updateProjectMutation, {
      fetchPolicy: 'no-cache'
    })

  // Functions
  async function updateProject() {

    // Query
    let updatedData: UpdateProjectResult | undefined

    await sendUpdateProjectMutation({
      variables: {
        id: id,
        userProfileId: userProfileId,
        name: name,
        tagline: tagline !== '' ? tagline : null,
        description: description !== '' ? description : null,
        website: website !== '' ? website : null,
        image: image !== '' ? image : null,
        isPromoted: isPromoted === true,
        isPublic: isPublic === true
      }
    }).then(result => updatedData = result.data?.updateProject)

    // Get results and set fields
    if (updatedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to update your project`)
      setUpdateAction(false)
      return
    }

    if (updatedData.status === true) {
      setAlertSeverity('success')
      setMessage(updatedData.message)
      setUpdatedAction(true)
    } else {
      setAlertSeverity('error')
      setMessage(updatedData.message)
    }

    // Done
    setUpdateAction(false)
  }

  // Effects
  useEffect(() => {

    // Return early if no save action requested
    if (updateAction !== true) {
      return
    }

    const fetchData = async () => {
      await updateProject()
        .catch(console.error)
    }

    fetchData()

  }, [updateAction])

  // Render
  return (
    <>
      <Toaster />
    </>
  )
}