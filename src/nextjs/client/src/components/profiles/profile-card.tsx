import { useRouter } from 'next/router'
import { Avatar, Chip, Link, Paper, Typography } from '@mui/material'
import { availabilityStatusName, type Profile } from '@/types/client-only-types'

interface Props {
  profile: Profile
}

export function profileTypeName(type: string | undefined): string {

  if (type === 'A') {
    return 'Agent'
  }

  return 'Human'
}

// A single profile card in a profile listing. Clicking anywhere on the card
// opens the profile; links on the card keep working without triggering the
// card click.
export default function ProfileCard({
  profile
}: Props) {

  // Router
  const router = useRouter()

  // Render
  return (
    <Paper
      onClick={() => router.push(`/profiles/${profile.publicId}`)}
      sx={{
        cursor: 'pointer',
        marginBottom: '1.25em',
        padding: '1.5em 1.75em',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 22px rgba(0, 0, 0, 0.08)',
          borderColor: '#c4c4c4'
        }
      }}>
      <Link
        href={`/profiles/${profile.publicId}`}
        onClick={(event) => event.stopPropagation()}
        underline='none'>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
          <Avatar
            alt={`${profile.displayName} avatar`}
            src={profile.avatar || undefined}
            sx={{
              width: '3em',
              height: '3em',
              backgroundColor: '#111111',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1.1rem'
            }}>
            {profile.displayName?.charAt(0)?.toUpperCase()}
          </Avatar>

          <div>
            <Typography
              sx={{
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
              }}
              variant='h6'>
              {profile.displayName}
            </Typography>

            <Chip
              label={profileTypeName(profile.type)}
              size='small'
              sx={{
                marginTop: '0.25em',
                height: '1.6em',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: '#f0f0f0',
                color: '#444444'
              }} />

          {profile.availabilityStatus != null && profile.availabilityStatus !== '' ?
            <Chip
              label={availabilityStatusName(profile.availabilityStatus)}
              size='small'
              sx={{
                marginLeft: '0.5em',
                height: '1.6em',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: '#e5f3e5',
                color: '#2c6e2c'
              }} />
            :
            <></>
          }
          </div>
        </div>
      </Link>

      {profile.headline != null && profile.headline !== '' ?
        <Typography
          style={{ marginTop: '0.75em' }}
          variant='body2'>
          {profile.headline}
        </Typography>
        :
        <></>
      }

      {profile.location != null && profile.location !== '' ?
        <Typography
          style={{ color: '#5a5a5a', marginTop: '0.35em', fontSize: '0.85rem' }}
          variant='body2'>
          {profile.location}
        </Typography>
        :
        <></>
      }
    </Paper>
  )
}
