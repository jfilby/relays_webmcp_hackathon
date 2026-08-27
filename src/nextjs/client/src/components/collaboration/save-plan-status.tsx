import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation, useQuery } from '@apollo/client/react'
import { getCollaborationPlanByIdQuery, setPlanStatusMutation } from '@/apollo/collaboration'
import type { CollaborationPlanItem } from '@/types/client-only-types'

interface StatusAndMessage {
  status: boolean
  message: string
}

interface PlanResults {
  status: boolean
  message?: string | null
  plan?: CollaborationPlanItem | null
}

interface Props {
  userProfileId: string
  planId?: string
  status?: string
  saveStatusAction: boolean
  setSaveStatusAction: (value: boolean) => void
  setPlan: (plan: CollaborationPlanItem | undefined) => void
  setAlertSeverity: (severity: 'success' | 'error' | undefined) => void
  setMessage: (message: string | undefined) => void
}

export default function SavePlanStatus({
  userProfileId,
  planId,
  status,
  saveStatusAction,
  setSaveStatusAction,
  setPlan,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const [sendSetPlanStatusMutation] =
    useMutation<{
      setPlanStatus: StatusAndMessage
    }>(setPlanStatusMutation, {
      fetchPolicy: 'no-cache'
    })

  const { refetch: fetchGetCollaborationPlanByIdQuery } =
    useQuery<{ getCollaborationPlanById: PlanResults }>(
      getCollaborationPlanByIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function saveStatus() {

    // Mutation
    let savedData: StatusAndMessage | undefined

    await sendSetPlanStatusMutation({
      variables: {
        id: planId,
        userProfileId: userProfileId,
        status: status
      }
    }).then(result => savedData = result.data?.setPlanStatus)

    // Get results and surface messages
    if (savedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to update the plan status`)
    } else if (savedData.status === true) {
      setAlertSeverity('success')
      setMessage(savedData.message)
      toast(savedData.message)
    } else {
      setAlertSeverity('error')
      setMessage(savedData.message)
    }

    // Refresh the plan so the new status shows
    const { data } = await
      fetchGetCollaborationPlanByIdQuery({
        id: planId
      })

    if (data != null && data.getCollaborationPlanById.status === true) {
      setPlan(data.getCollaborationPlanById.plan ?? undefined)
    }

    // Done
    setSaveStatusAction(false)
  }

  // Effects
  useEffect(() => {

    // Return early if no save action requested
    if (saveStatusAction !== true) {
      return
    }

    const fetchData = async () => {
      await saveStatus()
        .catch(console.error)
    }

    fetchData()

  }, [saveStatusAction])

  // Render
  return (
    <>
      <Toaster />
    </>
  )
}
