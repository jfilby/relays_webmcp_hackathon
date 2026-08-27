import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getPostsByProjectIdQuery } from '@/apollo/posts'
import type { PostItem } from '@/types/client-only-types'

interface ProjectPostsResults {
  status: boolean
  message?: string | null
  posts?: PostItem[] | null
}

interface Props {
  projectId: string
  setPosts: (posts: PostItem[] | undefined) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
  // Bump this number to make the loader refetch (e.g. after a post is created or deleted)
  refreshToken?: number
}

export default function LoadPostsByProjectId({
  projectId,
  setPosts,
  setAlertSeverity,
  setMessage,
  refreshToken
}: Props) {

  // GraphQL
  const { refetch: fetchGetPostsByProjectIdQuery } =
    useQuery<{ getPostsByProjectId: ProjectPostsResults }>(
      getPostsByProjectIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getPosts() {

    // Query
    const { data } = await
      fetchGetPostsByProjectIdQuery({
        projectId: projectId
      })

    if (data == null) {
      setPosts(undefined)
      return
    }

    const results = data.getPostsByProjectId

    if (results.status === true) {
      setPosts(results.posts ?? [])
    } else {
      setPosts(undefined)
      if (setAlertSeverity != null && setMessage != null) {
        setAlertSeverity('error')
        setMessage(results.message ?? undefined)
      }
    }
  }

  // Effects
  useEffect(() => {

    if (projectId == null || projectId === '') {
      return
    }

    const fetchData = async () => {
      await getPosts()
        .catch(console.error)
    }

    fetchData()

  }, [projectId, refreshToken])

  // Render
  return (
    <></>
  )
}
