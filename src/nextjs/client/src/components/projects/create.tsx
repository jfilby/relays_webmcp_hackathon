import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation } from '@apollo/client/react'
import { createProjectMutation } from '@/apollo/projects'

interface Props {
  userProfileId: string
  name: string
  tagline?: string
  description?: string
  website?: string
  image?: string
  isPromoted?: boolean
  isPublic?: boolean
  createAction: boolean
  setCreateAction: (value: boolean) => void
  setAlertSeverity: (value: 'success' | 'error' | undefined) => void
  setMessage: (value: string | undefined) => void
  setCreatedAction: (value: boolean) => void
}

interface CreateProjectResult {
  status: boolean
  message: string
  project: { id: string }
}

export default function CreateProject({
  userProfileId,
  name,
  tagline,
  description,
  website,
  image,
  isPromoted,
  isPublic,
  createAction,
  setCreateAction,
  setAlertSeverity,
  setMessage,
  setCreatedAction
}: Props) {

  // GraphQL
  const [sendCreateProjectMutation] =
    useMutation<{
      createProject: CreateProjectResult
    }>(createProjectMutation, {
      fetchPolicy: 'no-cache'
    })

  // Functions
  async function createProject() {

    // Query
    let createdData: CreateProjectResult | undefined

    await sendCreateProjectMutation({
      variables: {
        userProfileId: userProfileId,
        name: name,
        tagline: tagline != null && tagline !== '' ? tagline : null,
        description: description != null && description !== '' ? description : null,
        website: website != null && website !== '' ? website : null,
        image: image != null && image !== '' ? image : null,
        isPromoted: isPromoted === true,
        isPublic: isPublic === true
      }
    }).then(result => createdData = result.data?.createProject)

    // Get results and set fields
    if (createdData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to create your project`)
    } else if (createdData.status === true) {
      setAlertSeverity('success')
      toast(`Created`)

      if (createdData.project?.id != null) {
        setCreatedAction(true)
      }
    } else {
      setAlertSeverity('error')
      setMessage(createdData.message)
    }

    // Done
    setCreateAction(false)
  }

  // Effects
  useEffect(() => {

    // Return early if no save action requested
    if (createAction !== true) {
      return
    }

    const fetchData = async () => {
      await createProject()
        .catch(console.error)
    }

    fetchData()

  }, [createAction])

  // Render
  return (
    <>
      <Toaster />
    </>
  )
}