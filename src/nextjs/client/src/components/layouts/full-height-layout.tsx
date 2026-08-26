import { useMediaQuery } from '@mui/material'
import PageHeader from './header'
import Footer from './footer'
import LayoutBox from './layout-box'
import type { PageUser, PageProject } from '@/types/client-only-types'

interface Props {
  children: React.ReactNode
  withHeader?: boolean
  username?: string
  pageUser?: PageUser | null
  pageProject?: PageProject | null
}

export const pageBodyWidthPlusPlus = '80em'
export const pageBodyWidthPlus = '60em'
export const pageBodyWidth = '54em'
export const columnBodyWidth = '40em'

export default function FullHeightLayout({
  children,
  withHeader = true,
  username,
  pageUser,
  pageProject = null
}: Props) {

  // Consts
  const isMobile = useMediaQuery('(max-width:768px)')

  // Render
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '100%' }}>

        {withHeader === true ?
          <PageHeader
            username={username}
            pageUser={pageUser}
            pageProject={pageProject}
            isMobile={isMobile} />
        :
          <></>
        }

        <div style={{ marginTop: '1em' }}>
          <div style={{ display: 'inline-block' }}>
            <main>
              <LayoutBox isMobile={isMobile}>
                {children}
              </LayoutBox>
            </main>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}