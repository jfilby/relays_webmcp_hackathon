import Head from 'next/head'
import { useCallback, useState } from 'react'
import { Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import EmptyState from '@/components/layouts/empty-state'
import LoadDmConversations from '@/components/dms/load-dm-conversations'
import LoadDmThread from '@/components/dms/load-dm-thread'
import LoadProfileByUserProfileId from '@/components/profiles/load-by-user-profile-id'
import type { Profile, UserProfile } from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
  withProfilePublicId?: string
}

export default function MessagesPage({
  userProfile,
  withProfilePublicId
}: Props) {

  // State
  const [viewerProfile, setViewerProfile] = useState<Profile | undefined>(undefined)
  const [activePeerPublicId, setActivePeerPublicId] = useState<string | undefined>(
    withProfilePublicId != null && withProfilePublicId !== '' ?
      withProfilePublicId :
      undefined)
  const [conversationsRefreshKey, setConversationsRefreshKey] = useState(0)

  // Functions
  const onOpenThread = useCallback((peerPublicId: string) => {
    setActivePeerPublicId(peerPublicId)
  }, [])

  const onConversationsChanged = useCallback(() => {
    setConversationsRefreshKey(key => key + 1)
  }, [])

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Messages`}</title></Head>

      <Layout>
        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left' }}>

          <div style={{ marginBottom: '1.5em' }}>
            <Typography
              style={{ marginBottom: '0.5em' }}
              variant='h3'>
              Messages
            </Typography>
            <Typography variant='body1'>
              Direct messages between you and other profiles.
            </Typography>
          </div>

          {userProfile.id == null || userProfile.id === '' ?
            <Typography variant='body1'>
              Sign in to see your messages.
            </Typography>
            :
            <div style={{
              display: 'flex',
              gap: '1.2em',
              alignItems: 'stretch',
              minHeight: '28em'
            }}>
              {/* Conversations column */}
              <div style={{
                width: '20em',
                flexShrink: 0,
                border: '1px solid #e4e4e4',
                borderRadius: 12,
                overflow: 'hidden',
                alignSelf: 'flex-start'
              }}>
              {/* Resolve the viewer's profile id; DMs are keyed by profile id */}
              <LoadProfileByUserProfileId
                userProfileId={userProfile.id ?? ''}
                setProfile={setViewerProfile} />

              <LoadDmConversations
                onOpenThread={onOpenThread}
                refreshKey={conversationsRefreshKey}
                userProfileId={userProfile.id ?? ''}
                myProfileId={viewerProfile?.id ?? ''} />
              </div>

              {/* Thread */}
              <div style={{ flex: 1, minWidth: 0, minHeight: '28em' }}>
                {activePeerPublicId != null ?
                  <LoadDmThread
                    onConversationsChanged={onConversationsChanged}
                    userProfileId={userProfile.id ?? ''}
                    withProfilePublicId={activePeerPublicId} />
                  :
                  <EmptyState
                    message='Select a conversation to start messaging.'
                    sx={{ borderRadius: 0 }} />
                }
              </div>
            </div>
          }
        </div>
      </Layout>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  const results = await loadServerPage(
    context,
    {})

  // Pick up an optional ?with=<publicId> query parameter to open a thread
  const withProfilePublicId = context.query.with

  if (typeof withProfilePublicId === 'string' && withProfilePublicId !== '') {
    results.props = {
      ...results.props,
      withProfilePublicId: withProfilePublicId
    }
  }

  return results
}
