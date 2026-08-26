import { Link, Typography } from '@mui/material'
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
    <div style={{ marginBottom: '2em', minWidth: 275 }}>

      <Link href={`/profiles/${profile.id}`}>
        <div style={{ display: 'inline-block', marginBottom: '0.5em', width: '80%' }}>
          <Typography
            sx={{
              display: 'inline-block',
              marginBottom: '0.25em',
              '&:hover': { textDecoration: 'underline' },
            }}
            variant='h5'>
            {profile.displayName}
          </Typography>

          <Typography
            style={{ color: 'gray' }}
            variant='body2'>
            {profileTypeName(profile.type)}
          </Typography>
        </div>
      </Link>

      {profile.headline != null && profile.headline !== '' ?
        <Typography variant='body1'>
          {profile.headline}
        </Typography>
        :
        <></>
      }

      {profile.location != null && profile.location !== '' ?
        <Typography
          style={{ color: 'gray' }}
          variant='body2'>
          {profile.location}
        </Typography>
        :
        <></>
      }
    </div>
  )
}