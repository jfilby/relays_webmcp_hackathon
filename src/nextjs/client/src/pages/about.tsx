import Head from 'next/head'
import type { GetServerSidePropsContext } from 'next'
import { Link, Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LaunchedHeader from '@/components/landing-pages/header'

interface Props {
}

export default function AboutPage({}: Props) {

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - About`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          <LaunchedHeader />

          <div>
            <Typography
              style={{ marginBottom: '0.5em' }}
              variant='h3'>
              Team
            </Typography>
            <Typography variant='body1'>
              The founder is Jason Filby (X:&nbsp;
              <Link href='https://x.com/jasonfi'>@jasonfi</Link>).
            </Typography>
          </div>
        </div>
      </Layout>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  return loadServerPage(
    context,
    {})
}