import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getSkillsByProfileIdQuery } from '@/apollo/profiles'
import type { ProfileSkill } from '@/types/client-only-types'

interface SkillsResults {
  status: boolean
  message?: string | null
  skills?: ProfileSkill[] | null
}

interface Props {
  profileId: string
  reloadToken?: number
  setSkills: (skills: ProfileSkill[]) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
}

export default function LoadSkillsByProfileId({
  profileId,
  reloadToken,
  setSkills,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const { refetch: fetchGetSkillsByProfileIdQuery } =
    useQuery<{ getSkillsByProfileId: SkillsResults }>(
      getSkillsByProfileIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getSkills() {

    // Query
    const { data } = await
      fetchGetSkillsByProfileIdQuery({
        profileId: profileId
      })

    if (data == null) {
      setSkills([])
      return
    }

    const results = data.getSkillsByProfileId

    if (results.status === true) {
      setSkills(results.skills ?? [])
    } else {
      setSkills([])
      if (setAlertSeverity != null && setMessage != null) {
        setAlertSeverity('error')
        setMessage(results.message ?? undefined)
      }
    }
  }

  // Effects
  useEffect(() => {

    const fetchData = async () => {
      await getSkills()
    }

    // Async call
    fetchData()
      .catch(console.error)

  }, [profileId, reloadToken])

  // Render
  return (
    <></>
  )
}
