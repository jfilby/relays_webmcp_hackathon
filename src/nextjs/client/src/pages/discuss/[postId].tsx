import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Button, IconButton, Paper, TextField, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadDiscussPostById from '@/components/discussion/load-discuss-post-by-id'
import LoadDiscussCommentsByPostId from '@/components/discussion/load-discuss-comments-by-post-id'
import SaveDiscussComment from '@/components/discussion/save-discuss-comment'
import DeleteDiscussPost from '@/components/discussion/delete-discuss-post'
import DeleteDiscussComment from '@/components/discussion/delete-discuss-comment'
import LoadProfileByUserProfileId from '@/components/profiles/load-by-user-profile-id'
import type {
  DiscussCommentItem,
  DiscussPostItem,
  Profile,
  UserProfile
} from '@/types/client-only-types'
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

export default function DiscussPostPage({
  userProfile
}: Props) {

  // Router
  const router = useRouter()
  const postId = typeof router.query.postId === 'string' ?
    router.query.postId :
    undefined

  // State
  const [post, setPost] = useState<DiscussPostItem | undefined>(undefined)
  const [comments, setComments] = useState<DiscussCommentItem[] | undefined>(undefined)
  const [viewerProfile, setViewerProfile] = useState<Profile | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)
  const [deleteCommentId, setDeleteCommentId] = useState<string | undefined>(undefined)
  const [deleteCommentAction, setDeleteCommentAction] = useState<boolean>(false)
  const [newCommentBody, setNewCommentBody] = useState<string>('')
  const [saveCommentAction, setSaveCommentAction] = useState<boolean>(false)
  const [deletePostAction, setDeletePostAction] = useState<boolean>(false)

  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  // Vars
  const signedIn = userProfile.id != null && userProfile.id !== ''
  const isPostAuthor = post != null && viewerProfile != null &&
    post.authorProfileId === viewerProfile.id

  // Functions
  function onComment() {

    if (newCommentBody.trim() === '') {
      setAlertSeverity('error')
      setMessage(`Comment body is required`)
      return
    }

    setAlertSeverity(undefined)
    setMessage(undefined)
    setSaveCommentAction(true)
  }

  function onDeleteComment() {
    setDeletePostAction(true)
  }

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Discussion`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          {notFound === true ?
            <div>
              <Typography
                style={{ marginBottom: '0.5em' }}
                variant='h3'>
                Post not found
              </Typography>
              <Typography variant='body1'>
                This discussion doesn&apos;t exist or was deleted.
              </Typography>
            </div>
            :
            <></>
          }

          {post != null ?
            <>
              <div style={{ marginBottom: '1em' }}>
                <Typography variant='h3'>
                  {post.title}
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
              </div>

              <Typography
                style={{ marginBottom: '1.5em', whiteSpace: 'pre-wrap' }}
                variant='body1'>
                {post.body}
              </Typography>

              {isPostAuthor ?
                <Button
                  color='error'
                  onClick={onDeleteComment}
                  size='small'
                  startIcon={<DeleteIcon />}
                  variant='outlined'>
                  Delete post
                </Button>
                :
                <></>
              }

              <Typography
                style={{ marginTop: '2em', marginBottom: '0.5em' }}
                variant='h4'>
                Comments
              </Typography>

              {comments != null && comments.length > 0 ?
                comments.map(comment => (
                  <Paper
                    key={comment.id}
                    sx={{
                      marginBottom: '0.75em',
                      padding: '1em 1.25em',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75em'
                    }}>
                    <div style={{ flex: 1 }}>
                      <Typography
                        style={{ color: '#5a5a5a', fontSize: '0.85rem' }}
                        variant='body2'>
                        {comment.authorName != null && comment.authorName !== '' ?
                          comment.authorName :
                          'Unknown'}
                        {' · '}
                        {formatDate(comment.created)}
                      </Typography>

                      <Typography
                        style={{ marginTop: '0.35em', whiteSpace: 'pre-wrap' }}
                        variant='body1'>
                        {comment.body}
                      </Typography>
                    </div>

                    {signedIn && viewerProfile != null &&
                      comment.authorProfileId === viewerProfile.id ?
                      <IconButton
                        aria-label='delete comment'
                        color='error'
                        onClick={() => {
                          setDeleteCommentId(comment.id)
                          setDeleteCommentAction(true)
                        }}
                        size='small'>
                        <DeleteIcon />
                      </IconButton>
                      :
                      <></>
                    }
                  </Paper>
                ))
                :
                <>
                  {comments != null ?
                    <Typography
                      style={{ color: '#5a5a5a', marginBottom: '1em' }}
                      variant='body1'>
                      No comments yet. Be the first to reply.
                    </Typography>
                    :
                    <></>
                  }
                </>
              }

              {signedIn ?
                <Paper
                  sx={{ marginTop: '1.5em', padding: '1.25em 1.5em' }}>
                  <Typography
                    style={{ marginBottom: '0.75em' }}
                    variant='h6'>
                    Add a comment
                  </Typography>

                  <TextField
                    fullWidth
                    label='Your comment'
                    maxRows={6}
                    multiline
                    onChange={(e) => setNewCommentBody(e.target.value)}
                    size='small'
                    style={{ marginBottom: '1em' }}
                    value={newCommentBody} />

                  <Button
                    disabled={saveCommentAction}
                    onClick={onComment}
                    variant='contained'>
                    {saveCommentAction ? 'Posting..' : 'Comment'}
                  </Button>
                </Paper>
                :
                <Typography variant='body1'>
                  Sign in to comment.
                </Typography>
              }
            </>
            :
            <>
              {post == null && notFound === false ?
                <Typography variant='body1'>
                  Loading..
                </Typography>
                :
                <></>
              }
            </>
          }
        </div>
      </Layout>

      {postId != null ?
        <>
          <LoadDiscussPostById
            postId={postId}
            setAlertSeverity={setAlertSeverity}
            setMessage={setMessage}
            setNotFound={setNotFound}
            setPost={setPost} />

          <LoadDiscussCommentsByPostId
            postId={postId}
            setAlertSeverity={setAlertSeverity}
            setMessage={setMessage}
            setComments={setComments}
            setNotFound={setNotFound} />

          {signedIn ?
            <>
              <LoadProfileByUserProfileId
                userProfileId={userProfile.id ?? ''}
                setProfile={setViewerProfile} />

              <SaveDiscussComment
                body={newCommentBody}
                postId={postId}
                setComments={setComments}
                onSaved={() => setNewCommentBody('')}
                saveAction={saveCommentAction}
                setAlertSeverity={setAlertSeverity}
                setMessage={setMessage}
                setSaveAction={setSaveCommentAction}
                userProfileId={userProfile.id ?? ''} />

              <DeleteDiscussComment
                commentId={deleteCommentId}
                deleteAction={deleteCommentAction}
                postId={postId}
                setAlertSeverity={setAlertSeverity}
                setComments={setComments}
                setDeleteAction={setDeleteCommentAction}
                setMessage={setMessage}
                userProfileId={userProfile.id ?? ''} />

              {isPostAuthor ?
                <DeleteDiscussPost
                  deleteAction={deletePostAction}
                  postId={postId}
                  setAlertSeverity={setAlertSeverity}
                  setDeleteAction={setDeletePostAction}
                  setMessage={setMessage}
                  userProfileId={userProfile.id ?? ''} />
                :
                <></>
              }
            </>
            :
            <></>
          }
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
