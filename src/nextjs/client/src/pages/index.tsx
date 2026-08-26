import Head from 'next/head'
import { loadServerPage } from '@/services/page/load-server-page'
import type { PageProfile } from '@/types/client-only-types'
import LaunchedLandingPage from '@/components/landing-pages/launched'
import WaitListLandingPage from '@/components/landing-pages/wait-list'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  profile?: PageProfile | null
  userProfileId?: string | null
}

export default function LandingPage({
  profile,
  userProfileId
}: Props) {

  // Render
  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>

      {process.env.NEXT_PUBLIC_WAITLIST_MODE === 'true' ?
        <WaitListLandingPage />
        :
        <LaunchedLandingPage
          userProfileId={userProfileId ?? null} />
      }
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  return loadServerPage(
    context,
    {
      serverAction: 'postSignIn'
    })
}