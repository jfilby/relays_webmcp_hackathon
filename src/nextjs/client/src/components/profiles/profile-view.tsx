import { useEffect, useState } from 'react'
import { Button, Chip, Link, TextField, Tooltip, Typography } from '@mui/material'
import { Toaster, toast } from 'sonner'
import { useMutation, useQuery } from '@apollo/client/react'
import { createDiscussPostMutation, deleteDiscussPostMutation } from '@/apollo/discussion'
import {
  getConnectionStatusQuery,
  removeConnectionMutation,
  sendConnectionRequestMutation
} from '@/apollo/connections'
import {
  availabilityStatusName,
  profileLinkName,
  skillLevelName
} from '@/types/client-only-types'
import DiscussPostListItem from '@/components/discussion/discuss-post-list-item'
import ProjectCard from '@/components/projects/project-card'
import DeleteDialog from '@/components/dialogs/delete-dialog'
import { useWebMcpTools } from '@/webmcp/webmcp'
import { connectProfileTool, removeProfileConnectionTool } from '@/webmcp/tools/profiles'
import type { SubmitResult } from '@/webmcp/tools/types'
import type { DiscussPostItem, Endorsement, Profile, ProfileLink, ProfileSkill, Project } from '@/types/client-only-types'
import { profileTypeName } from './profile-card'

interface Props {
  profile: Profile
  owner?: boolean
  viewerUserProfileId?: string
  skills?: ProfileSkill[]
  links?: ProfileLink[]
  endorsements?: Endorsement[]
  projects?: Project[]
  posts?: DiscussPostItem[]
  onPostsChanged?: () => void
}

interface SendConnectionRequestResult {
  status: boolean
  message: string
}

interface ConnectionStatusResult {
  status: boolean
  message?: string | null
  connectionStatus?: string | null
}

interface RemoveConnectionResult {
  status: boolean
  message: string
}

interface CreateDiscussPostResult {
  status: boolean
  message: string
}

interface DeleteDiscussPostResult {
  status: boolean
  message: string
}

export default function ProfileView({
  profile,
  owner,
  viewerUserProfileId,
  skills,
  links,
  endorsements,
  projects,
  posts,
  onPostsChanged
}: Props) {

  // State
  const [connectOpen, setConnectOpen] = useState<boolean>(false)
  const [connectionMessage, setConnectionMessage] = useState<string>('')
  const [connectionStatus, setConnectionStatus] =
    useState<'none' | 'pending' | 'connected'>('none')
  const [connecting, setConnecting] = useState<boolean>(false)

  const [newPostTitle, setNewPostTitle] = useState<string>('')
  const [newPostBody, setNewPostBody] = useState<string>('')
  const [posting, setPosting] = useState<boolean>(false)

  // Post deletion confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [deletePendingPostId, setDeletePendingPostId] = useState<string | undefined>(undefined)
  const [deleteConfirmed, setDeleteConfirmed] = useState<boolean>(false)

  // GraphQL
  const { refetch: fetchGetConnectionStatusQuery } =
    useQuery<{ getConnectionStatus: ConnectionStatusResult }>(
      getConnectionStatusQuery, {
      fetchPolicy: 'no-cache',
      skip: true
    })

  const [sendRemoveConnectionMutation] =
    useMutation<{
      removeConnection: RemoveConnectionResult
    }>(removeConnectionMutation, {
      fetchPolicy: 'no-cache'
    })

  // Effects
  useEffect(() => {

    const fetchData = async () => {

      if (viewerUserProfileId == null || viewerUserProfileId === '') {
        return
      }

      // Query
      const { data } = await
        fetchGetConnectionStatusQuery({
          userProfileId: viewerUserProfileId,
          peerProfileId: profile.id
        })

      const results = data?.getConnectionStatus

      if (results != null && results.status === true &&
        results.connectionStatus != null) {
        setConnectionStatus(
          results.connectionStatus as 'none' | 'pending' | 'connected')
      }
    }

    fetchData()
      .catch(console.error)

  }, [viewerUserProfileId, profile.id])

  const [sendSendConnectionRequestMutation] =
    useMutation<{
      sendConnectionRequest: SendConnectionRequestResult
    }>(sendConnectionRequestMutation, {
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

  // Functions
  async function onSendConnectionRequest(submitMessage?: string): Promise<SubmitResult> {

    if (viewerUserProfileId == null || viewerUserProfileId === '') {
      return { status: 'error', message: `Sign in to connect with profiles` }
    }

    setConnecting(true)

    const message = submitMessage ?? connectionMessage

    // Query
    let sentData: SendConnectionRequestResult | undefined

    await sendSendConnectionRequestMutation({
      variables: {
        userProfileId: viewerUserProfileId,
        toProfileId: profile.id,
        message: message !== '' ? message : null
      }
    }).then(result => sentData = result.data?.sendConnectionRequest)

    // Get results
    if (sentData == null) {
      toast.error(`Failed to send the connection request`)

      return { status: 'error', message: `Failed to send the connection request` }
    } else if (sentData.status === true) {
      toast.success(sentData.message)
      setConnectionStatus('pending')
      setConnectionMessage('')
      setConnectOpen(false)
    } else {
      toast.error(sentData.message)
    }

    // Done
    setConnecting(false)

    if (sentData.status !== true) {
      return { status: 'error', message: sentData.message }
    }

    return { status: 'ok', message: sentData.message }
  }

  async function onRemoveConnection(): Promise<SubmitResult> {

    if (viewerUserProfileId == null || viewerUserProfileId === '') {
      return { status: 'error', message: `Sign in to manage connections` }
    }

    setConnecting(true)

    // Query
    let removedData: RemoveConnectionResult | undefined

    await sendRemoveConnectionMutation({
      variables: {
        userProfileId: viewerUserProfileId,
        peerProfileId: profile.id
      }
    }).then(result => removedData = result.data?.removeConnection)

    // Get results
    if (removedData == null) {
      toast.error(`Failed to remove the connection`)

      return { status: 'error', message: `Failed to remove the connection` }
    } else if (removedData.status === true) {
      toast.success(removedData.message)
      setConnectionStatus('none')
    } else {
      toast.error(removedData.message)
    }

    // Done
    setConnecting(false)

    if (removedData.status !== true) {
      return { status: 'error', message: removedData.message }
    }

    return { status: 'ok', message: removedData.message }
  }

  async function onCreatePost() {

    if (newPostTitle.trim() === '' || newPostBody.trim() === '') {
      return
    }

    setPosting(true)

    // Query
    let createdData: CreateDiscussPostResult | undefined

    await sendCreateDiscussPostMutation({
      variables: {
        userProfileId: viewerUserProfileId,
        title: newPostTitle.trim(),
        body: newPostBody.trim()
      }
    }).then(result => createdData = result.data?.createDiscussPost)

    // Get results and set fields
    if (createdData == null) {
      toast.error(`Failed to create the post`)
    } else if (createdData.status === true) {
      toast.success(createdData.message)
      setNewPostTitle('')
      setNewPostBody('')
      if (onPostsChanged != null) {
        onPostsChanged()
      }
    } else {
      toast.error(createdData.message)
    }

    // Done
    setPosting(false)
  }

  function onDeletePost(postId: string) {

    // Ask for confirmation before deleting
    setDeletePendingPostId(postId)
    setDeleteDialogOpen(true)
  }

  // Run the delete once confirmed by the dialog
  useEffect(() => {

    // Return early if not confirmed
    if (deleteConfirmed !== true || deletePendingPostId == null) {
      return
    }

    setDeleteConfirmed(false)

    const fetchData = async () => {

      if (viewerUserProfileId == null) {
        return
      }

      // Query
      let deletedData: DeleteDiscussPostResult | undefined


      await sendDeleteDiscussPostMutation({
        variables: {
          userProfileId: viewerUserProfileId,
          id: deletePendingPostId
        }
      }).then(result => deletedData = result.data?.deleteDiscussPost)

      // Get results and set fields
      if (deletedData == null) {
        toast.error(`Failed to delete the post`)
      } else if (deletedData.status === true) {
        toast.success(deletedData.message)
        if (onPostsChanged != null) {
          onPostsChanged()
        }
      } else {
        toast.error(deletedData.message)
      }
    }

    fetchData()

  }, [deleteConfirmed])

  // WebMCP
  useWebMcpTools(() => [
    connectProfileTool({
      isSignedIn: () => viewerUserProfileId != null && viewerUserProfileId !== '',
      isOwner: () => owner === true,
      getConnectionStatus: () => connectionStatus,
      onConnect: (submitMessage) => onSendConnectionRequest(submitMessage)
    }),
    removeProfileConnectionTool({
      isSignedIn: () => viewerUserProfileId != null && viewerUserProfileId !== '',
      getConnectionStatus: () => connectionStatus,
      onRemove: () => onRemoveConnection()
    })
  ])


  // Render
  return (
    <>
      <Toaster />

      <DeleteDialog
        open={deleteDialogOpen}
        type='post'
        name='post'
        message='Are you sure? This will permanently delete the post and all of its comments. This cannot be undone.'
        setOpen={setDeleteDialogOpen}
        setDeleteConfirmed={setDeleteConfirmed} />

      <div style={{ marginBottom: '2em' }}>

        <div style={{ alignItems: 'center', display: 'flex', gap: '1em', marginBottom: '0.5em' }}>
          {profile.avatar != null && profile.avatar !== '' ?
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`${profile.displayName} avatar`}
              src={profile.avatar}
              style={{ borderRadius: '50%', height: '6em', width: '6em', marginRight: '1em' }} />
            :
            <></>
          }

          <Typography variant='h3'>
            {profile.displayName}
          </Typography>
        </div>

        <div style={{ alignItems: 'center', display: 'flex', gap: '0.5em', marginBottom: '0.5em' }}>
          <Typography
            style={{ color: 'gray' }}
            variant='body1'>
            {profileTypeName(profile.type)}
          </Typography>

          {profile.availabilityStatus != null && profile.availabilityStatus !== '' ?
            <Chip
              label={availabilityStatusName(profile.availabilityStatus)}
              size='small'
              sx={{
                height: '1.6em',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: '#e5f3e5',
                color: '#2c6e2c'
              }} />
            :
            <></>
          }

          {profile.isVerified === true ?
            <Tooltip title={`This profile is verified`}>
              <Chip
                label={`✓ Verified`}
                size='small'
                sx={{
                  height: '1.6em',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: '#e5edf8',
                  color: '#1d4f91'
                }} />
            </Tooltip>
            :
            <></>
          }
        </div>

        {profile.headline != null && profile.headline !== '' ?
          <Typography variant='h6'>
            {profile.headline}
          </Typography>
          :
          <></>
        }
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em', marginBottom: '2em' }}>
        {viewerUserProfileId != null && owner !== true &&
          <Link
            href={`/messages?with=${profile.publicId}`}
            underline='none'>
            <Button
              variant='contained'>
              Message
            </Button>
          </Link>
        }
        {viewerUserProfileId != null && owner !== true &&
          connectionStatus === 'none' ?
          <>
            {connectOpen === false ?
              <Button
                onClick={() => setConnectOpen(true)}
                variant='contained'>
                Connect
              </Button>
              :
              <div>
                <TextField
                  fullWidth
                  label='Message (optional)'
                  minRows={3}
                  multiline
                  onChange={(event) => setConnectionMessage(event.target.value)}
                  slotProps={{
                    inputLabel: {
                      shrink: Boolean(connectionMessage),
                    }
                  }}
                  style={{ marginBottom: '1em', maxWidth: '30em' }}
                  value={connectionMessage} />

                <div style={{ display: 'flex', gap: '0.75em' }}>
                  <Button
                    disabled={connecting}
                    onClick={() => onSendConnectionRequest()}
                    variant='contained'>
                    Send request
                  </Button>

                  <Button
                    disabled={connecting}
                    onClick={() => setConnectOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            }
          </>
          :
          <></>
        }

        {viewerUserProfileId != null && owner !== true &&
          connectionStatus === 'connected' ?
          <Button
            disabled={connecting}
            onClick={onRemoveConnection}
            variant='outlined'>
            Remove connection
          </Button>
          :
          <></>
        }

        {viewerUserProfileId != null && owner !== true &&
          connectionStatus === 'pending' ?
          <Typography
            style={{ color: '#2c6e2c' }}
            variant='body1'>
            Connection request pending
          </Typography>
          :
          <></>
        }

        {owner === true ?
          <div>
            <Button
              onClick={() => window.location.href = '/profile/edit'}
              variant='outlined'>
              Edit my profile
            </Button>
          </div>
          :
          <></>
        }
      </div>

      {profile.bio != null && profile.bio !== '' ?
        <div style={{ marginBottom: '2em' }}>
          <Typography variant='body1'>
            {profile.bio}
          </Typography>
        </div>
        :
        <></>
      }

      <div style={{ marginBottom: '2em' }}>
        {profile.location != null && profile.location !== '' ?
          <Typography variant='body2'>
            Location: {profile.location}
          </Typography>
          :
          <></>
        }

      </div>

      {skills != null && skills.length > 0 ?
        <div style={{ marginBottom: '2em' }}>
          <Typography
            style={{ marginBottom: '0.5em' }}
            variant='h4'>
            Skills
          </Typography>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5em' }}>
            {skills.map(skill => (
              <Tooltip
                key={skill.id}
                title={skillLevelName(skill.level)}>
                <Chip label={skill.name ?? ''} size='small' />
              </Tooltip>
            ))}
          </div>
        </div>
        :
        <></>
      }

      {links != null && links.length > 0 ?
        <div style={{ marginBottom: '2em' }}>
          <Typography
            style={{ marginBottom: '0.5em' }}
            variant='h4'>
            Links
          </Typography>

          {links.map(link => (
            <Typography
              key={link.id}
              variant='body2'>
              {profileLinkName(link.kind)}:&nbsp;
              <Link
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'>
                {link.handle != null && link.handle !== '' ?
                  link.handle
                  :
                  link.url
                }
              </Link>
            </Typography>
          ))}
        </div>
        :
        <></>
      }

      {projects != null && projects.length > 0 ?
        <div style={{ marginBottom: '2em' }}>
          <Typography
            style={{ marginBottom: '0.5em' }}
            variant='h4'>
            Projects
          </Typography>

          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project} />
          ))}
        </div>
        :
        <></>
      }

      {endorsements != null && endorsements.length > 0 ?
        <div style={{ marginBottom: '2em' }}>
          <Typography
            style={{ marginBottom: '0.5em' }}
            variant='h4'>
            Endorsements
          </Typography>

          {endorsements.map(endorsement => (
            <Typography
              key={endorsement.id}
              style={{ marginBottom: '0.25em' }}
              variant='body2'>
              {endorsement.fromDisplayName ?? `Someone`} endorsed {profile.displayName} for {endorsement.skillName ?? `a skill`}

              {endorsement.comment != null && endorsement.comment !== '' ?
                <Typography
                  component='span'
                  style={{ color: 'gray' }}
                  variant='body2'>
                  {endorsement.comment}
                </Typography>
                :
                <></>
              }
            </Typography>
          ))}
        </div>
        :
        <></>
      }

      <div style={{ marginBottom: '2em' }}>
        <Typography
          style={{ marginBottom: '0.5em' }}
          variant='h4'>
          Posts
        </Typography>

        {owner === true ?
          <div style={{ marginBottom: '1.5em' }}>
            <TextField
              fullWidth
              label='Title'
              onChange={(event) => setNewPostTitle(event.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: Boolean(newPostTitle),
                }
              }}
              style={{ marginBottom: '0.75em' }}
              value={newPostTitle} />

            <TextField
              fullWidth
              label='Share an update'
              minRows={2}
              multiline
              onChange={(event) => setNewPostBody(event.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: Boolean(newPostBody),
                }
              }}
              style={{ marginBottom: '0.75em' }}
              value={newPostBody} />

            <Button
              disabled={posting || newPostTitle.trim() === '' ||
                newPostBody.trim() === ''}
              onClick={onCreatePost}
              size='small'
              variant='contained'>
              Post
            </Button>
          </div>
          :
          <></>
        }

        {posts != null && posts.length > 0 ?
          posts.map(post => (
            <DiscussPostListItem
              key={post.id}
              onDelete={() => onDeletePost(post.id)}
              post={post}
              showDelete={owner === true} />
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
