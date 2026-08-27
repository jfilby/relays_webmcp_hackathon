import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { useMutation, useQuery } from '@apollo/client/react'
import { getIncomingConnectionRequestsQuery, respondToConnectionRequestMutation } from '@/apollo/connections'
import type { IncomingConnectionRequest } from '@/types/client-only-types'

interface RequestsResults {
  status: boolean
  message?: string | null
  requests?: IncomingConnectionRequest[] | null
}

interface RespondResult {
  status: boolean
  message: string
}

interface Props {
  userProfileId: string
  respondConnectionId?: string
  response?: string
  respondAction: boolean
  setRespondAction: (value: boolean) => void
  setRespondingTo: (value: string | undefined) => void
  setRequests: (requests: IncomingConnectionRequest[] | undefined) => void
  setAlertSeverity: (severity: 'success' | 'error' | undefined) => void
  setMessage: (message: string | undefined) => void
}

export default function LoadConnectionRequests({
  userProfileId,
  respondConnectionId,
  response,
  respondAction,
  setRespondAction,
  setRespondingTo,
  setRequests,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const { refetch: fetchGetIncomingConnectionRequestsQuery } =
    useQuery<{ getIncomingConnectionRequests: RequestsResults }>(
      getIncomingConnectionRequestsQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  const [sendRespondToConnectionRequestMutation] =
    useMutation<{
      respondToConnectionRequest: RespondResult
    }>(respondToConnectionRequestMutation, {
      fetchPolicy: 'no-cache'
    })

  // Functions
  async function getRequests() {

    // Query
    const { data } = await
      fetchGetIncomingConnectionRequestsQuery({
        userProfileId: userProfileId
      })

    if (data == null) {
      setRequests(undefined)
      return
    }

    const results = data.getIncomingConnectionRequests

    if (results.status === true) {
      setRequests(results.requests ?? [])
    } else {
      setRequests(undefined)
      setAlertSeverity('error')
      setMessage(results.message ?? undefined)
    }
  }

  async function respondToConnectionRequest() {

    // Mutation
    let respondedData: RespondResult | undefined

    await sendRespondToConnectionRequestMutation({
      variables: {
        userProfileId: userProfileId,
        connectionId: respondConnectionId,
        response: response
      }
    }).then(result => respondedData = result.data?.respondToConnectionRequest)

    // Get results and surface messages
    if (respondedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to respond to the connection request`)
    } else if (respondedData.status === true) {
      setAlertSeverity('success')
      setMessage(respondedData.message)
      toast(respondedData.message)
    } else {
      setAlertSeverity('error')
      setMessage(respondedData.message)
    }

    // Refresh the pending requests list
    await getRequests()

    // Done
    setRespondingTo(undefined)
    setRespondAction(false)
  }

  // Effects
  useEffect(() => {

    const fetchData = async () => {
      await getRequests()
    }

    // Return early if no signed-in user id
    if (userProfileId == null || userProfileId === '') {
      return
    }

    // Async call
    const result = fetchData()
      .catch(console.error)

  }, [])

  useEffect(() => {

    // Return early if no respond action requested
    if (respondAction !== true) {
      return
    }

    const fetchData = async () => {
      await respondToConnectionRequest()
        .catch(console.error)
    }

    fetchData()

  }, [respondAction])

  // Render
  return (
    <>
      <Toaster />
    </>
  )
}
