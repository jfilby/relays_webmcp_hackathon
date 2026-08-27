import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getDiscussPostByIdQuery } from '@/apollo/discussion'
import type { DiscussPostItem } from '@/types/client-only-types'

interface PostResults {
  status: boolean
  message?: string | null
  post?: DiscussPostItem | null
}

interface Props {
  postId: string
  setPost: (post: DiscussPostItem | undefined) => void
  setNotFound: (notFound: boolean) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
}

export default function LoadDiscussPostById({
  postId,
  setPost,
  setNotFound,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const { refetch: fetchGetDiscussPostByIdQuery } =
    useQuery<{ getDiscussPostById: PostResults }>(
      getDiscussPostByIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getPost() {

    // Query
    const { data } = await
      fetchGetDiscussPostByIdQuery({
        id: postId
      })

    if (data == null) {
      setPost(undefined)
      setNotFound(true)
      return
    }

    const results = data.getDiscussPostById

    if (results.status === true && results.post != null) {
      setPost(results.post)
      setNotFound(false)
    } else {
      setPost(undefined)
      setNotFound(true)
      if (setAlertSeverity != null && setMessage != null) {
        setAlertSeverity('error')
        setMessage(results.message ?? undefined)
      }
    }
  }

  // Effects
  useEffect(() => {

    // Return early if no post id
    if (postId == null || postId === '') {
      return
    }

    const fetchData = async () => {
      await getPost()
        .catch(console.error)
    }

    fetchData()

  }, [postId])

  // Render
  return (
    <></>
  )
}
