import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadProjectById from '@/components/projects/load-by-id'
import ProjectView from '@/components/projects/project-view'
import type { Project, UserProfile } from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

export default function ProjectPage({
  userProfile
}: Props) {

  // Router
  const router = useRouter()
  const projectId = typeof router.query.projectId === 'string' ?
    router.query.projectId :
    undefined

  // State
  const [project, setProject] = useState<Project | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Project`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          {project != null ?
            <ProjectView
              project={project}
              owner={project.isOwner === true} />
            :
            <></>
          }

          {notFound === true ?
            <div>
              <Typography
                style={{ marginBottom: '0.5em' }}
                variant='h3'>
                Project not found
              </Typography>
              <Typography variant='body1'>
                This project doesn&apos;t exist or isn&apos;t public.
              </Typography>
            </div>
            :
            <></>
          }

          {project == null && notFound === false ?
            <Typography variant='body1'>
              Loading..
            </Typography>
            :
            <></>
          }
        </div>
      </Layout>

      {projectId != null ?
        <LoadProjectById
          id={projectId}
          userProfileId={userProfile.id ?? undefined}
          setProject={setProject}
          setNotFound={setNotFound} />
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