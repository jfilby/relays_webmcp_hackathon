import { useEffect, useState } from 'react'
import { Toaster, toast } from 'sonner'
import {
  Button,
  Chip,
  Link,
  Paper,
  TextField,
  Typography
} from '@mui/material'
import { useMutation } from '@apollo/client/react'
import { toggleProjectInterestMutation } from '@/apollo/projects'
import { createDiscussPostMutation, deleteDiscussPostMutation } from '@/apollo/discussion'
import type { DiscussPostItem, Project } from '@/types/client-only-types'
import { projectStageName } from '@/types/client-only-types'
import { projectVisibilityName } from './project-card'

// Human-readable names for typed project URLs:
// W website, R repository, D docs, E demo, S social, X other
const projectUrlKindNames: Record<string, string> = {
  W: 'Website',
  R: 'Repository',
  D: 'Documentation',
  E: 'Demo',
  S: 'Social',
  X: 'Other'
}

interface ToggleProjectInterestResult {
  status: boolean
  message: string
  interested: boolean
}

interface CreateDiscussPostResult {
  status: boolean
  message: string
}

interface DeleteDiscussPostResult {
  status: boolean
  message: string
}

interface Props {
  project: Project
  owner?: boolean
  // Signed-in viewer profile id; empty/undefined means a guest
  userProfileId?: string
  posts?: DiscussPostItem[]
  onPostsChanged?: () => void
}

export default function ProjectView({
  project,
  owner,
  userProfileId,
  posts,
  onPostsChanged
}: Props) {

  const signedIn = userProfileId != null && userProfileId !== ''

  // Interest state (kept locally so the count updates as soon as the viewer toggles)
  const [interestCount, setInterestCount] =
    useState<number>(project.interestCount ?? 0)
  const [viewerIsInterested, setViewerIsInterested] =
    useState<boolean>(project.viewerIsInterested === true)

  // Compose box state
  const [title, setTitle] = useState<string>('')
  const [body, setBody] = useState<string>('')

  // GraphQL
  const [sendToggleProjectInterestMutation] =
    useMutation<{
      toggleProjectInterest: ToggleProjectInterestResult
    }>(toggleProjectInterestMutation, {
      fetchPolicy: 'no-cache'
    })

  const [sendCreateDiscussPostMutation] =
    useMutation<{
      createDiscussPost: CreateDiscussPostResult
    }>(createDiscussPostMutation, {
      fetchPolicy: 'no-cache'
    })

  const [sendDeleteDiscussPostMutation] =
    useMutation<{
      deleteDiscussPost: DeleteDiscussPostResult
    }>(deleteDiscussPostMutation, {
      fetchPolicy: 'no-cache'
    })

  const [toggling, setToggling] = useState<boolean>(false)
  const [creatingPost, setCreatingPost] = useState<boolean>(false)

  // Functions
  async function toggleInterest() {

    if (userProfileId == null || userProfileId === '') {
      return
    }

    setToggling(true)

    let toggledData: ToggleProjectInterestResult | undefined

    await sendToggleProjectInterestMutation({
      variables: {
        userProfileId: userProfileId,
        projectId: project.id
      }
    }).then(result => toggledData = result.data?.toggleProjectInterest)

    setToggling(false)

    if (toggledData == null) {
      toast.error(`Failed to update your interest`)
      return
    }

    toast(toggledData.message)

    const wasInterested = viewerIsInterested === true

    setViewerIsInterested(toggledData.interested === true)

    if (wasInterested === true && toggledData.interested !== true) {
      setInterestCount(current => Math.max(0, current - 1))
    }

    if (wasInterested === false && toggledData.interested === true) {
      setInterestCount(current => current + 1)
    }
  }

  async function createPost() {

    if (userProfileId == null || userProfileId === '' ||
      title.trim() === '' || body.trim() === '') {
      return
    }

    setCreatingPost(true)

    let createdData: CreateDiscussPostResult | undefined

    await sendCreateDiscussPostMutation({
      variables: {
        userProfileId: userProfileId,
        title: title.trim(),
        body: body.trim(),
        projectId: project.id
      }
    }).then(result => createdData = result.data?.createDiscussPost)

    setCreatingPost(false)

    if (createdData == null) {
      toast.error(`Failed to create your post`)
      return
    }

    toast(createdData.message)

    setTitle('')
    setBody('')

    if (createdData.status === true && onPostsChanged != null) {
      onPostsChanged()
    }
  }

  async function deletePost(postId: string) {

    if (userProfileId == null || userProfileId === '') {
      return
    }

    let deletedData: DeleteDiscussPostResult | undefined

    await sendDeleteDiscussPostMutation({
      variables: {
        userProfileId: userProfileId,
        id: postId
      }
    }).then(result => deletedData = result.data?.deleteDiscussPost)

    if (deletedData == null) {
      toast.error(`Failed to delete the post`)
      return
    }

    toast(deletedData.message)

    if (deletedData.status === true && onPostsChanged != null) {
      onPostsChanged()
    }
  }

  // Effects
  useEffect(() => {

    // Re-sync interest state whenever a fresh project arrives
    setInterestCount(project.interestCount ?? 0)
    setViewerIsInterested(project.viewerIsInterested === true)

  }, [project])

  // Render
  return (
    <>
      <Toaster />

      <div style={{ marginBottom: '2em' }}>

        {project.image != null && project.image !== '' ?
          <div style={{ marginBottom: '1em' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`${project.name} image`}
              src={project.image}
              style={{ height: '6em', width: '6em' }} />
          </div>
          :
          <></>
        }

        <Typography variant='h3'>
          {project.name}
        </Typography>

        <div style={{
          alignItems: 'center',
          color: 'gray',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75em',
          marginBottom: '0.5em'
        }}>
          <Typography variant='body1'>
            {projectVisibilityName(project.isPublic)}
          </Typography>

          {projectStageName(project.stage) !== '' ?
            <Chip
              label={projectStageName(project.stage)}
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

          {project.isOpenToCollaborators === true ?
            <Chip
              label='Open to collaborators'
              size='small'
              sx={{
                height: '1.6em',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: '#e8f5e9',
                color: '#2e7d32'
              }} />
            :
            <></>
          }
        </div>

        {project.tagline != null && project.tagline !== '' ?
          <Typography variant='h6'>
            {project.tagline}
          </Typography>
          :
          <></>
        }

        {signedIn === true ?
          <div style={{ marginTop: '1em' }}>
            <Button
              disabled={toggling}
              onClick={toggleInterest}
              variant={viewerIsInterested === true ? 'contained' : 'outlined'}>
              {viewerIsInterested === true ? '★' : '☆'}
              &nbsp;
              {`Interested (${interestCount})`}
            </Button>
          </div>
          :
          <></>
        }
      </div>

      {project.description != null && project.description !== '' ?
        <div style={{ marginBottom: '2em' }}>
          <Typography variant='body1'>
            {project.description}
          </Typography>
        </div>
        :
        <></>
      }

      {project.techStack != null && project.techStack.length > 0 ?
        <div style={{ marginBottom: '2em' }}>
          <Typography variant='body2'>
            {`Tech stack: ${project.techStack.join(', ')}`}
          </Typography>
        </div>
        :
        <></>
      }

      <div style={{ marginBottom: '1em' }}>
        {project.website != null && project.website !== '' ?
          <Typography variant='body2'>
            Website:&nbsp;
            <Link
              href={project.website}
              target='_blank'
              rel='noopener noreferrer'>
              {project.website}
            </Link>
          </Typography>
          :
          <></>
        }
      </div>

      {project.urls != null && project.urls.length > 0 ?
        <div style={{ marginBottom: '2em' }}>
          <Typography
            style={{ marginBottom: '0.5em' }}
            variant='h6'>
            Links
          </Typography>

          {project.urls.map(urlItem => (
            <Typography
              key={urlItem.id}
              variant='body2'>
              {urlItem.label != null && urlItem.label !== '' ?
                urlItem.label
                :
                projectUrlKindNames[urlItem.kind] ?? 'Other'}
              :&nbsp;
              <Link
                href={urlItem.url}
                target='_blank'
                rel='noopener noreferrer'>
                {urlItem.url}
              </Link>
            </Typography>
          ))}
        </div>
        :
        <></>
      }

      {owner === true ?
        <div style={{ marginBottom: '2em' }}>
          <Button
            onClick={() => window.location.href = '/project/edit'}
            variant='outlined'>
            Edit my project
          </Button>
        </div>
        :
        <></>
      }

      <div style={{ marginBottom: '2em' }}>
        <Typography
          style={{ marginBottom: '0.5em' }}
          variant='h6'>
          Posts
        </Typography>

        {signedIn === true ?
          <Paper
            style={{ marginBottom: '1em', padding: '1em' }}
            variant='outlined'>
            <TextField
              fullWidth
              label={'Title'}
              onChange={(event) => setTitle(event.target.value)}
              style={{ marginBottom: '0.75em' }}
              value={title} />

            <TextField
              fullWidth
              label={'Write a post about this project...'}
              minRows={3}
              multiline
              onChange={(event) => setBody(event.target.value)}
              value={body} />

            <Button
              disabled={creatingPost || title.trim() === '' ||
                body.trim() === ''}
              onClick={createPost}
              style={{ marginTop: '0.75em' }}
              variant='contained'>
              Post
            </Button>
          </Paper>
          :
          <></>
        }

        {posts != null && posts.length > 0 ?
          posts.map(post => (
            <Paper
              key={post.id}
              style={{ marginBottom: '0.75em', padding: '1em' }}
              variant='outlined'>
              <div style={{
                alignItems: 'center',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5em',
                justifyContent: 'space-between'
              }}>
                <Link
                  href={`/discuss/${post.publicId}`}
                  underline='hover'>
                  <Typography
                    style={{ fontWeight: 600 }}
                    variant='subtitle2'>
                    {post.title}
                  </Typography>
                </Link>

                {signedIn === true &&
                  post.authorProfileId === userProfileId ?
                  <Button
                    color='error'
                    onClick={() => deletePost(post.id)}
                    size='small'
                    variant='outlined'>
                    Delete
                  </Button>
                  :
                  <></>
                }
              </div>

              <Typography
                style={{ whiteSpace: 'pre-wrap' }}
                variant='body2'>
                {post.body}
              </Typography>

              <Typography
                style={{ color: '#5a5a5a', marginTop: '0.5em', fontSize: '0.85rem' }}
                variant='body2'>
                {post.authorName != null && post.authorName !== '' ?
                  `${post.authorName} · ` :
                  ''}
                {post.created} · {post.commentCount}{' '}
                {post.commentCount === 1 ? 'comment' : 'comments'}
              </Typography>
            </Paper>
          ))
          :
          <Typography variant='body2'>
            No posts yet.
          </Typography>
        }
      </div>
    </>
  )
}
