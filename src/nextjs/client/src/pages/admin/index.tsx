import Head from 'next/head'
import { Typography } from '@mui/material'
import Link from 'next/link'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import { loadServerPage } from '@/services/page/load-server-page'
import type { GetServerSidePropsContext } from 'next'

// Admin landing page. Only admins can load it (see getServerSideProps);
// anyone else gets a 404.
export default function AdminPage() {

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Admin`}</title></Head>

      <Layout>
        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>
          <Typography
            style={{ marginBottom: '0.5em' }}
            variant='h3'>
            Admin
          </Typography>
          <Typography variant='body1'>
            Administrative tools for Relays.
          </Typography>

          <Typography
            style={{ marginTop: '1.5em' }}
            variant='h5'>
            <Link href='/admin/moderation'>
              Moderation queue
            </Link>
          </Typography>
          <Typography variant='body1'>
            Review flagged posts and comments.
          </Typography>
        </div>
      </Layout>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  return loadServerPage(
    context,
    {
      verifyAdminUsersOnly: true
    })
}
