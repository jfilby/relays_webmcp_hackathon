import Head from 'next/head'
import { loadServerPage } from '@/services/page/load-server-page'
import type { PageProfile, UserProfile } from '@/types/client-only-types'
import LaunchedLandingPage from '@/components/landing-pages/launched'
import WaitListLandingPage from '@/components/landing-pages/wait-list'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
  profile?: PageProfile | null
}

export default function LandingPage({
  userProfile,
  profile
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
          userProfile={userProfile}
          profile={profile} />
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