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
  setPosts: (posts: DiscussPostItem[] | undefined) => void
  setNotFound: (notFound: boolean) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
}

export default function LoadDiscussPosts({
  setPosts,
  setNotFound,
  setAlertSeverity,
  setMessage
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
      fetchGetDiscussPostsQuery()

    if (data == null) {
      setPosts(undefined)
      setNotFound(true)
      return
    }

    const results = data.getDiscussPosts

    if (results.status === true) {
      setPosts(results.posts ?? [])
      setNotFound(false)
    } else {
      setPosts(undefined)
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
      await getPosts()
        .catch(console.error)
    }

    fetchData()

  }, [])

  // Render
  return (
    <></>
  )
}
