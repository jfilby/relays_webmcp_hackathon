import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import { HeaderBrowser } from './browser'
import { HeaderMobile } from './mobile'

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash of incorrect content on initial page load.
interface Props {
  isMobile: boolean
}

export default function PageHeader({
  isMobile
}: Props) {

  // Consts
  const index = 'index'

  // State
  const [highLevelLink, setHighLevelLink] = useState<string | undefined>(undefined)

  // Functions
  function setMenuLink() {

    const paths = window.location.pathname.split('/')

    if (paths.length >= 2) {
      setHighLevelLink(paths[1])
    } else {
      setHighLevelLink(index)
    }
  }

  useEffect(() => {

    // Set current menu link
    setMenuLink()
  }, [])

  return (
    <>
      <Grid
        container
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(250, 250, 250, 0.85)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #e4e4e4',
          paddingLeft: { xs: '1em', sm: '2em' },
          paddingRight: { xs: '1em', sm: '2em' }
        }}>
        <header style={{ textAlign: 'center', width: '100%' }}>

          {highLevelLink != null ?
            <>
              {isMobile === false ?
                <HeaderBrowser
                  highLevelLink={highLevelLink} />
                :
                <HeaderMobile
                  highLevelLink={highLevelLink} />
              }
            </>
            :
            <></>
          }

        </header>
      </Grid>
    </>
  )
}