import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getLatestActivityQuery } from '@/apollo/activity'
import type { Project, DiscussPostItem } from '@/types/client-only-types'

// A latest-activity comment: a comment plus the parent post's public id and
// title so the viewer can jump to the thread.
export interface LatestCommentItem {
  id: string
  publicId?: string
  postId: string
  postPublicId?: string | null
  postTitle?: string | null
  parentCommentId?: string | null
  authorProfileId: string
  authorName?: string | null
  authorProfilePublicId?: string | null
  authorProfileIsPublic?: boolean | null
  body: string
  created: string
  deleted?: string | null
}

export interface LatestActivity {
  projects: Project[]
  posts: DiscussPostItem[]
  comments: LatestCommentItem[]
}

interface LatestActivityResults {
  status: boolean
  message?: string | null
  projects?: Project[] | null
  posts?: DiscussPostItem[] | null
  comments?: LatestCommentItem[] | null
}

interface Props {
  userProfileId?: string
  take?: number
  setLatestActivity: (activity: LatestActivity | undefined) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
}

export default function LoadLatestActivity({
  userProfileId,
  take,
  setAlertSeverity,
  setMessage,
  setLatestActivity
}: Props) {

  // GraphQL
  const { refetch: fetchGetLatestActivityQuery } =
    useQuery<{ getLatestActivity: LatestActivityResults }>(
      getLatestActivityQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getLatestActivity() {

    // Query
    const { data } = await
      fetchGetLatestActivityQuery({
        userProfileId: userProfileId,
        take: take
      })

    if (data == null) {
      setAlertSeverity?.('error')
      setMessage?.(`Failed to load latest activity`)
      setLatestActivity(undefined)
      return
    }

    const results = data.getLatestActivity

    if (results.status === true) {
      setLatestActivity({
        projects: results.projects ?? [],
        posts: results.posts ?? [],
        comments: results.comments ?? []
      })
    } else {
      setAlertSeverity?.('error')
      setMessage?.(results.message ?? undefined)
      setLatestActivity(undefined)
    }
  }

  // Effects
  useEffect(() => {

    const fetchData = async () => {
      await getLatestActivity()
    }

    // Async call
    const result = fetchData()
      .catch(console.error)

  }, [userProfileId])

  // Render
  return (
    <></>
  )
}
