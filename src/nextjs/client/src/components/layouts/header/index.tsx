import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import { HeaderBrowser } from './browser'
import { HeaderMobile } from './mobile'
import type { PageUser, PageProject } from '@/types/client-only-types'

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash of incorrect content on initial page load.
interface Props {
  username?: string | null
  pageUser?: PageUser | null
  pageProject?: PageProject | null
  isMobile: boolean
}

export default function PageHeader({
  username,
  pageUser,
  pageProject,
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
      <Grid container style={{ background: '#f6f6f6', borderBottom: '1px solid #aaa', paddingLeft: '1em', paddingRight: '1em' }}>
        <header style={{ textAlign: 'center', width: '100%' }}>

          {highLevelLink != null ?
            <>
              {isMobile === false ?
                <HeaderBrowser
                  pageUser={pageUser}
                  pageProject={pageProject}
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