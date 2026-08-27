import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getEndorsementsByProfileIdQuery } from '@/apollo/profiles'
import type { Endorsement } from '@/types/client-only-types'

interface EndorsementsResults {
  status: boolean
  message?: string | null
  endorsements?: Endorsement[] | null
}

interface Props {
  profileId: string
  setEndorsements: (endorsements: Endorsement[]) => void
}

export default function LoadEndorsementsByProfileId({
  profileId,
  setEndorsements
}: Props) {

  // GraphQL
  const { refetch: fetchGetEndorsementsByProfileIdQuery } =
    useQuery<{ getEndorsementsByProfileId: EndorsementsResults }>(
      getEndorsementsByProfileIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getEndorsements() {

    // Query
    const { data } = await
      fetchGetEndorsementsByProfileIdQuery({
        profileId: profileId
      })

    if (data == null) {
      setEndorsements([])
      return
    }

    const results = data.getEndorsementsByProfileId

    if (results.status === true) {
      setEndorsements(results.endorsements ?? [])
    } else {
      setEndorsements([])
    }
  }

  // Effects
  useEffect(() => {

    const fetchData = async () => {
      await getEndorsements()
    }

    // Async call
    fetchData()
      .catch(console.error)

  }, [profileId])

  // Render
  return (
    <></>
  )
}
