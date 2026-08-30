import { useState } from 'react'
import { Button, Chip, Link, TextField, Tooltip, Typography } from '@mui/material'
import { Toaster, toast } from 'sonner'
import { useMutation } from '@apollo/client/react'
import { createDiscussPostMutation, deleteDiscussPostMutation } from '@/apollo/discussion'
import { sendConnectionRequestMutation } from '@/apollo/connections'
import { availabilityStatusName, skillLevelName } from '@/types/client-only-types'
import DiscussPostListItem from '@/components/discussion/discuss-post-list-item'
import type { DiscussPostItem, Endorsement, Profile, ProfileLink, ProfileSkill } from '@/types/client-only-types'
import { profileTypeName } from './profile-card'

// Human-readable label for a profile link kind:
// W website, G github, L linkedin, R repository, M MCP endpoint, X other
function profileLinkName(kind: string | undefined | null): string {

  const found = [
    { value: 'W', name: 'Website' },
    { value: 'G', name: 'GitHub' },
    { value: 'L', name: 'LinkedIn' },
    { value: 'R', name: 'Repository' },
    { value: 'M', name: 'MCP endpoint' },
    { value: 'X', name: 'Other' }
  ].find(linkKind => linkKind.value === kind)

  return found?.name ?? 'Link'
}

interface Props {
  profile: Profile
  owner?: boolean
  viewerUserProfileId?: string
  skills?: ProfileSkill[]
  links?: ProfileLink[]
  endorsements?: Endorsement[]
  posts?: DiscussPostItem[]
  onPostsChanged?: () => void
}

interface SendConnectionRequestResult {
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
  posts,
  onPostsChanged
}: Props) {

  // State
  const [connectOpen, setConnectOpen] = useState<boolean>(false)
  const [connectionMessage, setConnectionMessage] = useState<string>('')
  const [connectionSent, setConnectionSent] = useState<boolean>(false)
  const [connecting, setConnecting] = useState<boolean>(false)

  const [newPostTitle, setNewPostTitle] = useState<string>('')
  const [newPostBody, setNewPostBody] = useState<string>('')
  const [posting, setPosting] = useState<boolean>(false)

  // GraphQL
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
  async function onSendConnectionRequest() {

    if (viewerUserProfileId == null || viewerUserProfileId === '') {
      return
    }

    setConnecting(true)

    // Query
    let sentData: SendConnectionRequestResult | undefined

    await sendSendConnectionRequestMutation({
      variables: {
        userProfileId: viewerUserProfileId,
        toProfileId: profile.id,
        message: connectionMessage !== '' ? connectionMessage : null
      }
    }).then(result => sentData = result.data?.sendConnectionRequest)

    // Get results
    if (sentData == null) {
      toast.error(`Failed to send the connection request`)
    } else if (sentData.status === true) {
      toast.success(sentData.message)
      setConnectionSent(true)
      setConnectOpen(false)
    } else {
      toast.error(sentData.message)
    }

    // Done
    setConnecting(false)
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

  async function onDeletePost(postId: string) {

    if (viewerUserProfileId == null) {
      return
    }

    // Query
    let deletedData: DeleteDiscussPostResult | undefined

    await sendDeleteDiscussPostMutation({
      variables: {
        userProfileId: viewerUserProfileId,
        id: postId
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

  // Render
  return (
    <>
      <Toaster />

      <div style={{ marginBottom: '2em' }}>

        {profile.avatar != null && profile.avatar !== '' ?
          <div style={{ marginBottom: '1em' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`${profile.displayName} avatar`}
              src={profile.avatar}
              style={{ borderRadius: '50%', height: '6em', width: '6em' }} />
          </div>
          :
          <></>
        }

        <Typography variant='h3'>
          {profile.displayName}
        </Typography>

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

      {profile.bio != null && profile.bio !== '' ?
        <div style={{ marginBottom: '2em' }}>
          <Typography variant='body1'>
            {profile.bio}
          </Typography>
        </div>
        :
        <></>
      }

      <div style={{ marginBottom: '1em' }}>
        {profile.location != null && profile.location !== '' ?
          <Typography variant='body2'>
            Location: {profile.location}
          </Typography>
          :
          <></>
        }

        {profile.website != null && profile.website !== '' ?
          <Typography variant='body2'>
            Website:&nbsp;
            <Link
              href={profile.website}
              target='_blank'
              rel='noopener noreferrer'>
              {profile.website}
            </Link>
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

      {viewerUserProfileId != null && owner !== true && connectionSent !== true ?
        <div style={{ marginBottom: '2em' }}>
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
                  onClick={onSendConnectionRequest}
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
        </div>
        :
        <></>
      }

      {viewerUserProfileId != null && owner !== true && connectionSent === true ?
        <Typography
          style={{ color: '#2c6e2c', marginBottom: '2em' }}
          variant='body1'>
          Connection request sent
        </Typography>
        :
        <></>
      }

      {owner === true ?
        <div style={{ marginBottom: '2em' }}>
          <Button
            onClick={() => window.location.href = '/profile/edit'}
            variant='outlined'>
            Edit my profile
          </Button>
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
