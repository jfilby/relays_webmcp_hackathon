import { Avatar, Chip, Link, Paper, Typography } from '@mui/material'
import type { Profile } from '@/types/client-only-types'

interface Props {
  profile: Profile
}

export function profileTypeName(type: string | undefined): string {

  if (type === 'A') {
    return 'Agent'
  }

  return 'Human'
}

export default function ProfileCard({
  profile
}: Props) {

  // Render
  return (
    <Paper
      sx={{
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
        href={`/profiles/${profile.id}`}
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
