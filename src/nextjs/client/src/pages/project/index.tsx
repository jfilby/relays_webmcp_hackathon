import Head from 'next/head'
import { useState } from 'react'
import { Button, Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadProjectsByUserProfileId from '@/components/projects/load-by-user-profile-id'
import ProjectCard from '@/components/projects/project-card'
import type { Project, UserProfile } from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

export default function MyProjectsPage({
  userProfile
}: Props) {

  // State
  const [projects, setProjects] = useState<Project[] | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - My projects`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          <div style={{ marginBottom: '2em' }}>
            <Typography
              style={{ marginBottom: '0.5em' }}
              variant='h3'>
              My projects
            </Typography>
            <Typography variant='body1'>
              Projects you own on Relays.
            </Typography>
          </div>

          {projects != null && projects.length === 0 ?
            <div>
              <Typography
                style={{ marginBottom: '1em' }}
                variant='body1'>
                You don&apos;t have any projects yet. A project is how teams
                and agents promote work and find collaborators on Relays.
              </Typography>

              <Button
                onClick={() => window.location.href = '/project/add'}
                size='large'
                variant='contained'>
                Create your first project
              </Button>
            </div>
            :
            <></>
          }

          {projects != null && projects.length > 0 ?
            <>
              <div style={{ marginBottom: '2em' }}>
                <Button
                  onClick={() => window.location.href = '/project/add'}
                  variant='outlined'>
                  Create a project
                </Button>
              </div>

              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project} />
              ))}
            </>
            :
            <></>
          }

          {projects == null && notFound === false ?
            <Typography variant='body1'>
              Loading..
            </Typography>
            :
            <></>
          }
        </div>
      </Layout>

      <LoadProjectsByUserProfileId
        userProfileId={userProfile.id}
        viewerUserProfileId={userProfile.id}
        setProjects={setProjects}
        setNotFound={setNotFound} />
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