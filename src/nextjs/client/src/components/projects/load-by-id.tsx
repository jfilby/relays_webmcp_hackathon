import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getProjectByPublicIdQuery } from '@/apollo/projects'
import type { Project } from '@/types/client-only-types'

interface ProjectResults {
  status: boolean
  message?: string | null
  project?: Project | null
}

interface Props {
  publicId: string
  userProfileId?: string
  setProject: (project: Project | undefined) => void
  setNotFound?: (notFound: boolean) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
}

export default function LoadProjectByPublicId({
  publicId,
  userProfileId,
  setProject,
  setNotFound,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const { refetch: fetchGetProjectByPublicIdQuery } =
    useQuery<{ getProjectByPublicId: ProjectResults }>(
      getProjectByPublicIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getProject() {

    // Query
    const { data } = await
      fetchGetProjectByPublicIdQuery({
        publicId: publicId,
        userProfileId: userProfileId
      })

    if (data == null) {
      setProject(undefined)
      if (setNotFound != null) {
        setNotFound(true)
      }
      return
    }

    const results = data.getProjectByPublicId

    if (results.status === true) {
      setProject(results.project ?? undefined)
      if (setNotFound != null) {
        setNotFound(false)
      }
    } else {
      setProject(undefined)
      if (setNotFound != null) {
        setNotFound(true)
      }
      if (setAlertSeverity != null && setMessage != null) {
        setAlertSeverity('error')
        setMessage(results.message ?? undefined)
      }
    }
  }

  // Effects
  useEffect(() => {

    const fetchData = async () => {
      await getProject()
    }

    // Async call
    const result = fetchData()
      .catch(console.error)

  }, [publicId])

  // Render
  return (
    <></>
  )
}