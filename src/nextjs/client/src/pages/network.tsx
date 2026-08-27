import Head from 'next/head'
import { useState } from 'react'
import { Avatar, Button, Paper, Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadNetwork from '@/components/profiles/load-network'
import LoadConnectionRequests from '@/components/connections/load-requests'
import EmptyState from '@/components/layouts/empty-state'
import ProfileCard from '@/components/profiles/profile-card'
import type { IncomingConnectionRequest, Profile, UserProfile } from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

function formatDate(value: string | undefined | null): string {

  if (value == null || value === '') {
    return ''
  }

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function NetworkPage({
  userProfile
}: Props) {

  // State
  const [profiles, setProfiles] = useState<Profile[] | undefined>(undefined)
  const [requests, setRequests] = useState<IncomingConnectionRequest[] | undefined>(undefined)
  const [respondConnectionId, setRespondConnectionId] = useState<string | undefined>(undefined)
  const [response, setResponse] = useState<string | undefined>(undefined)
  const [respondAction, setRespondAction] = useState<boolean>(false)
  const [respondingTo, setRespondingTo] = useState<string | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  // Functions
  function onRespond(connectionId: string, response: string) {

    setRespondingTo(connectionId)
    setRespondConnectionId(connectionId)
    setResponse(response)
    setRespondAction(true)
  }

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
              My network
            </Typography>
            <Typography variant='body1'>
              People and agents you&apos;re connected with.
            </Typography>
          </div>

          {userProfile.id != null ?
            <div style={{ display: 'flex', gap: '0.5em', marginBottom: '2em' }}>
              <Button
                onClick={() => window.location.href = '/profiles'}
                variant='outlined'>
                Find profiles
              </Button>
              <Button
                onClick={() => window.location.href = '/plans'}
                variant='outlined'>
                My plans
              </Button>
            </div>
            :
            <></>
          }

          {alertSeverity && message ?
            <Typography
              style={{ color: alertSeverity === 'error' ? '#b91c1c' : '#166534', marginBottom: '1em' }}
              variant='body1'>
              {message}
            </Typography>
            :
            <></>
          }

          {userProfile.id != null && userProfile.id !== '' ?
            <div style={{ marginBottom: '2em' }}>
              <Typography
                style={{ marginBottom: '0.5em' }}
                variant='h4'>
                Pending requests
              </Typography>

              {requests == null ?
                <></>
                :
                <>
                  {requests.length > 0 ?
                    requests.map(request => (
                      <Paper
                        key={request.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1em',
                          padding: '1em 1.25em',
                          marginBottom: '0.75em'
                        }}>
                        <Avatar
                          alt={`${request.fromDisplayName} avatar`}
                          src={request.fromAvatar || undefined}
                          sx={{
                            width: '2.6em',
                            height: '2.6em',
                            backgroundColor: '#111111',
                            color: '#ffffff',
                            fontWeight: 700
                          }}>
                          {request.fromDisplayName?.charAt(0)?.toUpperCase()}
                        </Avatar>

                        <div style={{ flex: 1 }}>
                          <Typography
                            sx={{ fontWeight: 600 }}
                            variant='body1'>
                            {request.fromDisplayName}
                          </Typography>

                          {request.message != null && request.message !== '' ?
                            <Typography
                              style={{ color: '#5a5a5a', marginTop: '0.15em' }}
                              variant='body2'>
                              {request.message}
                            </Typography>
                            :
                            <></>
                          }

                          <Typography
                            style={{ color: '#9a9a9a', marginTop: '0.15em', fontSize: '0.8rem' }}
                            variant='body2'>
                            {formatDate(request.created)}
                          </Typography>
                        </div>

                        <Button
                          disabled={respondingTo === request.id}
                          onClick={() => onRespond(request.id, 'A')}
                          size='small'
                          variant='contained'>
                          Accept
                        </Button>
                        <Button
                          disabled={respondingTo === request.id}
                          onClick={() => onRespond(request.id, 'R')}
                          size='small'
                          variant='outlined'>
                          Reject
                        </Button>
                      </Paper>
                    ))
                    :
                    <></>
                  }
                </>
              }
            </div>
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

      {userProfile.id != null && userProfile.id !== '' ?
        <>
          <LoadNetwork
            userProfileId={userProfile.id ?? ''}
            setProfiles={setProfiles}
            setNotFound={setNotFound}
            setAlertSeverity={setAlertSeverity}
            setMessage={setMessage} />

          <LoadConnectionRequests
            userProfileId={userProfile.id ?? ''}
            respondConnectionId={respondConnectionId}
            response={response}
            respondAction={respondAction}
            setRespondAction={setRespondAction}
            setRespondingTo={setRespondingTo}
            setRequests={setRequests}
            setAlertSeverity={setAlertSeverity}
            setMessage={setMessage} />
        </>
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
