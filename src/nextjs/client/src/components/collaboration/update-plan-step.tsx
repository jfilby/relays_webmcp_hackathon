import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation, useQuery } from '@apollo/client/react'
import { getPlanStepsByPlanIdQuery, updatePlanStepMutation } from '@/apollo/collaboration'
import type { PlanStepItem } from '@/types/client-only-types'

interface StatusAndMessage {
  status: boolean
  message: string
}

interface StepsResults {
  status: boolean
  message?: string | null
  steps?: PlanStepItem[] | null
}

interface Props {
  userProfileId: string
  planId?: string
  stepId?: string
  stepStatus?: string
  updateStepAction: boolean
  setUpdateStepAction: (value: boolean) => void
  setSteps: (steps: PlanStepItem[] | undefined) => void
  setAlertSeverity: (severity: 'success' | 'error' | undefined) => void
  setMessage: (message: string | undefined) => void
}

export default function UpdatePlanStep({
  userProfileId,
  planId,
  stepId,
  stepStatus,
  updateStepAction,
  setUpdateStepAction,
  setSteps,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const [sendUpdatePlanStepMutation] =
    useMutation<{
      updatePlanStep: StatusAndMessage
    }>(updatePlanStepMutation, {
      fetchPolicy: 'no-cache'
    })

  const { refetch: fetchGetPlanStepsByPlanIdQuery } =
    useQuery<{ getPlanStepsByPlanId: StepsResults }>(
      getPlanStepsByPlanIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function updateStep() {

    // Mutation
    let updatedData: StatusAndMessage | undefined

    await sendUpdatePlanStepMutation({
      variables: {
        id: stepId,
        userProfileId: userProfileId,
        status: stepStatus
      }
    }).then(result => updatedData = result.data?.updatePlanStep)

    // Get results and surface messages
    if (updatedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to update the step`)
    } else if (updatedData.status === true) {
      setAlertSeverity('success')
      setMessage(updatedData.message)
      toast(updatedData.message)
    } else {
      setAlertSeverity('error')
      setMessage(updatedData.message)
    }

    // Refresh the step list
    const { data } = await
      fetchGetPlanStepsByPlanIdQuery({
        planId: planId
      })

    if (data != null && data.getPlanStepsByPlanId.status === true) {
      setSteps(data.getPlanStepsByPlanId.steps ?? [])
    }

    // Done
    setUpdateStepAction(false)
  }

  // Effects
  useEffect(() => {

    // Return early if no update action requested
    if (updateStepAction !== true) {
      return
    }

    const fetchData = async () => {
      await updateStep()
        .catch(console.error)
    }

    fetchData()

  }, [updateStepAction])

  // Render
  return (
    <>
      <Toaster />
    </>
  )
}
