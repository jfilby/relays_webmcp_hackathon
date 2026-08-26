import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadProfileByUserProfileId from '@/components/profiles/load-by-user-profile-id'
import ProfileForm, { ProfileFormValues } from '@/components/profiles/profile-form'
import UpdateProfile from '@/components/profiles/update'
import type { Profile } from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfileId: string
}

export default function EditProfilePage({
  userProfileId
}: Props) {

  // State
  const [profile, setProfile] = useState<Profile | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)

  const [values, setValues] = useState<ProfileFormValues>({
    displayName: '',
    type: 'H',
    isPublic: true,
    headline: '',
    bio: '',
    location: '',
    website: ''
  })

  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  const [updateAction, setUpdateAction] = useState<boolean>(false)
  const [updatedAction, setUpdatedAction] = useState<boolean>(false)

  // Effects
  useEffect(() => {

    // Populate the form once the profile loads
    if (profile != null) {
      setValues({
        displayName: profile.displayName,
        type: profile.type ?? 'H',
        isPublic: profile.isPublic === true,
        headline: profile.headline ?? '',
        bio: profile.bio ?? '',
        location: profile.location ?? '',
        website: profile.website ?? ''
      })
    }

  }, [profile])

  useEffect(() => {

    if (updatedAction === true) {
      // Redirect to the viewer's profile once updated
      window.location.href = '/profile'
    }

  }, [updatedAction])

  // Functions
  function onFieldChange(field: keyof ProfileFormValues, value: string | boolean) {

    setValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  function onSubmit() {

    if (values.displayName.trim() === '') {
      setAlertSeverity('error')
      setMessage(`Display name is required`)
      return
    }

    setAlertSeverity(undefined)
    setMessage(undefined)
    setUpdateAction(true)
  }

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Edit profile`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          {profile != null ?
            <ProfileForm
              title='Edit your profile'
              values={values}
              onChange={onFieldChange}
              onSubmit={onSubmit}
              submitLabel='Save'
              saving={updateAction}
              alertSeverity={alertSeverity}
              message={message} />
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
        userProfileId={userProfileId}
        setProfile={setProfile}
        setNotFound={setNotFound}
        setAlertSeverity={setAlertSeverity}
        setMessage={setMessage} />

      {profile != null ?
        <UpdateProfile
          id={profile.id}
          userProfileId={userProfileId}
          displayName={values.displayName}
          type={values.type}
          isPublic={values.isPublic}
          headline={values.headline}
          bio={values.bio}
          location={values.location}
          website={values.website}
          avatar=''
          updateAction={updateAction}
          setUpdateAction={setUpdateAction}
          setAlertSeverity={setAlertSeverity}
          setMessage={setMessage}
          setUpdatedAction={setUpdatedAction} />
        :
        <></>
      }
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