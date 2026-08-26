import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getProjectsByUserProfileIdQuery } from '@/apollo/projects'
import type { Project } from '@/types/client-only-types'

interface ProjectsResults {
  status: boolean
  message?: string | null
  projects?: Project[] | null
}

interface Props {
  userProfileId: string
  setProjects: (projects: Project[]) => void
  setNotFound?: (notFound: boolean) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
}

export default function LoadProjectsByUserProfileId({
  userProfileId,
  setProjects,
  setNotFound,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const { refetch: fetchGetProjectsByUserProfileIdQuery } =
    useQuery<{ getProjectsByUserProfileId: ProjectsResults }>(
      getProjectsByUserProfileIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getProjects() {

    // Query
    const { data } = await
      fetchGetProjectsByUserProfileIdQuery({
        userProfileId: userProfileId
      })

    if (data == null) {
      setProjects([])
      if (setNotFound != null) {
        setNotFound(true)
      }
      return
    }

    const results = data.getProjectsByUserProfileId

    if (results.status === true) {
      setProjects(results.projects ?? [])
      if (setNotFound != null) {
        setNotFound(false)
      }
    } else {
      setProjects([])
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
      await getProjects()
    }

    // Async call
    const result = fetchData()
      .catch(console.error)

  }, [])

  // Render
  return (
    <></>
  )
}