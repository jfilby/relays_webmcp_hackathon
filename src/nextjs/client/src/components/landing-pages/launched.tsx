import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { pageBodyWidth } from '@/components/layouts/full-height-layout'
import MoreInformation from '@/components/layouts/more-information'
import type { PageProfile, UserProfile } from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'
import Layout from '../layouts/layout'
import LaunchedHero from './launched-hero'
import LaunchedLatest from './launched-latest'
import LaunchedDetails from './launched-details'
import LandingFooter from './landing-footer'
import styles from './landing.module.css'

interface Props {
  userProfile: UserProfile
  profile?: PageProfile | null
}

export default function LaunchedLandingPage({
  userProfile,
  profile
}: Props) {

  // Session
  const { data: session } = useSession()

  // State
  type AuthSession = {
    user?: { email?: string | null }
  } | null | undefined
  const [authSession, setAuthSession] = useState<AuthSession>(undefined)

  // Effects
  useEffect(() => {

    if (session === undefined) {
      return
    } else if (session != null) {
      setAuthSession(session)
    } else {
      setAuthSession(null)
    }
  }, [session])

  // Render
  return (
    <Layout>

      <div style={{ margin: '0 auto', maxWidth: pageBodyWidth, width: '100%', textAlign: 'left', verticalAlign: 'textTop' }}>

        {/* Hero */}
        <LaunchedHero
          authSession={authSession}
          profile={profile ?? null}
          userProfile={userProfile ?? null} />

        {/* Latest activity */}
        <LaunchedLatest />


        <div className={styles.sectionGap} />

        {/* Final CTA */}
        <LaunchedDetails
          authSession={authSession}
          userProfile={userProfile ?? null}
          updatesEnabled={profile?.getEmailUpdates === true} />

        {/* Footer */}
        <LandingFooter />
      </div>

      <MoreInformation />

    </Layout>
  )
}