import { useRouter } from 'next/router'
import { Link, Paper, Typography } from '@mui/material'
import type { DiscussPostItem } from '@/types/client-only-types'
import { formatSince } from '@/services/utils/dates'

interface Props {
  post: DiscussPostItem
  // Clamp the body to two lines (e.g. on the main discuss list)
  clampBody?: boolean
  // Show a delete link (e.g. for the post's author)
  showDelete?: boolean
  onDelete?: () => void
}

// A single post card in a post listing. Clicking anywhere on the card opens
// the post; the title and delete links keep working without triggering the
// card click.
export default function DiscussPostListItem({
  post,
  clampBody,
  showDelete,
  onDelete
}: Props) {

  // Router
  const router = useRouter()

  // Functions
  function onClickPost() {
    router.push(`/discuss/${post.publicId}`)
  }

  function onClickDelete(event: React.MouseEvent) {
    // Don't trigger the card click when deleting
    event.stopPropagation()
    onDelete?.()
  }

  // Render
  return (
    <Paper
      onClick={onClickPost}
      sx={{
        cursor: 'pointer',
        marginBottom: '1em',
        padding: '1.25em 1.5em',
        transition: 'box-shadow 0.18s ease',
        '&:hover': {
          boxShadow: '0 8px 22px rgba(0, 0, 0, 0.08)'
        }
      }}>
      <Link
        href={`/discuss/${post.publicId}`}
        onClick={(event) => event.stopPropagation()}
        style={{ color: 'inherit', display: 'block', textDecoration: 'none' }}
        underline='none'>
        <Typography
          sx={{ '&:hover': { textDecoration: 'underline' } }}
          variant='h5'>
          {post.title}
        </Typography>
      </Link>

      <Typography
        sx={clampBody === true ?
          {
            display: '-webkit-box',
            marginTop: '0.5em',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2
          } :
          { marginTop: '0.5em', whiteSpace: 'pre-wrap' }}
        variant='body1'>
        {post.body}
      </Typography>

      <Typography
        style={{
          alignItems: 'center',
          color: '#5a5a5a',
          display: 'flex',
          flexWrap: 'wrap',
          fontSize: '0.85rem',
          gap: '0.5em',
          marginTop: '0.75em'
        }}
        variant='body2'>
        <span>
          {post.authorName != null && post.authorName !== '' ?
            `${post.authorName} · ` :
            ''}
          {formatSince(post.created)} · {post.commentCount}{' '}
          {post.commentCount === 1 ? 'comment' : 'comments'}
        </span>

        {showDelete === true ?
          <Link
            component='button'
            onClick={onClickDelete}
            style={{ color: '#b91c1c' }}
            underline='hover'>
            Delete
          </Link>
          :
          <></>
        }
      </Typography>
    </Paper>
  )
}
