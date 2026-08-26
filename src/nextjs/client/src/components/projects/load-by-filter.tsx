import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { searchProjectsQuery } from '@/apollo/projects'
import type { Project } from '@/types/client-only-types'

interface ProjectsResults {
  status: boolean
  message?: string | null
  projects?: Project[] | null
}

interface Props {
  search: string
  isPromoted: boolean | undefined
  setProjects: (projects: Project[]) => void
  setAlertSeverity: (severity: 'success' | 'error' | undefined) => void
  setMessage: (message: string | undefined) => void
  loadAction: boolean
  setLoadAction: (value: boolean) => void
}

export default function LoadProjectsByFilter({
  search,
  isPromoted,
  setProjects,
  setAlertSeverity,
  setMessage,
  loadAction,
  setLoadAction
}: Props) {

  // GraphQL
  const { refetch: fetchSearchProjectsQuery } =
    useQuery<{ searchProjects: ProjectsResults }>(
      searchProjectsQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function searchProjects() {

    // Query
    const { data } = await
      fetchSearchProjectsQuery({
        search: search,
        isPromoted: isPromoted
      })

    if (data == null) {
      setAlertSeverity('error')
      setMessage(`Failed to search projects`)
      setLoadAction(false)
      return
    }

    const results = data.searchProjects

    if (results.status === true) {
      setProjects(results.projects ?? [])
    } else {
      setAlertSeverity('error')
      setMessage(results.message ?? undefined)
    }

    setLoadAction(false)
  }

  // Effects
  useEffect(() => {

    const fetchData = async () => {
      await searchProjects()
    }

    // Return early if no load requested
    if (loadAction === false) {
      return
    }

    // Async call
    const result = fetchData()
      .catch(console.error)

  }, [loadAction])

  // Render
  return (
    <></>
  )
}