import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import Box from '@mui/material/Box'
import { signIn, signOut, useSession } from 'next-auth/react'
import { AppBar, Button, Divider, IconButton, Menu, Toolbar, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { HeaderMobileLink } from './link'

interface Props {
  highLevelLink: string
}

export function HeaderMobile({ highLevelLink }: Props) {

  const { data: session } = useSession()

  const handleSignin = (e: MouseEvent) => {
    e.preventDefault()
    signIn()
  }

  const handleSignout = (e: MouseEvent) => {
    e.preventDefault()
    signOut()
  }

  const [active, setActive] = useState('')

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const handleMenuOpen = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    setActive(window.location.pathname)
  }, [])

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='fixed'>
        <Toolbar>
          <IconButton
            edge='start'
            color='inherit'
            aria-label='menu'
            onClick={handleMenuOpen}
            style={{ marginRight: '2px' }}>
            <MenuIcon />
          </IconButton>
          <Menu
            id='menu-appbar'
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}>
            <HeaderMobileLink
              name='Home'
              linkName=''
              highLevelLink={highLevelLink} />
            <HeaderMobileLink
              name='Explore'
              linkName='explore'
              highLevelLink={highLevelLink} />
            <Divider />
            <HeaderMobileLink
              name='Profiles'
              linkName='profiles'
              highLevelLink={highLevelLink} />
            <Divider />
            <HeaderMobileLink
              name='Projects'
              linkName='projects'
              highLevelLink={highLevelLink} />
            <Divider />
            <HeaderMobileLink
              name='About'
              linkName='about'
              highLevelLink={highLevelLink} />
          </Menu>

          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            {process.env.NEXT_PUBLIC_APP_NAME}
          </Typography>

          {session == null ?
            <Button
              color='inherit'
              onClick={(e) => handleSignin(e)}>
              Sign in
            </Button>
            :
            <Button
              color='inherit'
              onClick={(e) => handleSignout(e)}>
              Sign out
            </Button>
          }

        </Toolbar>
      </AppBar>
      <br /><br />
    </Box>
  )
}