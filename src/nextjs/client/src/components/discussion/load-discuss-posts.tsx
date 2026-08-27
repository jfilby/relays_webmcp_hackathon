import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getDiscussPostsQuery } from '@/apollo/discussion'
import type { DiscussPostItem } from '@/types/client-only-types'

interface PostsResults {
  status: boolean
  message?: string | null
  posts?: DiscussPostItem[] | null
}

interface Props {
  // Optional filters: author profile and/or the project the posts are
  // attached to. Without both, all active posts load.
  profileId?: string
  projectId?: string
  // Bump this number to make the loader refetch (e.g. after a post is
  // created or deleted)
  refreshToken?: number
  setPosts: (posts: DiscussPostItem[] | undefined) => void
  setNotFound?: (notFound: boolean) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
}

export default function LoadDiscussPosts({
  profileId,
  projectId,
  refreshToken,
  setNotFound,
  setAlertSeverity,
  setMessage,
  setPosts
}: Props) {

  // GraphQL
  const { refetch: fetchGetDiscussPostsQuery } =
    useQuery<{ getDiscussPosts: PostsResults }>(
      getDiscussPostsQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getPosts() {

    // Query
    const { data } = await
      fetchGetDiscussPostsQuery({
        variables: {
          profileId: profileId,
          projectId: projectId
        }
      })

    if (data == null) {
      setPosts(undefined)

      if (setNotFound != null) {
        setNotFound(true)
      }

      return
    }

    const results = data.getDiscussPosts

    if (results.status === true) {
      setPosts(results.posts ?? [])

      if (setNotFound != null) {
        setNotFound(false)
      }
    } else {
      setPosts(undefined)

      if (setNotFound != null) {
        setNotFound(true)
      }

      if (setAlertSeverity != null && setMessage != null) {
        setAlertSeverity('error')
        setMessage(results.message ?? undefined)
      }
    }
  }

  // Effects
  useEffect(() => {

    const fetchData = async () => {
      await getPosts()
        .catch(console.error)
    }

    fetchData()

  }, [profileId, projectId, refreshToken])

  // Render
  return (
    <></>
  )
}
