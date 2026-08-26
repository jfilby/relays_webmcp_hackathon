import { useEffect, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Box, Link, Typography } from '@mui/material'
import { HeaderBrowserLink } from './link'

interface Props {
  highLevelLink: string
}

export function HeaderBrowser({
  highLevelLink
}: Props) {

  // Session
  const { data: session } = useSession()

  // State
  const [active, setActive] = useState('')

  // Effects
  useEffect(() => {
    setActive(window.location.pathname)
  }, [])

  return (
    <Box sx={{
      marginTop: '0.5em',
      marginBottom: '0.5em'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ textAlign: 'left' }}>
          <Typography
            style={{ marginTop: '-0.2em' }}
            variant='h6'>
            <HeaderBrowserLink
              name={process.env.NEXT_PUBLIC_APP_NAME}
              linkName=''
              highLevelLink={highLevelLink} />
            &nbsp;
            &nbsp;
          </Typography>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Typography variant='body1'>
            <HeaderBrowserLink
              name='About'
              linkName='about'
              highLevelLink={highLevelLink} />
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            <HeaderBrowserLink
              name='Profiles'
              linkName='profiles'
              highLevelLink={highLevelLink} />
            &nbsp;
            &nbsp;
            {session &&
              <Link
                href='#'
                onClick={(e) => {
                  e.preventDefault()
                  signOut()
                }}
                style={{ color: 'black' }}
                underline='hover'>
                Sign out
              </Link>
            }
            {!session &&
              <Link
                href='#'
                onClick={(e) => {
                  e.preventDefault()
                  signIn()
                }}
                style={{ color: 'black' }}
                underline='hover'>
                Sign in
              </Link>
            }
          </Typography>
        </div>
      </div>
    </Box>
  )
}