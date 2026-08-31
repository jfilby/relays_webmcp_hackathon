import { useSession } from 'next-auth/react'
import { useMediaQuery } from '@mui/material'
import PageHeader from './header'
import Footer from './footer'
import LayoutBox from './layout-box'
import DmPopup from '@/components/dms/dm-popup'

interface Props {
  children: React.ReactNode
  width?: string | null
}

export const pageBodyWidth = '54em'
export const columnBodyWidth = '40em'

export default function Layout({
  children,
  width = null
}: Props) {

  // Session
  const { data: session } = useSession()

  // Consts
  const isMobile = useMediaQuery('(max-width:768px)')

  // Render
  return (
    <>
      <PageHeader
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

      {/* Global DM pop-up (signed-in users only) */}
      {session?.user != null &&
        <DmPopup />
      }
    </>
  )
}