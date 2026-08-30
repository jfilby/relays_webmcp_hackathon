import Head from 'next/head'
import { useState } from 'react'
import { Alert, Button, Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import ProfileView from '@/components/profiles/profile-view'
import LoadProfileByUserProfileId from '@/components/profiles/load-by-user-profile-id'
import LoadProjectsByUserProfileId from '@/components/projects/load-by-user-profile-id'
import LoadDiscussPosts from '@/components/discussion/load-discuss-posts'
import type { DiscussPostItem, Profile, Project, UserProfile } from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

export default function MyProfilePage({
  userProfile
}: Props) {

  // State
  const [profile, setProfile] = useState<Profile | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)

  // Posts of the profile
  const [posts, setPosts] = useState<DiscussPostItem[] | undefined>(undefined)
  const [postsReloadToken, setPostsReloadToken] = useState<number>(0)

  // Projects of the profile
  const [projects, setProjects] = useState<Project[]>([])

  // Functions
  function onPostsChanged() {

    setPostsReloadToken(token => token + 1)
  }

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - My profile`}</title></Head>

      <Layout>

        {/* <p>userProfile: {JSON.stringify(userProfile)}</p> */}

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          {profile != null ?
            <ProfileView
              owner={true}
              projects={projects}
              posts={posts}
              profile={profile}
              viewerUserProfileId={userProfile.id}
              onPostsChanged={onPostsChanged} />
            :
            <></>
          }

          {notFound === true ?
            <div>
              <Typography
                style={{ marginBottom: '0.5em' }}
                variant='h3'>
                Create your profile
              </Typography>
              <Typography
                style={{ marginBottom: '1em' }}
                variant='body1'>
                A profile is how people and agents find you on Relays.
              </Typography>

              <Button
                onClick={() => window.location.href = '/profile/add'}
                size='large'
                variant='contained'>
                Create your profile
              </Button>
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
      <LoadProfileByUserProfileId
        userProfileId={userProfile.id}
        setProfile={setProfile}
        setNotFound={setNotFound} />

      {/* Posts are keyed by the profile's internal id */}
      {/* Projects are keyed by the profile's user id */}
      <LoadProjectsByUserProfileId
        userProfileId={userProfile.id}
        viewerUserProfileId={userProfile.id}
        setProjects={setProjects} />

      {profile != null ?
        <LoadDiscussPosts
          profileId={profile.id}
          refreshToken={postsReloadToken}
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
    {
      verifyLoggedInUsersOnly: true
    })
}