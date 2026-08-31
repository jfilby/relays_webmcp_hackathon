import { useEffect, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Box, Link } from '@mui/material'
import SearchOmnibar from './search-omnibar'
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
    <Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5em',
        paddingY: '0.7em'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em', textAlign: 'left' }}>
          <HeaderBrowserLink
            name={process.env.NEXT_PUBLIC_APP_NAME}
            linkName=''
            highLevelLink={highLevelLink}
            isBrand={true} />
          <HeaderBrowserLink
            name='My network'
            linkName='network'
            highLevelLink={highLevelLink} />
          <HeaderBrowserLink
            name='Projects'
            linkName='projects'
            highLevelLink={highLevelLink} />
        </div>
        <SearchOmnibar />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em', textAlign: 'right' }}>
          {session &&
            <>
              <HeaderBrowserLink
                name='Messages'
                linkName='messages'
                highLevelLink={highLevelLink} />
              <HeaderBrowserLink
                name='Notifications'
                linkName='notifications'
                highLevelLink={highLevelLink} />
              <HeaderBrowserLink
                name='My profile'
                linkName='profile'
                highLevelLink={highLevelLink} />
            </>
          }
          <HeaderBrowserLink
            name='About'
            linkName='about'
            highLevelLink={highLevelLink} />
          {session ?
            <Link
              href='#'
              onClick={(e) => {
                e.preventDefault()
                signOut()
              }}
              style={{
                color: '#5a5a5a',
                fontWeight: 500,
                padding: '0.3em 0.8em'
              }}
              underline='none'>
              Sign out
            </Link>
            :
            <Link
              href='#'
              onClick={(e) => {
                e.preventDefault()
                signIn()
              }}
              style={{
                border: '1px solid #111111',
                borderRadius: 999,
                color: '#111111',
                padding: '0.35em 1em',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
              underline='none'>
              Sign in
            </Link>
          }
        </div>
      </Box>
    </Box>
  )
}