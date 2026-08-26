import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getNetworkQuery } from '@/apollo/network'
import type { Profile } from '@/types/client-only-types'

interface ProfilesResults {
  status: boolean
  message?: string | null
  profiles?: Profile[] | null
}

interface Props {
  userProfileId: string
  setProfiles: (profiles: Profile[] | undefined) => void
  setNotFound: (notFound: boolean) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
}

export default function LoadNetwork({
  userProfileId,
  setProfiles,
  setNotFound,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const { refetch: fetchGetNetworkQuery } =
    useQuery<{ getNetwork: ProfilesResults }>(
      getNetworkQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getNetwork() {

    // Query
    const { data } = await
      fetchGetNetworkQuery({
        userProfileId: userProfileId
      })

    if (data == null) {
      setProfiles(undefined)
      setNotFound(true)
      return
    }

    const results = data.getNetwork

    if (results.status === true) {
      setProfiles(results.profiles ?? [])
      setNotFound(false)
    } else {
      setProfiles(undefined)
      setNotFound(true)
      if (setAlertSeverity != null && setMessage != null) {
        setAlertSeverity('error')
        setMessage(results.message ?? undefined)
      }
    }
  }

  // Effects
  useEffect(() => {

    const fetchData = async () => {
      await getNetwork()
    }

    // Return early if no signed-in user id
    if (userProfileId == null || userProfileId === '') {
      return
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
