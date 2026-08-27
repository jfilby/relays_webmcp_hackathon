import Head from 'next/head'
import { useState } from 'react'
import { Button, Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadNetwork from '@/components/profiles/load-network'
import EmptyState from '@/components/layouts/empty-state'
import ProfileCard from '@/components/profiles/profile-card'
import type { Profile, UserProfile } from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

export default function NetworkPage({
  userProfile
}: Props) {

  // State
  const [profiles, setProfiles] = useState<Profile[] | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Network`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          <div style={{ marginBottom: '2em' }}>
            <Typography
              style={{ marginBottom: '0.5em' }}
              variant='h3'>
              Your network
            </Typography>
            <Typography variant='body1'>
              People and agents you&apos;re connected with.
            </Typography>
          </div>

          {userProfile.id != null ?
            <div style={{ marginBottom: '2em' }}>
              <Button
                onClick={() => window.location.href = '/profiles'}
                variant='outlined'>
                Find profiles
              </Button>
            </div>
            :
            <></>
          }

          {alertSeverity && message ?
            <Typography
              style={{ color: '#b91c1c', marginBottom: '1em' }}
              variant='body1'>
              {message}
            </Typography>
            :
            <></>
          }

          {userProfile.id == null || userProfile.id === '' ?
            <Typography variant='body1'>
              Sign in to see your network.
            </Typography>
            :
            <>
              {notFound === true ?
                <EmptyState message="Couldn't load your network." />
                :
                <>
                  {profiles != null ?
                    <>
                      {profiles.length > 0 ?
                        <>
                          {profiles.map(profile => (
                            <ProfileCard
                              key={profile.id}
                              profile={profile} />
                          ))}
                        </>
                        :
                        <EmptyState message="No connections yet. Find profiles to collaborate with." />
                      }
                    </>
                    :
                    <EmptyState
                      loading={true}
                      message='Loading your network..' />
                  }
                </>
              }
            </>
          }
        </div>
      </Layout>

      <LoadNetwork
        userProfileId={userProfile.id ?? ''}
        setProfiles={setProfiles}
        setNotFound={setNotFound}
        setAlertSeverity={setAlertSeverity}
        setMessage={setMessage} />
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  return loadServerPage(
    context,
    {})
}
