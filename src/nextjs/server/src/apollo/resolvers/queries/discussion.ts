import { prisma } from '@/db'
import { DiscussionQueryService } from '@/services/discussion/query-service'

// Services
const discussionQueryService = new DiscussionQueryService()

// GraphQL args are schema-validated before the resolver runs
interface GetDiscussPostsArgs {
  profileId?: string | null
  projectId?: string | null
}

interface GetDiscussPostByPublicIdArgs {
  publicId: string
}

interface GetDiscussCommentsByPostIdArgs {
  postId: string
}

// Code
export async function getDiscussPosts(
  _parent: unknown,
  { profileId, projectId }: GetDiscussPostsArgs) {

  // Query
  return discussionQueryService.getDiscussPosts(
    prisma,
    profileId ?? undefined,
    projectId ?? undefined)
}

export async function getDiscussPostByPublicId(
  _parent: unknown,
  { publicId }: GetDiscussPostByPublicIdArgs) {

  // Query
  return discussionQueryService.getDiscussPostByPublicId(
    prisma,
    publicId)
}

export async function getDiscussCommentsByPostId(
  _parent: unknown,
  { postId }: GetDiscussCommentsByPostIdArgs) {

  // Query
  return discussionQueryService.getDiscussCommentsByPostId(
    prisma,
    postId)
}
