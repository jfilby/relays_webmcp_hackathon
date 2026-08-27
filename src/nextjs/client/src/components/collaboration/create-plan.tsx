import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation } from '@apollo/client/react'
import { createPlanMutation } from '@/apollo/collaboration'

interface CreatePlanResult {
  status: boolean
  message: string
}

interface Props {
  userProfileId: string
  projectId?: string
  title?: string
  description?: string
  targetProfileId?: string
  rolesNeededText?: string
  commitmentLevel?: string
  compensation?: string
  deliverables?: string
  startByDate?: string
  createAction: boolean
  setCreateAction: (value: boolean) => void
  setAlertSeverity: (severity: 'success' | 'error' | undefined) => void
  setMessage: (message: string | undefined) => void
  setCreatedAction: (value: boolean) => void
}

export default function CreatePlan({
  userProfileId,
  projectId,
  title,
  description,
  targetProfileId,
  rolesNeededText,
  commitmentLevel,
  compensation,
  deliverables,
  startByDate,
  createAction,
  setCreateAction,
  setAlertSeverity,
  setMessage,
  setCreatedAction
}: Props) {

  // GraphQL
  const [sendCreatePlanMutation] =
    useMutation<{
      createPlan: CreatePlanResult
    }>(createPlanMutation, {
      fetchPolicy: 'no-cache'
    })

  // Functions
  async function createPlan() {

    // Convert comma-separated roles into a list, and a date input value into an ISO string
    const rolesNeeded = (rolesNeededText ?? '')
      .split(',')
      .map(role => role.trim())
      .filter(role => role !== '')

    const startBy = startByDate != null && startByDate !== '' ?
      new Date(startByDate).toISOString() :
      null

    // Mutation
    let createdData: CreatePlanResult | undefined

    await sendCreatePlanMutation({
      variables: {
        userProfileId: userProfileId,
        projectId: projectId,
        title: title,
        description: description != null && description !== '' ? description : null,
        targetProfileId: targetProfileId != null && targetProfileId !== '' ? targetProfileId : null,
        rolesNeeded: rolesNeeded.length > 0 ? rolesNeeded : null,
        commitmentLevel: commitmentLevel != null && commitmentLevel !== '' ? commitmentLevel : null,
        compensation: compensation != null && compensation !== '' ? compensation : null,
        deliverables: deliverables != null && deliverables !== '' ? deliverables : null,
        startBy: startBy
      }
    }).then(result => createdData = result.data?.createPlan)

    // Get results and set fields
    if (createdData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to create the plan`)
    } else if (createdData.status === true) {
      setAlertSeverity('success')
      setMessage(createdData.message)
      toast(createdData.message)
      setCreatedAction(true)
    } else {
      setAlertSeverity('error')
      setMessage(createdData.message)
    }

    // Done
    setCreateAction(false)
  }

  // Effects
  useEffect(() => {

    // Return early if no save action requested
    if (createAction !== true) {
      return
    }

    const fetchData = async () => {
      await createPlan()
        .catch(console.error)
    }

    fetchData()

  }, [createAction])

  // Render
  return (
    <>
      <Toaster />
    </>
  )
}
