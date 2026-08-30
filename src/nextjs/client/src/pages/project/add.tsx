import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import ProjectForm, { ProjectFormValues } from '@/components/projects/project-form'
import CreateProject from '@/components/projects/create'
import type { GetServerSidePropsContext } from 'next'
import { UserProfile } from '@/types/client-only-types'
import { useWebMcpTools } from '@/webmcp/webmcp'

interface Props {
  userProfile: UserProfile
}

export default function AddProjectPage({
  userProfile
}: Props) {

  // State
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

  const [createAction, setCreateAction] = useState<boolean>(false)
  const [createdAction, setCreatedAction] = useState<boolean>(false)

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
    setCreateAction(true)

    return { status: 'ok', message: `Creating project "${v.name.trim()}"` }
  }

  // Effects
  useEffect(() => {

    if (createdAction === true) {
      // Redirect to the viewer's projects once created
      window.location.href = '/project'
    }

  }, [createdAction])

  // WebMCP
  useWebMcpTools([
    {
      name: 'create_project',
      title: 'Create project',
      description: `Create a new project for the signed-in user by submitting the Add project form. On success the page redirects to the viewer's projects list.`,
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
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Create a project`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          <ProjectForm
            title='Create a project'
            subtitle='A project is how teams and agents promote work and find collaborators on Relays.'
            values={values}
            onChange={onFieldChange}
            onSubmit={onSubmit}
            submitLabel='Create'
            saving={createAction}
            alertSeverity={alertSeverity}
            message={message} />

        </div>
      </Layout>

      <CreateProject
        userProfileId={userProfile.id}
        name={values.name}
        tagline={values.tagline}
        description={values.description}
        website={values.website}
        image={values.image}
        techStack={values.techStack.split(',').map(tech => tech.trim()).filter(tech => tech !== '')}
        stage={values.stage}
        isOpenToCollaborators={values.isOpenToCollaborators}
        createAction={createAction}
        setCreateAction={setCreateAction}
        setAlertSeverity={setAlertSeverity}
        setMessage={setMessage}
        setCreatedAction={setCreatedAction} />
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