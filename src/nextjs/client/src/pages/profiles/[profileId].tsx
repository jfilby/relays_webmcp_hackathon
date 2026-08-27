import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadProfileById from '@/components/profiles/load-by-id'
import LoadSkillsByProfileId from '@/components/profiles/load-skills'
import LoadLinksByProfileId from '@/components/profiles/load-links'
import LoadEndorsementsByProfileId from '@/components/profiles/load-endorsements'
import LoadPostsByProfileId from '@/components/profiles/load-posts'
import ProfileView from '@/components/profiles/profile-view'
import type { Endorsement, PostItem, Profile, ProfileLink, ProfileSkill, UserProfile } from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

export default function ProfilePage({
  userProfile
}: Props) {

  // Router
  const router = useRouter()
  const profileId = typeof router.query.profileId === 'string' ?
    router.query.profileId :
    undefined

  // State
  const [profile, setProfile] = useState<Profile | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)

  const [skills, setSkills] = useState<ProfileSkill[]>([])
  const [links, setLinks] = useState<ProfileLink[]>([])
  const [endorsements, setEndorsements] = useState<Endorsement[]>([])
  const [posts, setPosts] = useState<PostItem[]>([])
  const [postsReloadToken, setPostsReloadToken] = useState<number>(0)

  // Functions
  function onPostsChanged() {

    setPostsReloadToken(token => token + 1)
  }

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Profile`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          {profile != null ?
            <ProfileView
              profile={profile}
              owner={profile.userProfileId === userProfile.id}
              viewerUserProfileId={userProfile.id}
              skills={skills}
              links={links}
              endorsements={endorsements}
              posts={posts}
              onPostsChanged={onPostsChanged} />
            :
            <></>
          }

          {notFound === true ?
            <div>
              <Typography
                style={{ marginBottom: '0.5em' }}
                variant='h3'>
                Profile not found
              </Typography>
              <Typography variant='body1'>
                This profile doesn&apos;t exist or isn&apos;t public.
              </Typography>
            </div>
            :
            <></>
          }

          {profile == null && notFound === false ?
            <Typography variant='body1'>
              Loading..
            </Typography>
            :
            <></>
          }
        </div>
      </Layout>

      {profileId != null ?
        <LoadProfileById
          id={profileId}
          userProfileId={userProfile.id ?? undefined}
          setProfile={setProfile}
          setNotFound={setNotFound} />
        :
        <></>
      }

      {profileId != null ?
        <LoadSkillsByProfileId
          profileId={profileId}
          setSkills={setSkills} />
        :
        <></>
      }

      {profileId != null ?
        <LoadLinksByProfileId
          profileId={profileId}
          setLinks={setLinks} />
        :
        <></>
      }

      {profileId != null ?
        <LoadEndorsementsByProfileId
          profileId={profileId}
          setEndorsements={setEndorsements} />
        :
        <></>
      }

      {profileId != null ?
        <LoadPostsByProfileId
          profileId={profileId}
          reloadToken={postsReloadToken}
          setPosts={setPosts} />
        :
        <></>
      }
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  return loadServerPage(
    context,
    {})
}
