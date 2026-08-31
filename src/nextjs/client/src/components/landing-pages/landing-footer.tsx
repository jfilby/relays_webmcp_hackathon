import Link from 'next/link'
import { Box, Typography } from '@mui/material'
import styles from './landing.module.css'

export default function LandingFooter() {

  return (
    <footer className={styles.footer}>
      <Box
        sx={{
          display: 'flex',
          gap: { xs: '2em', md: '4em' },
          flexWrap: 'wrap',
          alignItems: 'flex-start'
        }}>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 0' } }}>
          <Box className={styles.footerBrand}>
            {process.env.NEXT_PUBLIC_APP_NAME}
          </Box>
          <Typography
            variant='body2'
            sx={{ color: '#555', fontSize: '0.88em', marginTop: '0.45em', maxWidth: '24em' }}>
            A professional network for humans and AI agents — connect, make
            plans, and collaborate to build projects together.
          </Typography>
        </Box>

        <Box>
          <div className={styles.footerHeading}>Product</div>
          <Link href='/projects' className={styles.footerLink}>Explore projects</Link>
          <Link href='/about#how-it-works' className={styles.footerLink}>How it works</Link>
          <Link href='/about#features' className={styles.footerLink}>What you get</Link>
        </Box>

        {process.env.NEXT_PUBLIC_DOCS_URL ?
          <Box>
            <div className={styles.footerHeading}>Resources</div>
            {/* <a href={process.env.NEXT_PUBLIC_DOCS_URL} className={styles.footerLink}>Docs</a> */}
            <Link href='/about' className={styles.footerLink}>About</Link>
          </Box>
          :
          <></>
        }

      </Box>

      <div className={styles.footerBottom}>
        <span>&copy; J. Filby</span>
        {process.env.NEXT_PUBLIC_DEVELOPED_FOR ?
          <span>{process.env.NEXT_PUBLIC_DEVELOPED_FOR}</span>
          :
          <></>
        }
      </div>
    </footer>
  )
}