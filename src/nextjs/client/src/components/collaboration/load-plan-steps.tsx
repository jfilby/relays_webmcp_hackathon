import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getPlanStepsByPlanIdQuery } from '@/apollo/collaboration'
import type { PlanStepItem } from '@/types/client-only-types'

interface StepsResults {
  status: boolean
  message?: string | null
  steps?: PlanStepItem[] | null
}

interface Props {
  planId: string
  setSteps: (steps: PlanStepItem[] | undefined) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
}

export default function LoadPlanSteps({
  planId,
  setSteps,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const { refetch: fetchGetPlanStepsByPlanIdQuery } =
    useQuery<{ getPlanStepsByPlanId: StepsResults }>(
      getPlanStepsByPlanIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getSteps() {

    // Query
    const { data } = await
      fetchGetPlanStepsByPlanIdQuery({
        planId: planId
      })

    if (data == null) {
      setSteps(undefined)
      return
    }

    const results = data.getPlanStepsByPlanId

    if (results.status === true) {
      setSteps(results.steps ?? [])
    } else {
      setSteps(undefined)
      if (setAlertSeverity != null && setMessage != null) {
        setAlertSeverity('error')
        setMessage(results.message ?? undefined)
      }
    }
  }


  // Effects
  useEffect(() => {

    const fetchData = async () => {
      await getSteps()
    }

    // Return early if no plan id
    if (planId == null || planId === '') {
      return
    }

    // Async call
    const result = fetchData()
      .catch(console.error)

  }, [planId])

  // Render
  return (
    <></>
  )
}
