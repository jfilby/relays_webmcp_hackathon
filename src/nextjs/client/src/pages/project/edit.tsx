import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadProjectByPublicId from '@/components/projects/load-by-id'
import ProjectForm, { ProjectFormValues } from '@/components/projects/project-form'
import UpdateProject from '@/components/projects/update'
import DeleteProject from '@/components/projects/delete'
import type { Project, UserProfile } from '@/types/client-only-types'
import { useWebMcpTools } from '@/webmcp/webmcp'
import { updateProjectTool } from '@/webmcp/tools/projects'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

export default function EditProjectPage({
  userProfile
}: Props) {
  // Router
  const router = useRouter()
  const projectPublicId = typeof router.query.id === 'string' ?
    router.query.id :
    undefined

  // State
  const [notFound, setNotFound] = useState<boolean>(false)

  const [project, setProject] = useState<Project | undefined>(undefined)
  const [values, setValues] = useState<ProjectFormValues>({
    name: '',
    tagline: '',
    description: '',
    website: '',
    image: '',
    techStack: '',
    stage: '',
    isOpenToCollaborators: false,
    isPromoted: false,
    isPublic: true
  })

  const valuesRef = useRef(values)

  valuesRef.current = values

  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  const [updateAction, setUpdateAction] = useState<boolean>(false)
  const [updatedAction, setUpdatedAction] = useState<boolean>(false)

  const [deleteAction, setDeleteAction] = useState<boolean>(false)
  const [deletedAction, setDeletedAction] = useState<boolean>(false)

  // Effects
  useEffect(() => {

    // No project specified: go back to the projects list
    if (router.isReady === true && projectPublicId == null) {
      router.replace('/project')
    }
  }, [router, projectPublicId])

  useEffect(() => {

    // Populate the form once a project is selected
    if (project != null) {
      setValues({
        name: project.name,
        tagline: project.tagline ?? '',
        description: project.description ?? '',
        website: project.website ?? '',
        image: project.image ?? '',
        techStack: project.techStack != null ?
          project.techStack.join(', ') :
          '',
        stage: project.stage ?? '',
        isOpenToCollaborators: project.isOpenToCollaborators === true,
        isPromoted: project.isPromoted === true,
        isPublic: project.isPublic === true
      })
    }

  }, [project])

  useEffect(() => {

    if (updatedAction === true) {
      // Redirect to the viewer's projects once updated
      window.location.href = '/project'
    }

  }, [updatedAction])

  useEffect(() => {

    if (deletedAction === true) {
      // Redirect to the viewer's projects once deleted
      window.location.href = '/project'
    }

  }, [deletedAction])

  // Functions
  function onFieldChange(field: keyof ProjectFormValues, value: string | boolean) {

    setValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  function onSubmit(submitValues?: ProjectFormValues): { status: 'ok' | 'error'; message: string } {

    const v = submitValues ?? values

    if (submitValues != null) {
      setValues(submitValues)
    }

    if (v.name.trim() === '') {
      setAlertSeverity('error')
      setMessage(`Name is required`)
      return { status: 'error', message: `Name is required` }
    }

    setAlertSeverity(undefined)
    setMessage(undefined)
    setUpdateAction(true)

    return { status: 'ok', message: `Updating project "${v.name.trim()}"` }
  }

  function onDelete() {

    setAlertSeverity(undefined)
    setMessage(undefined)
    setDeleteAction(true)
  }

  // WebMCP
  useWebMcpTools(() => [
    updateProjectTool({
      hasProject: () => project != null,
      getValues: () => valuesRef.current,
      onSubmit: (submitValues) => onSubmit(submitValues)
    })
  ])

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Edit project`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          {project != null && project.isOwner !== true ?
            <div>
              <Typography
                style={{ marginBottom: '0.5em' }}
                variant='h3'>
                Project not found
              </Typography>
              <Typography variant='body1'>
                This project doesn&apos;t exist or you don&apos;t own it.
              </Typography>
            </div>
            :
            <></>
          }

          {project != null && project.isOwner === true ?
            <>
              <Typography
                style={{ marginBottom: '1em' }}
                variant='h3'>
                Edit project
              </Typography>

              <ProjectForm
                title=''
                values={values}
                onChange={onFieldChange}
                onSubmit={onSubmit}
                submitLabel='Save changes'
                saving={updateAction}
                alertSeverity={alertSeverity}
                message={message} />

              <div style={{ marginTop: '2em' }}>
                <Typography
                  style={{ marginBottom: '0.5em' }}
                  variant='h6'>
                  Danger zone
                </Typography>
                <Button
                  disabled={deleteAction}
                  onClick={onDelete}
                  variant='outlined'
                  color='error'>
                  Delete this project
                </Button>
              </div>
            </>
            :
            <></>
          }

          {project == null && notFound === true ?
            <div>
              <Typography
                style={{ marginBottom: '0.5em' }}
                variant='h3'>
                Project not found
              </Typography>
              <Typography variant='body1'>
                This project doesn&apos;t exist or you don&apos;t own it.
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

      {projectPublicId != null ?
        <LoadProjectByPublicId
          publicId={projectPublicId}
          userProfileId={userProfile.id}
          setProject={setProject}
          setNotFound={setNotFound} />
        :
        <></>
      }

      {project != null && project.isOwner === true ?
        <>
          <UpdateProject
            id={project.id}
            userProfileId={userProfile.id}
            name={values.name}
            tagline={values.tagline}
            description={values.description}
            website={values.website}
            image={values.image}
            isPromoted={values.isPromoted}
            isPublic={values.isPublic}
            techStack={values.techStack.split(',').map(tech => tech.trim()).filter(tech => tech !== '')}
            stage={values.stage}
            isOpenToCollaborators={values.isOpenToCollaborators}
            updateAction={updateAction}
            setUpdateAction={setUpdateAction}
            setAlertSeverity={setAlertSeverity}
            setMessage={setMessage}
            setUpdatedAction={setUpdatedAction} />

          <DeleteProject
            id={project.id}
            userProfileId={userProfile.id}
            deleteAction={deleteAction}
            setDeleteAction={setDeleteAction}
            setAlertSeverity={setAlertSeverity}
            setMessage={setMessage}
            setDeletedAction={setDeletedAction} />
        </>
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