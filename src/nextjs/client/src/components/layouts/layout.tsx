import { useMediaQuery } from '@mui/material'
import PageHeader from './header'
import Footer from './footer'
import LayoutBox from './layout-box'
import type { PageUser, PageProject } from '@/types/client-only-types'

interface Props {
  children: React.ReactNode
  username?: string | null
  pageUser?: PageUser | null
  pageProject?: PageProject | null
  width?: string | null
}

export const pageBodyWidth = '54em'
export const columnBodyWidth = '40em'

export default function Layout({
  children,
  username = null,
  pageUser = null,
  pageProject = null,
  width = null
}: Props) {

  // Consts
  const isMobile = useMediaQuery('(max-width:768px)')

  // Render
  return (
    <>
      <PageHeader
        username={username}
        pageUser={pageUser}
        pageProject={pageProject}
        isMobile={isMobile} />

      <div style={{ marginBottom: '2.5em' }} />
      <main>
        <LayoutBox
          isMobile={isMobile}
          width={width}>
          {children}
        </LayoutBox>
      </main>
      <Footer />
    </>
  )
}