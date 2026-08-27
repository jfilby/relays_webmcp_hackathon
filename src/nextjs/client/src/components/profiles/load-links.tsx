import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getProfileLinksByProfileIdQuery } from '@/apollo/profiles'
import type { ProfileLink } from '@/types/client-only-types'

interface LinksResults {
  status: boolean
  message?: string | null
  links?: ProfileLink[] | null
}

interface Props {
  profileId: string
  setLinks: (links: ProfileLink[]) => void
}

export default function LoadLinksByProfileId({
  profileId,
  setLinks
}: Props) {

  // GraphQL
  const { refetch: fetchGetProfileLinksByProfileIdQuery } =
    useQuery<{ getProfileLinksByProfileId: LinksResults }>(
      getProfileLinksByProfileIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getLinks() {

    // Query
    const { data } = await
      fetchGetProfileLinksByProfileIdQuery({
        profileId: profileId
      })

    if (data == null) {
      setLinks([])
      return
    }

    const results = data.getProfileLinksByProfileId

    if (results.status === true) {
      setLinks(results.links ?? [])
    } else {
      setLinks([])
    }
  }

  // Effects
  useEffect(() => {

    const fetchData = async () => {
      await getLinks()
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
