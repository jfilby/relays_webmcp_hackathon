import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Typography } from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadPlanById from '@/components/collaboration/load-plan-by-id'
import LoadPlanSteps from '@/components/collaboration/load-plan-steps'
import LoadProfileByUserProfileId from '@/components/profiles/load-by-user-profile-id'
import SavePlanStatus from '@/components/collaboration/save-plan-status'
import AddPlanStep from '@/components/collaboration/add-plan-step'
import UpdatePlanStep from '@/components/collaboration/update-plan-step'
import DeletePlanStep from '@/components/collaboration/delete-plan-step'
import PlanDetail from '@/components/collaboration/plan-detail'
import { useWebMcpTools } from '@/webmcp/webmcp'
import type {
  CollaborationPlanItem,
  PlanStepItem,
  Profile,
  UserProfile
} from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

export default function PlanPage({
  userProfile
}: Props) {

  // Router
  const router = useRouter()
  const planId = typeof router.query.planId === 'string' ?
    router.query.planId :
    undefined

  // State
  const [plan, setPlan] = useState<CollaborationPlanItem | undefined>(undefined)
  const [steps, setSteps] = useState<PlanStepItem[] | undefined>(undefined)
  const [viewerProfile, setViewerProfile] = useState<Profile | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)

  const [statusValue, setStatusValue] = useState<string | undefined>(undefined)
  const [saveStatusAction, setSaveStatusAction] = useState<boolean>(false)

  const [newStepTitle, setNewStepTitle] = useState<string>('')
  const [newStepDescription, setNewStepDescription] = useState<string>('')
  const [addStepAction, setAddStepAction] = useState<boolean>(false)

  const [updateStepId, setUpdateStepId] = useState<string | undefined>(undefined)
  const [updateStepStatus, setUpdateStepStatus] = useState<string | undefined>(undefined)
  const [updateStepAction, setUpdateStepAction] = useState<boolean>(false)

  const [deleteStepId, setDeleteStepId] = useState<string | undefined>(undefined)
  const [deleteStepAction, setDeleteStepAction] = useState<boolean>(false)

  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  // Vars
  const signedIn = userProfile.id != null && userProfile.id !== ''
  const isCreator = plan != null && viewerProfile != null &&
    plan.createdByProfileId === viewerProfile.id
  const isTarget = plan != null && viewerProfile != null &&
    plan.targetProfileId === viewerProfile.id

  // Functions
  function onSaveStatus(status: string) {

    setStatusValue(status)
    setSaveStatusAction(true)
  }

  function onAddStep(title: string, description: string) {

    setNewStepTitle(title)
    setNewStepDescription(description)
    setAddStepAction(true)
  }

  function onUpdateStepStatus(stepId: string, status: string) {

    setUpdateStepId(stepId)
    setUpdateStepStatus(status)
    setUpdateStepAction(true)
  }

  function onDeleteStep(stepId: string) {

    setDeleteStepId(stepId)
    setDeleteStepAction(true)
  }

  // WebMCP
  useWebMcpTools([
    {
      name: 'add_plan_step',
      title: 'Add plan step',
      description: `Add a new step to this collaboration plan. The step is saved and appears in the plan's steps list.`,
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: `Short title for the step.`
          },
          description: {
            type: 'string',
            description: `What the step involves. Optional.`
          }
        },
        required: ['title']
      },
      execute: (args) => {

        if (!isCreator) {
          throw new Error(`Only the plan creator can add steps`)
        }

        const title = typeof args.title === 'string' ? args.title.trim() : ''
        const description = typeof args.description === 'string' ? args.description.trim() : ''

        if (title === '') {
          throw new Error(`Step title is required`)
        }

        onAddStep(title, description)

        return `Adding step "${title}" to the plan`
      }
    },
    {
      name: 'set_plan_step_status',
      title: 'Set plan step status',
      description: `Set the status of one of this plan's steps, the same as changing the step's status select as the plan creator.`,
      inputSchema: {
        type: 'object',
        properties: {
          stepId: {
            type: 'string',
            description: `ID of the step to update.`
          },
          status: {
            type: 'string',
            enum: ['P', 'A', 'C', 'X'],
            description: `Step status: P for pending, A for active, C for completed, X for skipped.`
          }
        },
        required: ['stepId', 'status']
      },
      execute: (args) => {

        if (!isCreator) {
          throw new Error(`Only the plan creator can update step statuses`)
        }

        const stepId = typeof args.stepId === 'string' ? args.stepId : ''
        const status = typeof args.status === 'string' ? args.status : ''

        const step = (steps ?? []).find(candidate => candidate.id === stepId)

        if (step == null) {
          throw new Error(`No step found with id "${stepId}"`)
        }

        onUpdateStepStatus(stepId, status)

        return `Setting step "${step.title}" to ${status}`
      }
    }
  ])
  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Plan`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          {userProfile.id == null || userProfile.id === '' ?
            <Typography variant='body1'>
              Sign in to see this plan.
            </Typography>
            :
            <>
              {notFound === true ?
                <div>
                  <Typography
                    style={{ marginBottom: '0.5em' }}
                    variant='h3'>
                    Plan not found
                  </Typography>
                  <Typography variant='body1'>
                    This plan doesn&apos;t exist or isn&apos;t visible to you.
                  </Typography>
                </div>
                :
                <></>
              }

              {plan != null ?
                <PlanDetail
                  isCreator={isCreator}
                  isTarget={isTarget}
                  onAddStep={onAddStep}
                  onDeleteStep={onDeleteStep}
                  onSaveStatus={onSaveStatus}
                  onUpdateStepStatus={onUpdateStepStatus}
                  plan={plan}
                  steps={steps ?? []} />
                :
                <></>
              }

              {plan == null && notFound === false ?
                <Typography variant='body1'>
                  Loading..
                </Typography>
                :
                <></>
              }
            </>
          }
        </div>
      </Layout>

      {signedIn && planId != null ?
        <>
          <LoadPlanById
            id={planId}
            setAlertSeverity={setAlertSeverity}
            setMessage={setMessage}
            setNotFound={setNotFound}
            setPlan={setPlan} />

          <LoadPlanSteps
            planId={planId}
            setAlertSeverity={setAlertSeverity}
            setMessage={setMessage}
            setSteps={setSteps} />

          <LoadProfileByUserProfileId
            userProfileId={userProfile.id ?? ''}
            setProfile={setViewerProfile} />

          <SavePlanStatus
            planId={planId}
            saveStatusAction={saveStatusAction}
            setAlertSeverity={setAlertSeverity}
            setMessage={setMessage}
            setPlan={setPlan}
            setSaveStatusAction={setSaveStatusAction}
            status={statusValue}
            userProfileId={userProfile.id ?? ''} />

          <AddPlanStep
            addStepAction={addStepAction}
            description={newStepDescription}
            planId={planId}
            setAddStepAction={setAddStepAction}
            setAlertSeverity={setAlertSeverity}
            setMessage={setMessage}
            setSteps={setSteps}
            title={newStepTitle}
            userProfileId={userProfile.id ?? ''} />

          <UpdatePlanStep
            planId={planId}
            setAlertSeverity={setAlertSeverity}
            setMessage={setMessage}
            setSteps={setSteps}
            setUpdateStepAction={setUpdateStepAction}
            stepId={updateStepId}
            stepStatus={updateStepStatus}
            updateStepAction={updateStepAction}
            userProfileId={userProfile.id ?? ''} />

          <DeletePlanStep
            deleteStepAction={deleteStepAction}
            planId={planId}
            setAlertSeverity={setAlertSeverity}
            setDeleteStepAction={setDeleteStepAction}
            setMessage={setMessage}
            setSteps={setSteps}
            stepId={deleteStepId}
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
