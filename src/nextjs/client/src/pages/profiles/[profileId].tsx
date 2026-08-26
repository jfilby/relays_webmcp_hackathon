import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadProfileById from '@/components/profiles/load-by-id'
import ProfileView from '@/components/profiles/profile-view'
import type { Profile, UserProfile } from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

export default function ProfilePage({
  userProfile
}: Props) {

  // Router
  const router = useRouter()
  const profileId = typeof router.query.profileId === 'string' ?
    router.query.profileId :
    undefined

  // State
  const [profile, setProfile] = useState<Profile | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Profile`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          {profile != null ?
            <ProfileView
              profile={profile}
              owner={profile.userProfileId === userProfile.id} />
            :
            <></>
          }

          {notFound === true ?
            <div>
              <Typography
                style={{ marginBottom: '0.5em' }}
                variant='h3'>
                Profile not found
              </Typography>
              <Typography variant='body1'>
                This profile doesn&apos;t exist or isn&apos;t public.
              </Typography>
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

      {profileId != null ?
        <LoadProfileById
          id={profileId}
          userProfileId={userProfile.id ?? undefined}
          setProfile={setProfile}
          setNotFound={setNotFound} />
        :
        <></>
      }
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  return loadServerPage(
    context,
    {})
}