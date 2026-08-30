import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { searchDiscussPostsQuery } from '@/apollo/discussion'
import type { DiscussPostItem } from '@/types/client-only-types'

interface PostsResults {
  status: boolean
  message?: string | null
  posts?: DiscussPostItem[] | null
}

interface Props {
  search: string
  setPosts: (posts: DiscussPostItem[] | undefined) => void
  setAlertSeverity: (severity: 'success' | 'error' | undefined) => void
  setMessage: (message: string | undefined) => void
  loadAction: boolean
  setLoadAction: (value: boolean) => void
}

export default function SearchDiscussPosts({
  search,
  setPosts,
  setAlertSeverity,
  setMessage,
  loadAction,
  setLoadAction
}: Props) {

  // GraphQL
  const { refetch: fetchSearchDiscussPostsQuery } =
    useQuery<{ searchDiscussPosts: PostsResults }>(
      searchDiscussPostsQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function searchPosts() {

    // Query
    const { data } = await
      fetchSearchDiscussPostsQuery({
        search: search
      })

    if (data == null) {
      setAlertSeverity('error')
      setMessage(`Failed to search posts`)
      setLoadAction(false)
      return
    }

    const results = data.searchDiscussPosts

    if (results.status === true) {
      setPosts(results.posts ?? [])
    } else {
      setAlertSeverity('error')
      setMessage(results.message ?? undefined)
    }

    setLoadAction(false)
  }

  // Effects
  useEffect(() => {

    const fetchData = async () => {
      await searchPosts()
    }

    // Return early if no load requested
    if (loadAction === false) {
      return
    }

    // Async call
    const result = fetchData()
      .catch(console.error)

  }, [loadAction])

  // Render
  return (
    <></>
  )
}
