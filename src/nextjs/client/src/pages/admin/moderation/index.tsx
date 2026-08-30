import Head from 'next/head'
import { useState } from 'react'
import Link from 'next/link'
import { Button, Chip, Paper, Typography } from '@mui/material'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import { loadServerPage } from '@/services/page/load-server-page'
import LoadModerationQueue from '@/components/moderation/load-moderation-queue'
import SetModerationFlagStatus from '@/components/moderation/set-moderation-flag-status'
import DeleteFlaggedContent from '@/components/moderation/delete-flagged-content'
import type { ModerationFlagItem, UserProfile } from '@/types/client-only-types'
import { formatSince } from '@/services/utils/dates'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

// Human-readable content type
function refModelName(refModel: string): string {

  if (refModel === 'DiscussPost') {
    return 'Post'
  }

  if (refModel === 'DiscussComment') {
    return 'Comment'
  }

  return refModel
}

// Admin moderation queue. Only admins can load it (see getServerSideProps);
// anyone else gets a 404.
export default function AdminModerationPage({
  userProfile
}: Props) {

  // State
  const [items, setItems] = useState<ModerationFlagItem[] | undefined>(undefined)
  const [refreshToken, setRefreshToken] = useState<number>(0)
  const [dismissAction, setDismissAction] = useState<boolean>(false)
  const [deleteAction, setDeleteAction] = useState<boolean>(false)
  const [actionItem, setActionItem] = useState<ModerationFlagItem | undefined>(undefined)

  // Functions
  function onDismiss(item: ModerationFlagItem) {
    setActionItem(item)
    setDismissAction(true)
  }

  function onDelete(item: ModerationFlagItem) {
    setActionItem(item)
    setDeleteAction(true)
  }

  function refresh() {
    setRefreshToken(refreshToken + 1)
  }

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Moderation`}</title></Head>

      <Layout>
        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>
          <Typography
            style={{ marginBottom: '0.5em' }}
            variant='h3'>
            Moderation queue
          </Typography>
          <Typography
            style={{ marginBottom: '1.5em' }}
            variant='body1'>
            Content flagged by the community. Dismiss a flag to leave the
            content in place, or delete the content to resolve its flags.
          </Typography>

          {items != null && items.length === 0 ?
            <Typography variant='body1'>
              The moderation queue is empty.
            </Typography>
            :
            <></>
          }

          {items != null ?
            items.map(item => (
              <Paper
                key={item.id}
                sx={{ marginBottom: '1em', padding: '1.25em 1.5em' }}>
                <Typography
                  style={{
                    alignItems: 'center',
                    color: '#5a5a5a',
                    display: 'flex',
                    flexWrap: 'wrap',
                    fontSize: '0.85rem',
                    gap: '0.5em',
                    marginBottom: '0.5em'
                  }}
                  variant='body2'>
                  <Chip
                    label={refModelName(item.refModel)}
                    size='small' />
                  <span>
                    {item.flagCount === 1 ?
                      '1 flag' :
                      `${item.flagCount} flags`}
                    {' · '}
                    {formatSince(item.created)}
                  </span>
                  {item.authorName != null && item.authorName !== '' ?
                    <span>
                      {' · by '}{item.authorName}
                    </span>
                    :
                    <></>
                  }
                </Typography>

                {item.title != null && item.title !== '' ?
                  <Typography variant='h6'>
                    {item.title}
                  </Typography>
                  :
                  <></>
                }

                <Typography
                  sx={{
                    display: '-webkit-box',
                    marginBottom: '0.75em',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 4
                  }}
                  variant='body1'>
                  {item.excerpt}
                </Typography>

                <div style={{ display: 'flex', gap: '0.75em' }}>
                  {item.contentPublicId != null && item.refModel === 'DiscussPost' ?
                    <Link href={`/discuss/${item.contentPublicId}`}>
                      View post
                    </Link>
                    :
                    item.contentPublicId != null && item.postPublicId != null ?
                      <Link href={`/discuss/${item.postPublicId}`}>
                        View comment
                      </Link>
                      :
                      <></>
                  }

                  <Button
                    onClick={() => onDismiss(item)}
                    size='small'
                    variant='outlined'>
                    Dismiss flags
                  </Button>

                  <Button
                    color='error'
                    onClick={() => onDelete(item)}
                    size='small'
                    variant='outlined'>
                    Delete content
                  </Button>
                </div>
              </Paper>
            ))
            :
            <Typography variant='body1'>
              Loading..
            </Typography>
          }
        </div>
      </Layout>

      <LoadModerationQueue
        refreshToken={refreshToken}
        setItems={setItems}
        userProfileId={userProfile.id ?? ''} />

      {actionItem != null ?
        <>
          <SetModerationFlagStatus
            action={dismissAction}
            onDone={refresh}
            refId={actionItem.refId}
            refModel={actionItem.refModel}
            setAction={setDismissAction}
            status='D'
            userProfileId={userProfile.id ?? ''} />

          <DeleteFlaggedContent
            action={deleteAction}
            onDone={refresh}
            refId={actionItem.refId}
            refModel={actionItem.refModel}
            setAction={setDeleteAction}
            userProfileId={userProfile.id ?? ''} />
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
    {
      verifyAdminUsersOnly: true
    })
}
