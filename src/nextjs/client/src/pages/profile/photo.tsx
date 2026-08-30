import Head from 'next/head'
import { useEffect, useState, type ChangeEvent } from 'react'
import { Alert, Avatar, Button, Typography } from '@mui/material'
import { Toaster, toast } from 'sonner'
import { useMutation } from '@apollo/client/react'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadProfileByUserProfileId from '@/components/profiles/load-by-user-profile-id'
import { updateProfileMutation } from '@/apollo/profiles'
import type { Profile, UserProfile } from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

// The largest accepted photo (2 MB); the server enforces the same limit
const maxPhotoBytes = 2 * 1024 * 1024

// Photo types accepted by the server's avatar upload API
const allowedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default function ProfilePhotoPage({
  userProfile
}: Props) {

  // State
  const [profile, setProfile] = useState<Profile | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  const [file, setFile] = useState<File | undefined>(undefined)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const [saving, setSaving] = useState<boolean>(false)

  // GraphQL
  const [sendUpdateProfileMutation] =
    useMutation<{
      updateProfile: {
        status: boolean
        message: string
      }
    }>(updateProfileMutation, {
      fetchPolicy: 'no-cache'
    })

  // Effects
  // Release the preview URL when it changes or the page is left
  useEffect(() => {

    return () => {
      if (previewUrl != null) {
        URL.revokeObjectURL(previewUrl)
      }
    }

  }, [previewUrl])


  // Functions
  function onFileChange(event: ChangeEvent<HTMLInputElement>) {

    const selected = event.target.files?.[0]

    // Reset the previous selection
    setFile(undefined)
    setPreviewUrl(undefined)
    setAlertSeverity(undefined)
    setMessage(undefined)

    // Validate
    if (selected == null) {
      return
    }

    if (allowedPhotoTypes.includes(selected.type) === false) {
      setAlertSeverity('error')
      setMessage(`Unsupported image type (use JPEG, PNG, WebP or GIF)`)
      return
    }

    if (selected.size > maxPhotoBytes) {
      setAlertSeverity('error')
      setMessage(`Image is too large (maximum 2 MB)`)
      return
    }

    // Accept the selection
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  async function onUpload() {

    if (file == null || profile == null) {
      return
    }

    setSaving(true)
    setAlertSeverity(undefined)
    setMessage(undefined)

    // Upload the file to the server API
    let uploadData: { status: boolean, message?: string, filename?: string } | undefined

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/avatars/upload?userProfileId=${userProfile.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': file.type
          },
          body: file
        })

      uploadData = await response.json()
    } catch (error) {
      console.error(`ProfilePhotoPage.onUpload(): error: ${error}`)
    }

    if (uploadData == null || uploadData.status !== true || uploadData.filename == null) {
      setAlertSeverity('error')
      setMessage(uploadData?.message ?? `Failed to upload the photo`)
      setSaving(false)
      return
    }

    // The avatar URL is served by the server API
    const avatarUrl = `${process.env.NEXT_PUBLIC_API_URL}/avatars/${uploadData.filename}`

    // Store the avatar URL on the profile
    let updatedData: { status: boolean, message?: string } | undefined

    await sendUpdateProfileMutation({
      variables: {
        id: profile.id,
        userProfileId: userProfile.id,
        displayName: profile.displayName,
        type: profile.type,
        isPublic: profile.isPublic,
        headline: profile.headline ?? null,
        bio: profile.bio ?? null,
        location: profile.location ?? null,
        avatar: avatarUrl,
        availabilityStatus: profile.availabilityStatus ?? null
      }
    }).then(result => updatedData = result.data?.updateProfile)

    if (updatedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to save the photo on your profile`)
      setSaving(false)
      return
    }

    if (updatedData.status === true) {
      // Redirect to the viewer's profile once saved
      window.location.href = '/profile'
    } else {
      setAlertSeverity('error')
      setMessage(updatedData.message)
    }

    // Done
    setSaving(false)
  }

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Profile photo`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          {alertSeverity != null && message != null ?
            <Alert
              severity={alertSeverity}
              style={{ marginBottom: '1.5em' }}>
              {message}
            </Alert>
            :
            <></>
          }

          {profile != null ?
            <>
              <Typography
                style={{ marginBottom: '1em' }}
                variant='h3'>
                Profile photo
              </Typography>

              <div style={{ marginBottom: '1em' }}>
                <Avatar
                  alt={`${profile.displayName} avatar`}
                  src={(previewUrl ?? profile.avatar) || undefined}
                  sx={{
                    width: '8em',
                    height: '8em',
                    fontSize: '2.5rem',
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    fontWeight: 700
                  }}>
                  {profile.displayName?.charAt(0)?.toUpperCase()}
                </Avatar>
              </div>

              <Typography
                style={{ marginBottom: '1em' }}
                variant='body1'>
                {profile.type === 'A' ?
                  `The photo is shown next to the agent's profile when other members view it.`
                  :
                  `The photo is shown next to your profile when other members view it.`
                }
                {' '}A square image works best. JPEG, PNG, WebP or GIF up to 2 MB.
              </Typography>

              <div style={{ marginBottom: '2em' }}>
                <Button
                  component='label'
                  variant='outlined'
                  sx={{ display: 'flex', marginBottom: '1em' }}>
                  Choose photo
                  <input
                    accept='image/jpeg,image/png,image/webp,image/gif'
                    hidden
                    onChange={onFileChange}
                    type='file' />
                </Button>

                <Button
                  disabled={file == null || saving}
                  onClick={onUpload}
                  variant='contained'>
                  {saving ? `Saving..` : `Save photo`}
                </Button>
              </div>

              {profile.avatar != null && profile.avatar !== '' ?
                <Button
                  href='/profile/photo/delete'>
                  Delete current photo
                </Button>
                :
                <></>
              }
            </>
            :
            <></>
          }

          {notFound === true ?
            <Typography variant='body1'>
              You don&apos;t have a profile yet.
            </Typography>
            :
            <></>
          }

          {profile == null && notFound === false ?
            <Typography variant='body1'>
              Loading..
            </Typography>
            :
            <></>
          }
        </div>
      </Layout>

      <LoadProfileByUserProfileId
        userProfileId={userProfile.id}
        setProfile={setProfile}
        setNotFound={setNotFound}
        setAlertSeverity={setAlertSeverity}
        setMessage={setMessage} />

      <Toaster />
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  return loadServerPage(
    context,
    {
      verifyLoggedInUsersOnly: true
    })
}
