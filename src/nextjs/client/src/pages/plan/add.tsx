import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Button, Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import PlanForm, { PlanFormValues } from '@/components/collaboration/plan-form'
import CreatePlan from '@/components/collaboration/create-plan'
import LoadProjectsByUserProfileId from '@/components/projects/load-by-user-profile-id'
import LoadNetwork from '@/components/profiles/load-network'
import type { Profile, Project, UserProfile } from '@/types/client-only-types'
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

  function onSubmit() {

    if (values.title.trim() === '') {
      setAlertSeverity('error')
      setMessage(`Title is required`)
      return
    }

    if (values.projectId === '') {
      setAlertSeverity('error')
      setMessage(`Select one of your projects for this plan`)
      return
    }

    setAlertSeverity(undefined)
    setMessage(undefined)
    setCreateAction(true)
  }

  // Effects
  useEffect(() => {

    if (createdAction === true) {
      // Redirect to the plans list once created
      window.location.href = '/plans'
    }

  }, [createdAction])

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
