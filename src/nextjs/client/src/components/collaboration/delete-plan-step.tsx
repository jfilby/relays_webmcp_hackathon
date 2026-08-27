import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation, useQuery } from '@apollo/client/react'
import { deletePlanStepMutation, getPlanStepsByPlanIdQuery } from '@/apollo/collaboration'
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
  deleteStepAction: boolean
  setDeleteStepAction: (value: boolean) => void
  setSteps: (steps: PlanStepItem[] | undefined) => void
  setAlertSeverity: (severity: 'success' | 'error' | undefined) => void
  setMessage: (message: string | undefined) => void
}

export default function DeletePlanStep({
  userProfileId,
  planId,
  stepId,
  deleteStepAction,
  setDeleteStepAction,
  setSteps,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const [sendDeletePlanStepMutation] =
    useMutation<{
      deletePlanStep: StatusAndMessage
    }>(deletePlanStepMutation, {
      fetchPolicy: 'no-cache'
    })

  const { refetch: fetchGetPlanStepsByPlanIdQuery } =
    useQuery<{ getPlanStepsByPlanId: StepsResults }>(
      getPlanStepsByPlanIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function deleteStep() {

    // Mutation
    let deletedData: StatusAndMessage | undefined

    await sendDeletePlanStepMutation({
      variables: {
        id: stepId,
        userProfileId: userProfileId
      }
    }).then(result => deletedData = result.data?.deletePlanStep)

    // Get results and surface messages
    if (deletedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to delete the step`)
    } else if (deletedData.status === true) {
      setAlertSeverity('success')
      setMessage(deletedData.message)
      toast(deletedData.message)
    } else {
      setAlertSeverity('error')
      setMessage(deletedData.message)
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
    setDeleteStepAction(false)
  }

  // Effects
  useEffect(() => {

    // Return early if no delete action requested
    if (deleteStepAction !== true) {
      return
    }

    const fetchData = async () => {
      await deleteStep()
        .catch(console.error)
    }

    fetchData()

  }, [deleteStepAction])

  // Render
  return (
    <>
      <Toaster />
    </>
  )
}
