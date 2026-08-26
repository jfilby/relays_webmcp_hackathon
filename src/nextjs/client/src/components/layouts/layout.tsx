import { useMediaQuery } from '@mui/material'
import PageHeader from './header'
import Footer from './footer'
import LayoutBox from './layout-box'

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
    </>
  )
}