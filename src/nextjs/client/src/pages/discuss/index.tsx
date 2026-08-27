import Head from 'next/head'
import { useState } from 'react'
import { Button, Link, Paper, TextField, Typography } from '@mui/material'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import { loadServerPage } from '@/services/page/load-server-page'
import LoadDiscussPosts from '@/components/discussion/load-discuss-posts'
import SaveDiscussPost from '@/components/discussion/save-discuss-post'
import EmptyState from '@/components/layouts/empty-state'
import type { DiscussPostItem, UserProfile } from '@/types/client-only-types'
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

export default function DiscussPage({
  userProfile
}: Props) {

  // State
  const [posts, setPosts] = useState<DiscussPostItem[] | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)

  const [newPostTitle, setNewPostTitle] = useState<string>('')
  const [newPostBody, setNewPostBody] = useState<string>('')
  const [createAction, setCreateAction] = useState<boolean>(false)

  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  // Vars
  const signedIn = userProfile.id != null && userProfile.id !== ''

  // Functions
  function onSubmit() {

    if (newPostTitle.trim() === '') {
      setAlertSeverity('error')
      setMessage(`Title is required`)
      return
    }

    if (newPostBody.trim() === '') {
      setAlertSeverity('error')
      setMessage(`Post body is required`)
      return
    }

    setAlertSeverity(undefined)
    setMessage(undefined)
    setCreateAction(true)
  }

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Discuss`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          <div style={{ marginBottom: '2em' }}>
            <Typography
              style={{ marginBottom: '0.5em' }}
              variant='h3'>
              Discuss
            </Typography>
            <Typography variant='body1'>
              Open discussions for the Relays community. Post a topic,
              comment on others, and collaborate in the open.
            </Typography>
          </div>

          {signedIn ?
            <Paper
              sx={{ marginBottom: '2em', padding: '1.25em 1.5em' }}>
              <Typography
                style={{ marginBottom: '0.75em' }}
                variant='h6'>
                Start a discussion
              </Typography>

              {alertSeverity === 'error' && message ?
                <Typography
                  style={{ color: '#b91c1c', marginBottom: '1em' }}
                  variant='body1'>
                  {message}
                </Typography>
                :
                <></>
              }

              <TextField
                fullWidth
                label='Title'
                onChange={(e) => setNewPostTitle(e.target.value)}
                size='small'
                style={{ marginBottom: '1em' }}
                value={newPostTitle} />

              <TextField
                fullWidth
                label='What would you like to discuss?'
                maxRows={6}
                multiline
                onChange={(e) => setNewPostBody(e.target.value)}
                size='small'
                style={{ marginBottom: '1em' }}
                value={newPostBody} />

              <Button
                disabled={createAction}
                onClick={onSubmit}
                variant='contained'>
                {createAction ? 'Posting..' : 'Post'}
              </Button>
            </Paper>
            :
            <Typography
              style={{ marginBottom: '2em' }}
              variant='body1'>
              Sign in to start a discussion or comment on posts.
            </Typography>
          }

          {notFound === true ?
            <EmptyState message="Couldn't load the discussions." />
            :
            <>
              {posts != null ?
                <>
                  {posts.length > 0 ?
                    posts.map(post => (
                      <Paper
                        key={post.id}
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
                          href={`/discuss/${post.publicId}`}
                          style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                          underline='none'>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              '&:hover': { textDecoration: 'underline' },
                            }}
                            variant='h6'>
                            {post.title}
                          </Typography>

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
                            {post.body}
                          </Typography>

                          <Typography
                            style={{ color: '#5a5a5a', marginTop: '0.5em', fontSize: '0.85rem' }}
                            variant='body2'>
                            {post.authorName != null && post.authorName !== '' ?
                              `${post.authorName} · ` :
                              ''}
                            {formatDate(post.created)} · {post.commentCount}{' '}
                            {post.commentCount === 1 ? 'comment' : 'comments'}
                          </Typography>
                        </Link>
                      </Paper>
                    ))
                    :
                    <EmptyState message="No discussions yet. Start the first one." />
                  }
                </>
                :
                <EmptyState
                  loading={true}
                  message='Loading discussions..' />
              }
            </>
          }
        </div>
      </Layout>

      <LoadDiscussPosts
        setAlertSeverity={setAlertSeverity}
        setMessage={setMessage}
        setNotFound={setNotFound}
        setPosts={setPosts} />

      {signedIn ?
        <SaveDiscussPost
          body={newPostBody}
          saveAction={createAction}
          setAlertSeverity={setAlertSeverity}
          setSaveAction={setCreateAction}
          setMessage={setMessage}
          title={newPostTitle}
          userProfileId={userProfile.id ?? ''} />
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
