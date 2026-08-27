import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { searchCollaborationPlansQuery } from '@/apollo/collaboration'
import type { CollaborationPlanItem } from '@/types/client-only-types'

interface PlansResults {
  status: boolean
  message?: string | null
  plans?: CollaborationPlanItem[] | null
}

interface Props {
  userProfileId: string
  setPlans: (plans: CollaborationPlanItem[] | undefined) => void
  setNotFound: (notFound: boolean) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
}

export default function LoadPlansByUserProfileId({
  userProfileId,
  setPlans,
  setNotFound,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const { refetch: fetchSearchCollaborationPlansQuery } =
    useQuery<{ searchCollaborationPlans: PlansResults }>(
      searchCollaborationPlansQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getPlans() {

    // Query
    const { data } = await
      fetchSearchCollaborationPlansQuery({
        projectId: null,
        userProfileId: userProfileId
      })

    if (data == null) {
      setPlans(undefined)
      setNotFound(true)
      return
    }

    const results = data.searchCollaborationPlans

    if (results.status === true) {
      setPlans(results.plans ?? [])
      setNotFound(false)
    } else {
      setPlans(undefined)
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
      await getPlans()
    }

    // Return early if no signed-in user id
    if (userProfileId == null || userProfileId === '') {
      return
    }

    // Async call
    const result = fetchData()
      .catch(console.error)

  }, [])

  // Render
  return (
    <></>
  )
}
