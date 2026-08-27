import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getPostsByProfileIdQuery } from '@/apollo/posts'
import type { PostItem } from '@/types/client-only-types'

interface PostsResults {
  status: boolean
  message?: string | null
  posts?: PostItem[] | null
}

interface Props {
  profileId: string
  reloadToken?: number
  setPosts: (posts: PostItem[]) => void
}

export default function LoadPostsByProfileId({
  profileId,
  reloadToken,
  setPosts
}: Props) {

  // GraphQL
  const { refetch: fetchGetPostsByProfileIdQuery } =
    useQuery<{ getPostsByProfileId: PostsResults }>(
      getPostsByProfileIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getPosts() {

    // Query
    const { data } = await
      fetchGetPostsByProfileIdQuery({
        profileId: profileId
      })

    if (data == null) {
      setPosts([])
      return
    }

    const results = data.getPostsByProfileId

    if (results.status === true) {
      setPosts(results.posts ?? [])
    } else {
      setPosts([])
    }
  }

  // Effects
  useEffect(() => {

    const fetchData = async () => {
      await getPosts()
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
