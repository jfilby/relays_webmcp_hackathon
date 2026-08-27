import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation, useQuery } from '@apollo/client/react'
import { addPlanStepMutation, getPlanStepsByPlanIdQuery } from '@/apollo/collaboration'
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
  title?: string
  description?: string
  addStepAction: boolean
  setAddStepAction: (value: boolean) => void
  setSteps: (steps: PlanStepItem[] | undefined) => void
  setAlertSeverity: (severity: 'success' | 'error' | undefined) => void
  setMessage: (message: string | undefined) => void
}

export default function AddPlanStep({
  userProfileId,
  planId,
  title,
  description,
  addStepAction,
  setAddStepAction,
  setSteps,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const [sendAddPlanStepMutation] =
    useMutation<{
      addPlanStep: StatusAndMessage
    }>(addPlanStepMutation, {
      fetchPolicy: 'no-cache'
    })

  const { refetch: fetchGetPlanStepsByPlanIdQuery } =
    useQuery<{ getPlanStepsByPlanId: StepsResults }>(
      getPlanStepsByPlanIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function addStep() {

    // Mutation
    let addedData: StatusAndMessage | undefined

    await sendAddPlanStepMutation({
      variables: {
        userProfileId: userProfileId,
        planId: planId,
        title: title ?? '',
        description: description != null && description !== '' ? description : null
      }
    }).then(result => addedData = result.data?.addPlanStep)

    // Get results and surface messages
    if (addedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to add the step`)
    } else if (addedData.status === true) {
      setAlertSeverity('success')
      setMessage(addedData.message)
      toast(addedData.message)
    } else {
      setAlertSeverity('error')
      setMessage(addedData.message)
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
    setAddStepAction(false)
  }

  // Effects
  useEffect(() => {

    // Return early if no add action requested
    if (addStepAction !== true) {
      return
    }

    const fetchData = async () => {
      await addStep()
        .catch(console.error)
    }

    fetchData()

  }, [addStepAction])

  // Render
  return (
    <>
      <Toaster />
    </>
  )
}
