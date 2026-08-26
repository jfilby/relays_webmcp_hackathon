import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getProfileByIdQuery } from '@/apollo/profiles'
import type { Profile } from '@/types/client-only-types'

interface ProfileResults {
  status: boolean
  message?: string | null
  profile?: Profile | null
}

interface Props {
  id: string
  userProfileId?: string
  setProfile: (profile: Profile | undefined) => void
  setNotFound?: (notFound: boolean) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
}

export default function LoadProfileById({
  id,
  userProfileId,
  setProfile,
  setNotFound,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const { refetch: fetchGetProfileByIdQuery } =
    useQuery<{ getProfileById: ProfileResults }>(
      getProfileByIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getProfile() {

    // Query
    const { data } = await
      fetchGetProfileByIdQuery({
        id: id,
        userProfileId: userProfileId
      })

    if (data == null) {
      setProfile(undefined)
      if (setNotFound != null) {
        setNotFound(true)
      }
      return
    }

    const results = data.getProfileById

    if (results.status === true) {
      setProfile(results.profile ?? undefined)
      if (setNotFound != null) {
        setNotFound(false)
      }
    } else {
      setProfile(undefined)
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
      await getProfile()
    }

    // Async call
    const result = fetchData()
      .catch(console.error)

  }, [id])

  // Render
  return (
    <></>
  )
}