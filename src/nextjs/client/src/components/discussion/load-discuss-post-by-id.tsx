import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getDiscussPostByPublicIdQuery } from '@/apollo/discussion'
import type { DiscussPostItem } from '@/types/client-only-types'

interface PostResults {
  status: boolean
  message?: string | null
  post?: DiscussPostItem | null
}

interface Props {
  publicId: string
  setPost: (post: DiscussPostItem | undefined) => void
  setNotFound: (notFound: boolean) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
}

export default function LoadDiscussPostByPublicId({
  publicId,
  setPost,
  setNotFound,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const { refetch: fetchGetDiscussPostByPublicIdQuery } =
    useQuery<{ getDiscussPostByPublicId: PostResults }>(
      getDiscussPostByPublicIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getPost() {

    // Query
    const { data } = await
      fetchGetDiscussPostByPublicIdQuery({
        publicId: publicId
      })

    if (data == null) {
      setPost(undefined)
      setNotFound(true)
      return
    }

    const results = data.getDiscussPostByPublicId

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

    // Return early if no post public id
    if (publicId == null || publicId === '') {
      return
    }

    const fetchData = async () => {
      await getPost()
        .catch(console.error)
    }

    fetchData()

  }, [publicId])

  // Render
  return (
    <></>
  )
}
