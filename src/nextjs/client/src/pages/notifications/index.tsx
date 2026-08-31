import Head from 'next/head'
import { useState } from 'react'
import { Button, Chip, Paper, Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadNotifications from '@/components/notifications/load-notifications'
import EmptyState from '@/components/layouts/empty-state'
import type { NotificationItem, UserProfile } from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

// Human-readable notification types
function notificationTypeName(type: string): string {

  switch (type) {
    case 'connection_request':
      return 'New connection request'

    case 'connection_accepted':
      return 'Connection accepted'

    case 'plan_targeted':
      return 'You were targeted by a plan'

    case 'plan_status_changed':
      return 'A plan changed status'
  }

  // Unknown type: humanize it (e.g. 'plan_targeted' -> 'Plan targeted')
  const words = type.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
  return words.charAt(0).toUpperCase() + words.slice(1)
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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function NotificationsPage({
  userProfile
}: Props) {

  // State
  const [notifications, setNotifications] = useState<NotificationItem[] | undefined>(undefined)
  const [markReadNotificationId, setMarkReadNotificationId] = useState<string | undefined>(undefined)
  const [markReadAction, setMarkReadAction] = useState<boolean>(false)
  const [markAllAction, setMarkAllAction] = useState<boolean>(false)
  const [markingRead, setMarkingRead] = useState<string | undefined>(undefined)
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  // Functions
  function onMarkAsRead(id: string) {

    setMarkingRead(id)
    setMarkReadNotificationId(id)
    setMarkReadAction(true)
  }

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Notifications`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          <div style={{ marginBottom: '2em' }}>
            <Typography
              style={{ marginBottom: '0.5em' }}
              variant='h3'>
              Notifications
            </Typography>
            <Typography variant='body1'>
              Updates about your connections and collaboration plans.
            </Typography>
          </div>

          {alertSeverity && message ?
            <Typography
              style={{
                color: alertSeverity === 'error' ? '#b91c1c' : '#166534',
                marginBottom: '1em'
              }}
              variant='body1'>
              {message}
            </Typography>
            :
            <></>
          }
          {userProfile.id == null || userProfile.id === '' ?
            <Typography variant='body1'>
              Sign in to see your notifications.
            </Typography>
            :
            <>
              {notifications != null && notifications.some(notification => notification.readAt == null) ?
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75em' }}>
                  <Button
                    disabled={markingRead != null || markAllAction}
                    onClick={() => setMarkAllAction(true)}
                    size='small'
                    variant='outlined'>
                    Mark all as read
                  </Button>
                </div>
                :
                <></>
              }
              {notifications != null ?
                <>
                  {notifications.length > 0 ?
                    notifications.map(notification => (
                      <Paper
                        key={notification.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1em',
                          padding: '1em 1.25em',
                          marginBottom: '0.75em',
                          borderColor: notification.readAt == null ? '#111111' : undefined,
                          borderStyle: notification.readAt == null ? 'solid' : undefined,
                          borderWidth: notification.readAt == null ? '0 0 0 3px' : undefined
                        }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', flexWrap: 'wrap' }}>
                            <Typography
                              sx={{ fontWeight: 600 }}
                              variant='body1'>
                              {notificationTypeName(notification.type)}
                            </Typography>

                            {notification.readAt == null ?
                              <Chip
                                label='Unread'
                                size='small'
                                sx={{
                                  height: '1.6em',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  backgroundColor: '#111111',
                                  color: '#ffffff'
                                }} />
                              :
                              <></>
                            }
                          </div>

                          <Typography
                            style={{ color: '#9a9a9a', marginTop: '0.15em', fontSize: '0.8rem' }}
                            variant='body2'>
                            {formatDate(notification.created)}
                            {notification.readAt != null ?
                              ` · Read ${formatDate(notification.readAt)}` :
                              ''}
                          </Typography>
                        </div>

                        {notification.readAt == null ?
                          <Button
                            disabled={markingRead === notification.id}
                            onClick={() => onMarkAsRead(notification.id)}
                            size='small'
                            variant='outlined'>
                            Mark as read
                          </Button>
                          :
                          <></>
                        }
                      </Paper>
                    ))
                    :
                    <EmptyState message="You're all caught up. No notifications yet." />
                  }
                </>
                :
                <EmptyState
                  loading={true}
                  message='Loading your notifications..' />
              }
            </>
          }
        </div>
      </Layout>

      {userProfile.id != null && userProfile.id !== '' ?
        <LoadNotifications
          userProfileId={userProfile.id ?? ''}
          markReadNotificationId={markReadNotificationId}
          markReadAction={markReadAction}
          setMarkReadAction={setMarkReadAction}
          markAllAction={markAllAction}
          setMarkAllAction={setMarkAllAction}
          setMarkingRead={setMarkingRead}
          setNotifications={setNotifications}
          setAlertSeverity={setAlertSeverity}
          setMessage={setMessage} />
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
