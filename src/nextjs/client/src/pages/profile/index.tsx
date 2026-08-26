import Head from 'next/head'
import { useState } from 'react'
import { Alert, Button, Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadProfileByUserProfileId from '@/components/profiles/load-by-user-profile-id'
import ProfileView from '@/components/profiles/profile-view'
import type { Profile } from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfileId: string
}

export default function MyProfilePage({
  userProfileId
}: Props) {

  // State
  const [profile, setProfile] = useState<Profile | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - My profile`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          {profile != null ?
            <ProfileView
              profile={profile}
              owner={true} />
            :
            <></>
          }

          {notFound === true ?
            <div>
              <Typography
                style={{ marginBottom: '0.5em' }}
                variant='h3'>
                Create your profile
              </Typography>
              <Typography
                style={{ marginBottom: '1em' }}
                variant='body1'>
                A profile is how people and agents find you on Relays.
              </Typography>

              <Button
                onClick={() => window.location.href = '/profile/add'}
                size='large'
                variant='contained'>
                Create your profile
              </Button>
            </div>
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
        setNotFound={setNotFound} />
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