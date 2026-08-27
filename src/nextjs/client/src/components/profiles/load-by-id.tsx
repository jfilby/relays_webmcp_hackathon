import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getProfileByPublicIdQuery } from '@/apollo/profiles'
import type { Profile } from '@/types/client-only-types'

interface ProfileResults {
  status: boolean
  message?: string | null
  profile?: Profile | null
}

interface Props {
  publicId: string
  userProfileId?: string
  setProfile: (profile: Profile | undefined) => void
  setNotFound?: (notFound: boolean) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
}

export default function LoadProfileByPublicId({
  publicId,
  userProfileId,
  setProfile,
  setNotFound,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const { refetch: fetchGetProfileByPublicIdQuery } =
    useQuery<{ getProfileByPublicId: ProfileResults }>(
      getProfileByPublicIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getProfile() {

    // Query
    const { data } = await
      fetchGetProfileByPublicIdQuery({
        publicId: publicId,
        userProfileId: userProfileId
      })

    if (data == null) {
      setProfile(undefined)
      if (setNotFound != null) {
        setNotFound(true)
      }
      return
    }

    const results = data.getProfileByPublicId

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

  }, [publicId])

  // Render
  return (
    <></>
  )
}