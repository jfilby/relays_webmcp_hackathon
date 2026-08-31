import { useState, useEffect } from 'react'
import { getCookie } from 'cookies-next'
import { Link, Paper, Typography } from '@mui/material'
import type { Project, DiscussPostItem } from '@/types/client-only-types'
import { projectStageName } from '@/types/client-only-types'
import { formatSince } from '@/services/utils/dates'
import LoadLatestActivity from './load-latest-activity'
import type { LatestActivity } from './load-latest-activity'
import styles from './landing.module.css'

// The number of items shown per stream
const take = 5

export default function LaunchedLatest() {

  // Signed-in user: the signedInUserUq cookie set by the auth flow (see
  // serene-core-client UsersService)
  const [userProfileId, setUserProfileId] = useState<string>('')

  useEffect(() => {

    const cookieValue = getCookie('signedInUserUq')

    setUserProfileId(typeof cookieValue === 'string' ? cookieValue : '')
  }, [])

  // State
  const [latestActivity, setLatestActivity] = useState<LatestActivity | undefined>(undefined)

  // Render
  return (
    <>
      <div
        id='latest'
        style={{ paddingTop: '1em', paddingBottom: '1em' }} />

      <LoadLatestActivity
        userProfileId={userProfileId}
        take={take}
        setLatestActivity={setLatestActivity} />

      <div style={{ textAlign: 'center' }}>
        <div className={styles.sectionLabel}>Latest activity</div>
        <Typography
          className={styles.sectionTitle}
          variant='h5'>
          What&apos;s happening right now
        </Typography>
        <Typography
          className={styles.cardBody}
          sx={{ marginTop: '0.75em', fontSize: '0.98em' }}
          variant='body1'>
          {userProfileId != null ?
            `The newest from your network and the wider Relays community.` :
            `The newest projects, posts, and comments on Relays. Sign in to see this personalized to your network.`}
        </Typography>
      </div>

      <div style={{ marginTop: '2em' }}>

        {/* Projects */}
        {(latestActivity?.projects ?? []).length > 0 ?
          <>
            <Typography
              className={styles.cardTitle}
              variant='h6'>
              Latest projects
            </Typography>

            {(latestActivity?.projects ?? []).map((project) =>
              <LatestProjectCard
                key={project.id}
                project={project} />
            )}
          </>
          :
          <></>
        }

        {/* Posts */}
        {(latestActivity?.posts ?? []).length > 0 ?
          <>
            <Typography
              className={styles.cardTitle}
              sx={{ marginTop: '1.75em' }}
              variant='h6'>
              Latest posts
            </Typography>

            {(latestActivity?.posts ?? []).map((post) =>
              <LatestPostCard
                key={post.id}
                post={post} />
            )}
          </>
          :
          <></>
        }

        {/* Comments */}
        {(latestActivity?.comments ?? []).length > 0 ?
          <>
            <Typography
              className={styles.cardTitle}
              sx={{ marginTop: '1.75em' }}
              variant='h6'>
              Latest comments
            </Typography>

            {(latestActivity?.comments ?? []).map((comment) =>
              <LatestCommentCard
                key={comment.id}
                comment={comment} />
            )}
          </>
          :
          <></>
        }
      </div>
    </>
  )
}

// A compact project card for the landing activity stream
function LatestProjectCard({
  project
}: {
  project: Project
}) {

  // Render
  return (
    <Paper
      sx={{
        marginBottom: '0.75em',
        padding: '1em 1.25em',
        transition: 'box-shadow 0.18s ease',
        '&:hover': {
          boxShadow: '0 8px 22px rgba(0, 0, 0, 0.08)'
        }
      }}>
      <Link
        href={`/projects/${project.publicId}`}
        underline='none'>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em', flexWrap: 'wrap' }}>
          <Typography
            sx={{ fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
            variant='subtitle1'>
            {project.name}
          </Typography>

          {projectStageName(project.stage) !== '' ?
            <Typography
              className={styles.chip}
              component='span'
              variant='body2'>
              {projectStageName(project.stage)}
            </Typography>
            :
            <></>
          }

          {project.isPromoted === true ?
            <Typography
              className={styles.chip}
              component='span'
              variant='body2'>
              Showcased
            </Typography>
            :
            <></>
          }
        </div>
      </Link>

      {project.tagline != null && project.tagline !== '' ?
        <Typography
          sx={{ marginTop: '0.35em' }}
          variant='body2'>
          {project.tagline}
        </Typography>
        :
        <></>
      }

      <Typography
        sx={{
          alignItems: 'center',
          color: '#5a5a5a',
          display: 'flex',
          flexWrap: 'wrap',
          fontSize: '0.85rem',
          gap: '0.5em',
          marginTop: '0.5em'
        }}
        variant='body2'>
        {project.ownerName != null && project.ownerName !== '' ?
          <span>{project.ownerName} · </span>
          :
          <></>
        }
        <span>{formatSince(project.created)}</span>
      </Typography>
    </Paper>
  )
}

// A compact post card for the landing activity stream
function LatestPostCard({
  post
}: {
  post: DiscussPostItem
}) {

  // Render
  return (
    <Paper
      sx={{
        cursor: 'pointer',
        marginBottom: '0.75em',
        padding: '1em 1.25em',
        transition: 'box-shadow 0.18s ease',
        '&:hover': {
          boxShadow: '0 8px 22px rgba(0, 0, 0, 0.08)'
        }
      }}
      onClick={() => window.location.href = `/discuss/${post.publicId}`}>
      <Link
        href={`/discuss/${post.publicId}`}
        onClick={(event) => event.stopPropagation()}
        style={{ color: 'inherit', display: 'block', textDecoration: 'none' }}
        underline='none'>
        <Typography
          sx={{ fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
          variant='subtitle1'>
          {post.title}
        </Typography>
      </Link>

      <Typography
        sx={{
          display: '-webkit-box',
          marginTop: '0.35em',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2
        }}
        variant='body2'>
        {post.body}
      </Typography>

      <Typography
        sx={{
          alignItems: 'center',
          color: '#5a5a5a',
          display: 'flex',
          flexWrap: 'wrap',
          fontSize: '0.85rem',
          gap: '0.5em',
          marginTop: '0.5em'
        }}
        variant='body2'>
        <span>
          {post.authorName != null && post.authorName !== '' ?
            `${post.authorName} · ` :
            ''}
          {formatSince(post.created)} · {post.commentCount}{' '}
          {post.commentCount === 1 ? 'comment' : 'comments'}
        </span>
      </Typography>
    </Paper>
  )
}

// A compact comment card for the landing activity stream
function LatestCommentCard({
  comment
}: {
  comment: {
    id: string
    postPublicId?: string | null
    postTitle?: string | null
    authorName?: string | null
    authorProfilePublicId?: string | null
    body: string
    created: string
  }
}) {

  // Render
  return (
    <Paper
      sx={{
        marginBottom: '0.75em',
        padding: '1em 1.25em'
      }}>
      <Typography
        sx={{
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2
        }}
        variant='body2'>
        &ldquo;{comment.body}&rdquo;
      </Typography>

      <Typography
        sx={{
          alignItems: 'center',
          color: '#5a5a5a',
          display: 'flex',
          flexWrap: 'wrap',
          fontSize: '0.85rem',
          gap: '0.5em',
          marginTop: '0.5em'
        }}
        variant='body2'>
        <span>
          {comment.authorName != null && comment.authorName !== '' ?
            `${comment.authorName} · ` :
            ''}
          {formatSince(comment.created)} · on{' '}
        </span>

        {comment.postPublicId != null ?
          <Link
            href={`/discuss/${comment.postPublicId}`}
            underline='hover'>
            {comment.postTitle ?? 'a post'}
          </Link>
          :
          <span>{comment.postTitle ?? 'a post'}</span>
        }
      </Typography>
    </Paper>
  )
}
