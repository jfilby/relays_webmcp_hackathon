import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { useMutation } from '@apollo/client/react'
import { updateProfileMutation } from '@/apollo/profiles'
import type { Profile } from '@/types/client-only-types'

interface UpdateProfileResult {
  status: boolean
  message: string
  profile: Profile
}

interface Props {
  id: string
  userProfileId: string
  displayName: string
  type: string
  isPublic: boolean
  headline: string
  bio: string
  location: string
  website: string
  availabilityStatus: string
  avatar: string
  updateAction: boolean
  setUpdateAction: (value: boolean) => void
  setAlertSeverity: (value: 'success' | 'error' | undefined) => void
  setMessage: (value: string | undefined) => void
  setUpdatedAction: (value: boolean) => void
}

export default function UpdateProfile({
  id,
  userProfileId,
  displayName,
  type,
  isPublic,
  headline,
  bio,
  location,
  website,
  avatar,
  availabilityStatus,
  updateAction,
  setUpdateAction,
  setAlertSeverity,
  setMessage,
  setUpdatedAction
}: Props) {

  // GraphQL
  const [sendUpdateProfileMutation] =
    useMutation<{
      updateProfile: UpdateProfileResult
    }>(updateProfileMutation, {
      fetchPolicy: 'no-cache'
    })

  // Functions
  async function updateProfile() {

    // Query
    let updatedData: UpdateProfileResult | undefined

    await sendUpdateProfileMutation({
      variables: {
        id: id,
        userProfileId: userProfileId,
        displayName: displayName,
        type: type,
        isPublic: isPublic,
        headline: headline !== '' ? headline : null,
        bio: bio !== '' ? bio : null,
        location: location !== '' ? location : null,
        website: website !== '' ? website : null,
        avatar: avatar !== '' ? avatar : null,
        availabilityStatus: availabilityStatus !== '' ? availabilityStatus : null
      }
    }).then(result => updatedData = result.data?.updateProfile)

    // Get results and set fields
    if (updatedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to update your profile`)
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
      await updateProfile()
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