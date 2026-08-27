import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { getDiscussCommentsByPostIdQuery } from '@/apollo/discussion'
import type { DiscussCommentItem } from '@/types/client-only-types'

interface CommentsResults {
  status: boolean
  message?: string | null
  comments?: DiscussCommentItem[] | null
}

interface Props {
  postId: string
  setComments: (comments: DiscussCommentItem[] | undefined) => void
  setNotFound: (notFound: boolean) => void
  setAlertSeverity?: (severity: 'success' | 'error' | undefined) => void
  setMessage?: (message: string | undefined) => void
}

export default function LoadDiscussCommentsByPostId({
  postId,
  setComments,
  setNotFound,
  setAlertSeverity,
  setMessage
}: Props) {

  // GraphQL
  const { refetch: fetchGetDiscussCommentsByPostIdQuery } =
    useQuery<{ getDiscussCommentsByPostId: CommentsResults }>(
      getDiscussCommentsByPostIdQuery, {
        fetchPolicy: 'no-cache',
        skip: true
      })

  // Functions
  async function getComments() {

    // Query
    const { data } = await
      fetchGetDiscussCommentsByPostIdQuery({
        postId: postId
      })

    if (data == null) {
      setComments(undefined)
      setNotFound(true)
      return
    }

    const results = data.getDiscussCommentsByPostId

    if (results.status === true) {
      setComments(results.comments ?? [])
      setNotFound(false)
    } else {
      setComments(undefined)
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
      await getComments()
        .catch(console.error)
    }

    fetchData()

  }, [postId])

  // Render
  return (
    <></>
  )
}
