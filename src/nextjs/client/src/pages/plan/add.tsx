import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import { Button, Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import PlanForm, { PlanFormValues } from '@/components/collaboration/plan-form'
import CreatePlan from '@/components/collaboration/create-plan'
import LoadProjectsByUserProfileId from '@/components/projects/load-by-user-profile-id'
import LoadNetwork from '@/components/profiles/load-network'
import type { Profile, Project, UserProfile } from '@/types/client-only-types'
import { useWebMcpTools } from '@/webmcp/webmcp'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

export default function AddPlanPage({
  userProfile
}: Props) {

  // State
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsNotFound, setProjectsNotFound] = useState<boolean>(false)
  const [networkProfiles, setNetworkProfiles] = useState<Profile[] | undefined>(undefined)
  const [networkProfilesNotFound, setNetworkProfilesNotFound] = useState<boolean>(false)
  const [values, setValues] = useState<PlanFormValues>({
    projectId: '',
    title: '',
    description: '',
    rolesNeeded: '',
    commitmentLevel: '',
    compensation: '',
    deliverables: '',
    startBy: '',
    targetProfileId: ''
  })

  const valuesRef = useRef<PlanFormValues>(values)
  valuesRef.current = values

  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  const [createAction, setCreateAction] = useState<boolean>(false)
  const [createdAction, setCreatedAction] = useState<boolean>(false)

  // Functions
  function onFieldChange(field: keyof PlanFormValues, value: string) {

    setValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  function onSubmit(submitValues?: PlanFormValues): { status: 'ok' | 'error'; message: string } {

    const v = submitValues ?? values

    if (submitValues != null) {
      setValues(submitValues)
    }

    if (v.title.trim() === '') {
      setAlertSeverity('error')
      setMessage(`Title is required`)
      return { status: 'error', message: `Title is required` }
    }

    if (v.projectId === '') {
      setAlertSeverity('error')
      setMessage(`Select one of your projects for this plan`)
      return { status: 'error', message: `Select one of your projects for this plan` }
    }

    setAlertSeverity(undefined)
    setMessage(undefined)
    setCreateAction(true)

    return { status: 'ok', message: `Creating plan "${v.title.trim()}"` }
  }

  // Effects
  useEffect(() => {

    if (createdAction === true) {
      // Redirect to the plans list once created
      window.location.href = '/plans'
    }

  }, [createdAction])

  // WebMCP
  useWebMcpTools([
    {
      name: 'create_plan',
      title: 'Create a plan',
      description: `Fill in and submit the create-plan form. Creates a collaboration plan on one of your projects; on success the page redirects to the plans list.`,
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: `ID of one of your projects to create the plan on.`
          },
          title: {
            type: 'string',
            description: `Short title for the plan.`
          },
          description: {
            type: 'string',
            description: `Longer description of the collaboration you're offering.`
          },
          rolesNeeded: {
            type: 'string',
            description: `Comma-separated roles needed, e.g. "frontend developer, designer".`
          },
          commitmentLevel: {
            type: 'string',
            enum: ['', 'H', 'W', 'M'],
            description: `Commitment: H for a few hours per week, W for weeks, M for months. Empty to leave unspecified.`
          },
          compensation: {
            type: 'string',
            enum: ['', 'N', 'E', 'P'],
            description: `Compensation: N for none, E for equity, P for paid. Empty to leave unspecified.`
          },
          deliverables: {
            type: 'string',
            description: `Expected deliverables for the collaboration.`
          },
          startBy: {
            type: 'string',
            description: `Earliest start date as an ISO date string (YYYY-MM-DD).`
          },
          targetProfile: {
            type: 'string',
            description: `Profile ID of the network member to target with this plan. Omit or pass empty to leave it open to anyone in your network.`
          }
        },
        required: ['projectId', 'title']
      },
      execute: (args) => {

        const sanitized: Partial<PlanFormValues> = {}

        const stringFields: Array<keyof PlanFormValues> = [
          'projectId',
          'title',
          'description',
          'rolesNeeded',
          'commitmentLevel',
          'compensation',
          'deliverables',
          'startBy'
        ]

        for (const field of stringFields) {
          const value = args[field]
          if (typeof value === 'string') {
            sanitized[field] = value
          }
        }

        if (typeof args.targetProfile === 'string') {
          sanitized.targetProfileId = args.targetProfile
        }

        const result = onSubmit({ ...valuesRef.current, ...sanitized })

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
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Create a plan`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          {userProfile.id == null || userProfile.id === '' ?
            <Typography variant='body1'>
              Sign in to create a plan.
            </Typography>
            :
            <>
              {projects.length > 0 ?
                <PlanForm
                  alertSeverity={alertSeverity}
                  message={message}
                  networkProfiles={networkProfiles ?? []}
                  onChange={onFieldChange}
                  onSubmit={onSubmit}
                  projects={projects}
                  saving={createAction}
                  submitLabel='Create'
                  values={values} />
                :
                <>
                  {projectsNotFound ?
                    <div>
                      <Typography variant='body1'>
                        You need to own at least one project before you can create a plan.
                      </Typography>
                      <div style={{ marginTop: '1em' }}>
                        <Button
                          onClick={() => window.location.href = '/project/add'}
                          variant='outlined'>
                          Create a project first
                        </Button>
                      </div>
                    </div>
                    :
                    <></>
                  }
                </>
              }
            </>
          }
        </div>
      </Layout>

      {userProfile.id != null && userProfile.id !== '' ?
        <>
          <LoadProjectsByUserProfileId
            userProfileId={userProfile.id ?? ''}
            viewerUserProfileId={userProfile.id ?? undefined}
            setProjects={setProjects}
            setNotFound={setProjectsNotFound}
            setAlertSeverity={setAlertSeverity}
            setMessage={setMessage} />

          <LoadNetwork
            userProfileId={userProfile.id ?? ''}
            setProfiles={setNetworkProfiles}
            setNotFound={setNetworkProfilesNotFound}
            setAlertSeverity={setAlertSeverity}
            setMessage={setMessage} />

          <CreatePlan
            compensation={values.compensation}
            createAction={createAction}
            deliverables={values.deliverables}
            description={values.description}
            projectId={values.projectId}
            rolesNeededText={values.rolesNeeded}
            setAlertSeverity={setAlertSeverity}
            setCreateAction={setCreateAction}
            setCreatedAction={setCreatedAction}
            setMessage={setMessage}
            startByDate={values.startBy}
            targetProfileId={values.targetProfileId}
            title={values.title}
            userProfileId={userProfile.id ?? ''} />
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
    {})
}
