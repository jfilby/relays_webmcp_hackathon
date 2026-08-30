import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation } from '@apollo/client/react'
import { createProfileMutation } from '@/apollo/profiles'

interface Props {
  userProfileId: string
  name: string
  updates: boolean
  type?: string
  isPublic?: boolean
  headline?: string
  bio?: string
  location?: string
  availabilityStatus?: string
  avatar?: string
  createAction: boolean
  setCreateAction: (value: boolean) => void
  setAlertSeverity: (value: 'success' | 'error' | undefined) => void
  setMessage: (value: string | undefined) => void
  setCreatedAction: (value: boolean) => void
  setKey: (value: string) => void
}

interface CreateProfileResult {
  status: boolean
  message: string
  profile: { id: string }
}

export default function CreateProfile({
  userProfileId,
  name,
  updates,
  type,
  isPublic,
  headline,
  bio,
  location,
  availabilityStatus,
  avatar,
  createAction,
  setCreateAction,
  setAlertSeverity,
  setMessage,
  setCreatedAction,
  setKey
}: Props) {

  // GraphQL
  const [sendCreateProfileMutation] =
    useMutation<{
      createProfile: CreateProfileResult
    }>(createProfileMutation, {
      fetchPolicy: 'no-cache'
    })

  // Functions
  async function createProfile() {

    // Query
    let createdData: CreateProfileResult | undefined

    await sendCreateProfileMutation({
      variables: {
        userProfileId: userProfileId,
        displayName: name,
        type: type,
        isPublic: isPublic,
        headline: headline != null && headline !== '' ? headline : null,
        bio: bio != null && bio !== '' ? bio : null,
        location: location != null && location !== '' ? location : null,
        avatar: avatar != null && avatar !== '' ? avatar : null,
        updates: updates === true,
        availabilityStatus: availabilityStatus != null && availabilityStatus !== '' ? availabilityStatus : null,
      }
    }).then(result => createdData = result.data?.createProfile)

    // Get results and set fields
    if (createdData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to create your profile`)
    } else if (createdData.status === true) {
      setAlertSeverity('success')
      toast(`Created`)

      if (createdData.profile?.id != null) {
        setKey(createdData.profile.id)
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
      await createProfile()
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