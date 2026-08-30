import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import { Button, Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadProjectsByUserProfileId from '@/components/projects/load-by-user-profile-id'
import ProjectForm, { ProjectFormValues } from '@/components/projects/project-form'
import UpdateProject from '@/components/projects/update'
import DeleteProject from '@/components/projects/delete'
import type { Project, UserProfile } from '@/types/client-only-types'
import { useWebMcpTools } from '@/webmcp/webmcp'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

export default function EditProjectPage({
  userProfile
}: Props) {

  // State
  const [projects, setProjects] = useState<Project[] | undefined>(undefined)
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

  // Functions
  function onProjectChange(event: React.ChangeEvent<HTMLSelectElement>) {

    const projectId = event.target.value

    const found = (projects ?? []).find(project => project.id === projectId)

    setProject(found ?? undefined)
    setAlertSeverity(undefined)
    setMessage(undefined)
  }

  // Effects
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
  useWebMcpTools([
    {
      name: 'update_project',
      title: 'Update project',
      description: `Update the selected project by submitting the Edit project form with the given field values. Fields not provided keep their current values. On success the page redirects to the viewer's projects list.`,
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: `Project name. Required.`
          },
          tagline: {
            type: 'string',
            description: `Short tagline for the project.`
          },
          description: {
            type: 'string',
            description: `Longer description of the project.`
          },
          website: {
            type: 'string',
            description: `Project website URL.`
          },
          imageUrl: {
            type: 'string',
            description: `URL of the project image.`
          },
          technologies: {
            type: 'string',
            description: `Comma-separated list of technologies, e.g. "React, Node.js".`
          },
          stage: {
            type: 'string',
            enum: ['I', 'A', 'B', 'G'],
            description: `Project stage: I for Idea, A for Alpha, B for Beta, G for Generally available.`
          },
          isOpenToCollaborators: {
            type: 'boolean',
            description: `Whether the project is open to collaborators.`
          },
          isPromoted: {
            type: 'boolean',
            description: `Whether the project is showcased on Relays.`
          },
          isPublic: {
            type: 'boolean',
            description: `Whether the project is public.`
          }
        },
        required: ['name']
      },
      execute: (args) => {

        if (project == null) {
          throw new Error(`Select a project to edit first`)
        }

        const sanitizedArgs: Partial<ProjectFormValues> = {}

        if (typeof args.name === 'string') {
          sanitizedArgs.name = args.name
        }
        if (typeof args.tagline === 'string') {
          sanitizedArgs.tagline = args.tagline
        }
        if (typeof args.description === 'string') {
          sanitizedArgs.description = args.description
        }
        if (typeof args.website === 'string') {
          sanitizedArgs.website = args.website
        }
        if (typeof args.imageUrl === 'string') {
          sanitizedArgs.image = args.imageUrl
        }
        if (typeof args.technologies === 'string') {
          sanitizedArgs.techStack = args.technologies
        }
        if (typeof args.stage === 'string' && ['I', 'A', 'B', 'G'].includes(args.stage)) {
          sanitizedArgs.stage = args.stage
        }
        if (typeof args.isOpenToCollaborators === 'boolean') {
          sanitizedArgs.isOpenToCollaborators = args.isOpenToCollaborators
        }
        if (typeof args.isPromoted === 'boolean') {
          sanitizedArgs.isPromoted = args.isPromoted
        }
        if (typeof args.isPublic === 'boolean') {
          sanitizedArgs.isPublic = args.isPublic
        }

        const result = onSubmit({ ...valuesRef.current, ...sanitizedArgs })

        if (result.status === 'error') {
          throw new Error(result.message)
        }

        return result.message
      }
    }
  ])

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Edit project`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          {notFound === true && (projects == null || projects.length === 0) ?
            <div>
              <Typography
                style={{ marginBottom: '0.5em' }}
                variant='h3'>
                No projects to edit
              </Typography>
              <Typography
                style={{ marginBottom: '1em' }}
                variant='body1'>
                You don&apos;t own any projects yet.
              </Typography>

              <Button
                onClick={() => window.location.href = '/project/add'}
                variant='contained'>
                Create a project
              </Button>
            </div>
            :
            <></>
          }

          {projects != null && projects.length > 0 ?
            <>
              <Typography
                style={{ marginBottom: '0.5em' }}
                variant='h3'>
                Edit project
              </Typography>

              <Typography
                style={{ marginBottom: '1em' }}
                variant='body1'>
                Select a project to edit.
              </Typography>

              <div style={{ marginBottom: '1em' }}>
                <select
                  onChange={onProjectChange}
                  style={{ minWidth: '20em', padding: '0.5em' }}
                  value={project?.id ?? ''}>
                  <option value=''>
                    Select a project...
                  </option>
                  {projects.map(project => (
                    <option
                      key={project.id}
                      value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {project != null ?
                <ProjectForm
                  title=''
                  values={values}
                  onChange={onFieldChange}
                  onSubmit={onSubmit}
                  submitLabel='Save changes'
                  saving={updateAction}
                  alertSeverity={alertSeverity}
                  message={message} />
                :
                <></>
              }

              {project != null ?
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
                :
                <></>
              }
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

      {project != null ?
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