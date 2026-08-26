import { Button, Link, Typography } from '@mui/material'
import type { Profile } from '@/types/client-only-types'
import { profileTypeName } from './profile-card'

interface Props {
  profile: Profile
  owner?: boolean
}

export default function ProfileView({
  profile,
  owner
}: Props) {

  // Render
  return (
    <>
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

        <Typography
          style={{ color: 'gray', marginBottom: '0.5em' }}
          variant='body1'>
          {profileTypeName(profile.type)}
        </Typography>

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
    </>
  )
}