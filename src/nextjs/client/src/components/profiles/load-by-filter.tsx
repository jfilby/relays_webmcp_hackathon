import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { searchProfilesQuery } from '@/apollo/profiles'
import type { Profile } from '@/types/client-only-types'

interface ProfilesResults {
  status: boolean
  message?: string | null
  profiles?: Profile[] | null
}

interface Props {
  search: string
  type: string | undefined
  setProfiles: (profiles: Profile[]) => void
  setAlertSeverity: (severity: 'success' | 'error' | undefined) => void
  setMessage: (message: string | undefined) => void
  loadAction: boolean
  setLoadAction: (value: boolean) => void
}

export default function LoadProfilesByFilter({
  search,
  type,
  setProfiles,
  setAlertSeverity,
  setMessage,
  loadAction,
  setLoadAction
}: Props) {

  // GraphQL
  const { refetch: fetchSearchProfilesQuery } =
    useQuery<{ searchProfiles: ProfilesResults }>(
      searchProfilesQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function searchProfiles() {

    // Query
    const { data } = await
      fetchSearchProfilesQuery({
        search: search,
        type: type
      })

    if (data == null) {
      setAlertSeverity('error')
      setMessage(`Failed to search profiles`)
      setLoadAction(false)
      return
    }

    const results = data.searchProfiles

    if (results.status === true) {
      setProfiles(results.profiles ?? [])
    } else {
      setAlertSeverity('error')
      setMessage(results.message ?? undefined)
    }

    setLoadAction(false)
  }

  // Effects
  useEffect(() => {

    const fetchData = async () => {
      await searchProfiles()
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