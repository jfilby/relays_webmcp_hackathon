import Head from 'next/head'
import { useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Chip, IconButton, Link, Paper, TextField, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { loadServerPage } from '@/services/page/load-server-page'
import type {
  DiscussCommentItem,
  DiscussPostItem,
  Profile,
  UserProfile
} from '@/types/client-only-types'
import { maxCommentsLevel } from '@/types/discussion-types'
import { formatSince } from '@/services/utils/dates'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadDiscussPostByPublicId from '@/components/discussion/load-discuss-post-by-id'
import LoadDiscussCommentsByPostId from '@/components/discussion/load-discuss-comments-by-post-id'
import SaveDiscussComment from '@/components/discussion/save-discuss-comment'
import DeleteDiscussPost from '@/components/discussion/delete-discuss-post'
import DeleteDiscussComment from '@/components/discussion/delete-discuss-comment'
import LoadProfileByUserProfileId from '@/components/profiles/load-by-user-profile-id'
import FlagContent from '@/components/discussion/flag-content'
import { useWebMcpTools } from '@/webmcp/webmcp'
import { addDiscussCommentTool, addDiscussReplyTool } from '@/webmcp/tools/discuss'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

// A comment plus its nested replies
interface CommentNode {
  comment: DiscussCommentItem
  children: CommentNode[]
}

// Build a nested tree from the flat comment list. Comments whose parent is
// missing (e.g. deleted) fall back to top-level so they stay visible.
function buildCommentTree(comments: DiscussCommentItem[]): CommentNode[] {

  const nodesById = new Map<string, CommentNode>()

  for (const comment of comments) {
    nodesById.set(comment.id, {
      comment: comment,
      children: []
    })
  }

  const roots: CommentNode[] = []

  for (const comment of comments) {
    const node = nodesById.get(comment.id)

    if (node == null) {
      continue
    }

    const parent = comment.parentCommentId != null ?
      nodesById.get(comment.parentCommentId) :
      undefined

    if (parent != null) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export default function DiscussPostPage({
  userProfile
}: Props) {

  // Router
  const router = useRouter()
  const postPublicId = typeof router.query.postPublicId === 'string' ?
    router.query.postPublicId :
    undefined

  // State
  const [post, setPost] = useState<DiscussPostItem | undefined>(undefined)
  const [comments, setComments] = useState<DiscussCommentItem[] | undefined>(undefined)
  const [viewerProfile, setViewerProfile] = useState<Profile | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)
  const [deleteCommentId, setDeleteCommentId] = useState<string | undefined>(undefined)
  const [deleteCommentAction, setDeleteCommentAction] = useState<boolean>(false)
  const [newCommentBody, setNewCommentBody] = useState<string>('')
  const [replyToCommentId, setReplyToCommentId] = useState<string | undefined>(undefined)
  const [replyBody, setReplyBody] = useState<string>('')
  const [saveCommentAction, setSaveCommentAction] = useState<boolean>(false)
  const [deletePostAction, setDeletePostAction] = useState<boolean>(false)
  const [flagPostAction, setFlagPostAction] = useState<boolean>(false)
  const [flagCommentId, setFlagCommentId] = useState<string | undefined>(undefined)

  const [flagCommentAction, setFlagCommentAction] = useState<boolean>(false)

  // Latest form values for the WebMCP comment tools
  const commentValuesRef = useRef({ body: newCommentBody })
  commentValuesRef.current = { body: newCommentBody }
  const replyValuesRef = useRef({ body: replyBody, replyToCommentId })
  replyValuesRef.current = { body: replyBody, replyToCommentId }

  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  // Vars
  const signedIn = userProfile.id != null && userProfile.id !== ''
  const isPostAuthor = post != null && viewerProfile != null &&
    post.authorProfileId === viewerProfile.id

  // Functions
  function onComment(submitValues?: { body: string }): { status: 'ok' | 'error'; message: string } {

    const values = submitValues ?? { body: newCommentBody }

    if (values.body.trim() === '') {
      setAlertSeverity('error')
      setMessage(`Comment body is required`)
      return { status: 'error', message: `Comment body is required` }
    }

    if (submitValues != null) {
      setNewCommentBody(submitValues.body)
    }

    // A top-level comment is never a reply
    setReplyToCommentId(undefined)
    setAlertSeverity(undefined)
    setMessage(undefined)
    setSaveCommentAction(true)

    return { status: 'ok', message: `Posting your comment` }
  }

  function onReplySubmit(commentId: string, submitValues?: { body: string }): { status: 'ok' | 'error'; message: string } {

    const values = submitValues ?? { body: replyBody }

    if (values.body.trim() === '') {
      setAlertSeverity('error')
      setMessage(`Reply body is required`)
      return { status: 'error', message: `Reply body is required` }
    }

    if (submitValues != null) {
      setReplyBody(submitValues.body)
    }

    setReplyToCommentId(commentId)
    setAlertSeverity(undefined)
    setMessage(undefined)
    setSaveCommentAction(true)

    return { status: 'ok', message: `Posting your reply` }
  }

  function onDeleteComment() {
    setDeletePostAction(true)
  }

  function onFlagPost() {
    setFlagPostAction(true)
  }

  function onFlagComment(commentId: string) {
    setFlagCommentId(commentId)
    setFlagCommentAction(true)
  }

  // Renders one comment, its inline reply form, and its nested replies.
  function renderCommentNode(node: CommentNode, depth: number) {

    const comment = node.comment

    return (
      <div key={comment.id}>
        <Paper
          sx={{
            marginBottom: '0.75em',
            padding: depth > 1 ? '0.75em 1em' : '1em 1.25em',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75em'
          }}>
          <div style={{ flex: 1 }}>
            <Typography
              style={{ color: '#5a5a5a', fontSize: '0.85rem' }}
              variant='body2'>
              {comment.authorName != null && comment.authorName !== '' ?
                (comment.authorProfileIsPublic === true &&
                  comment.authorProfilePublicId != null &&
                  comment.authorProfilePublicId !== '' ?
                  <Link
                    href={`/profiles/${comment.authorProfilePublicId}`}>
                    {comment.authorName}
                  </Link>
                  :
                  comment.authorName) :
                'Unknown'}
            </Typography>

            {comment.deleted != null ?
              <Chip
                color='default'
                label='Deleted'
                size='small'
                style={{ marginTop: '0.35em' }} />
              :
              <Typography
                style={{ marginTop: '0.35em', whiteSpace: 'pre-wrap' }}
                variant='body1'>
                {comment.body}
              </Typography>
            }

            {signedIn && depth < maxCommentsLevel ?
              <Button
                onClick={() => {
                  setReplyBody('')
                  setReplyToCommentId(replyToCommentId === comment.id ?
                    undefined :
                    comment.id)
                }}
                size='small'
                style={{ marginTop: '0.25em' }}>
                Reply
              </Button>
              :
              <></>
            }

            {signedIn && viewerProfile != null &&
              comment.authorProfileId !== viewerProfile.id ?
              <Button
                onClick={() => onFlagComment(comment.id)}
                size='small'
                style={{ marginTop: '0.25em' }}>
                Flag
              </Button>
              :
              <></>
            }

            {replyToCommentId === comment.id ?
              <>
                <TextField
                  fullWidth
                  label='Your reply'
                  maxRows={6}
                  multiline
                  onChange={(e) => setReplyBody(e.target.value)}
                  size='small'
                  style={{ marginTop: '0.5em', marginBottom: '0.5em' }}
                  value={replyBody} />

                <Button
                  disabled={saveCommentAction}
                  onClick={() => onReplySubmit(comment.id)}
                  size='small'
                  variant='contained'>
                  {saveCommentAction ? 'Posting..' : 'Reply'}
                </Button>
              </>
              :
              <></>
            }
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

        {node.children.length > 0 ?
          <div style={{ marginLeft: '1.5em' }}>
            {node.children.map(child => renderCommentNode(child, depth + 1))}
          </div>
          :
          <></>
        }
      </div>
    )
  }

  // WebMCP
  useWebMcpTools(() => [
    addDiscussCommentTool({
      isSignedIn: () => signedIn,
      getValues: () => commentValuesRef.current,
      onComment: (submitValues) => onComment(submitValues)
    }),
    addDiscussReplyTool({
      isSignedIn: () => signedIn,
      getReplyTarget: () => replyValuesRef.current.replyToCommentId,
      onReplySubmit: (commentId, submitValues) => onReplySubmit(commentId, submitValues)
    })
  ])

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
                    <>
                      {post.authorProfileIsPublic === true &&
                        post.authorProfilePublicId != null &&
                        post.authorProfilePublicId !== '' ?
                        <Link href={`/profiles/${post.authorProfilePublicId}`}>
                          {post.authorName}
                        </Link>
                        :
                        post.authorName
                      }
                      {' · '}
                    </>
                    :
                    <></>
                  }
                  {formatSince(post.created)} · {post.commentCount}{' '}
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
                signedIn && viewerProfile != null ?
                  <Button
                    onClick={onFlagPost}
                    size='small'
                    variant='outlined'>
                    Flag
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
                buildCommentTree(comments).map(node => renderCommentNode(node, 1))
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
                    onClick={() => onComment()}
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

      {postPublicId != null ?
        <>
          <LoadDiscussPostByPublicId
            publicId={postPublicId}
            setAlertSeverity={setAlertSeverity}
            setMessage={setMessage}
            setNotFound={setNotFound}
            setPost={setPost} />

          {/* Comments load once the post itself has loaded, since they are
              fetched by the post's internal id */}
          {post != null ?
            <LoadDiscussCommentsByPostId
              postId={post.id}
              setAlertSeverity={setAlertSeverity}
              setMessage={setMessage}
              setComments={setComments}
              setNotFound={setNotFound} />
            :
            <></>
          }

          {/* The signed-in actions need the post's internal id */}
          {signedIn && post != null ?
            <>
              <LoadProfileByUserProfileId
                userProfileId={userProfile.id ?? ''}
                setProfile={setViewerProfile} />

              <SaveDiscussComment
                body={replyToCommentId != null ? replyBody : newCommentBody}
                parentCommentId={replyToCommentId}
                postId={post.id}
                setComments={setComments}
                onSaved={() => {
                  setNewCommentBody('')
                  setReplyBody('')
                  setReplyToCommentId(undefined)
                }}
                saveAction={saveCommentAction}
                setAlertSeverity={setAlertSeverity}
                setMessage={setMessage}
                setSaveAction={setSaveCommentAction}
                userProfileId={userProfile.id ?? ''} />

              <DeleteDiscussComment
                commentId={deleteCommentId}
                deleteAction={deleteCommentAction}
                postId={post.id}
                setAlertSeverity={setAlertSeverity}
                setComments={setComments}
                setDeleteAction={setDeleteCommentAction}
                setMessage={setMessage}
                userProfileId={userProfile.id ?? ''} />

              {isPostAuthor ?
                <DeleteDiscussPost
                  deleteAction={deletePostAction}
                  postId={post.id}
                  setAlertSeverity={setAlertSeverity}
                  setDeleteAction={setDeletePostAction}
                  setMessage={setMessage}
                  userProfileId={userProfile.id ?? ''} />
                :
                <></>
              }

              <FlagContent
                flagAction={flagPostAction}
                refId={post.id}
                refModel='DiscussPost'
                setFlagAction={setFlagPostAction}
                userProfileId={userProfile.id ?? ''} />

              {flagCommentId != null ?
                <FlagContent
                  flagAction={flagCommentAction}
                  refId={flagCommentId}
                  refModel='DiscussComment'
                  setFlagAction={setFlagCommentAction}
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
