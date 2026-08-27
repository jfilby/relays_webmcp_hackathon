import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getCollaborationPlanByIdQuery } from '@/apollo/collaboration'
import type { CollaborationPlanItem } from '@/types/client-only-types'

interface PlanResults {
  status: boolean
  message?: string | null
  plan?: CollaborationPlanItem | null
}

interface Props {
  id: string
  setPlan: (plan: CollaborationPlanItem | undefined) => void
  setNotFound: (notFound: boolean) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
}

export default function LoadPlanById({
  id,
  setPlan,
  setNotFound,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const { refetch: fetchGetCollaborationPlanByIdQuery } =
    useQuery<{ getCollaborationPlanById: PlanResults }>(
      getCollaborationPlanByIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getPlan() {

    // Query
    const { data } = await
      fetchGetCollaborationPlanByIdQuery({
        id: id
      })

    if (data == null) {
      setPlan(undefined)
      setNotFound(true)
      return
    }

    const results = data.getCollaborationPlanById

    if (results.status === true) {
      setPlan(results.plan ?? undefined)
      setNotFound(false)
    } else {
      setPlan(undefined)
      setNotFound(true)
      if (setAlertSeverity != null && setMessage != null) {
        setAlertSeverity('error')
        setMessage(results.message ?? undefined)
      }
    }
  }

  // Effects
  useEffect(() => {

    const fetchData = async () => {
      await getPlan()
    }

    // Return early if no plan id
    if (id == null || id === '') {
      return
    }

    // Async call
    const result = fetchData()
      .catch(console.error)

  }, [id])

  // Render
  return (
    <></>
  )
}
