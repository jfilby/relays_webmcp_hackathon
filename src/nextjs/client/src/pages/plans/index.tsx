import Head from 'next/head'
import { useState } from 'react'
import { Button, Chip, Link, Paper, Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadPlansByUserProfileId from '@/components/collaboration/load-plans-by-user-profile-id'
import EmptyState from '@/components/layouts/empty-state'
import type { CollaborationPlanItem, UserProfile } from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

// Human-readable plan status (D draft, O open, A accepted, C completed, X cancelled)
function planStatusName(status: string): string {

  switch (status) {
    case 'D':
      return 'Draft'

    case 'O':
      return 'Open'

    case 'A':
      return 'Accepted'

    case 'C':
      return 'Completed'

    case 'X':
      return 'Cancelled'
  }

  return status
}

export default function PlansPage({
  userProfile
}: Props) {

  // State
  const [plans, setPlans] = useState<CollaborationPlanItem[] | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - My plans`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          <div style={{ marginBottom: '2em' }}>
            <Typography
              style={{ marginBottom: '0.5em' }}
              variant='h3'>
              My plans
            </Typography>
            <Typography variant='body1'>
              Collaboration plans you created or were targeted by.
              Creating a plan requires owning at least one project first.
            </Typography>
          </div>

          {userProfile.id != null ?
            <div style={{ marginBottom: '2em' }}>
              <Button
                onClick={() => window.location.href = '/plan/add'}
                variant='contained'>
                + Create a plan
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
              Sign in to see your collaboration plans.
            </Typography>
            :
            <>
              {notFound === true ?
                <EmptyState message="Couldn't load your plans." />
                :
                <>
                  {plans != null ?
                    <>
                      {plans.length > 0 ?
                        plans.map(plan => (
                          <Paper
                            key={plan.id}
                            sx={{
                              display: 'block',
                              marginBottom: '1em',
                              padding: '1.25em 1.5em',
                              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 22px rgba(0, 0, 0, 0.08)'
                              }
                            }}>
                            <Link
                              href={`/plans/${plan.id}`}
                              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                              underline='none'>
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  '&:hover': { textDecoration: 'underline' },
                                }}
                                variant='h6'>
                                {plan.title}
                              </Typography>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginTop: '0.5em', flexWrap: 'wrap' }}>
                                <Chip
                                  label={planStatusName(plan.status)}
                                  size='small'
                                  sx={{
                                    height: '1.6em',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    backgroundColor: '#f0f0f0',
                                    color: '#444444'
                                  }} />
                                {plan.projectName != null && plan.projectName !== '' ?
                                  <Chip
                                    label={plan.projectName}
                                    size='small'
                                    sx={{
                                      height: '1.6em',
                                      fontSize: '0.72rem',
                                      fontWeight: 600,
                                      backgroundColor: '#f0f0f0',
                                      color: '#444444'
                                    }} />
                                  :
                                  <></>
                                }
                              </div>

                              {plan.targetName != null && plan.targetName !== '' ?
                                <Typography
                                  style={{ color: '#5a5a5a', marginTop: '0.5em', fontSize: '0.85rem' }}
                                  variant='body2'>
                                  Target: {plan.targetName}
                                </Typography>
                                :
                                <></>
                              }

                              {plan.description != null && plan.description !== '' ?
                                <Typography
                                  style={{
                                    color: '#5a5a5a',
                                    marginTop: '0.35em',
                                    fontSize: '0.85rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}
                                  variant='body2'>
                                  {plan.description}
                                </Typography>
                                :
                                <></>
                              }
                            </Link>
                          </Paper>
                        ))
                        :
                        <EmptyState message="No plans yet. Create a plan to find collaborators." />
                      }
                    </>
                    :
                    <EmptyState
                      loading={true}
                      message='Loading your plans..' />
                  }
                </>
              }
            </>
          }
        </div>
      </Layout>

      {userProfile.id != null && userProfile.id !== '' ?
        <LoadPlansByUserProfileId
          userProfileId={userProfile.id ?? ''}
          setPlans={setPlans}
          setNotFound={setNotFound}
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
