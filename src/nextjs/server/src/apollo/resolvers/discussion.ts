import { prisma } from '@/db'
import { DiscussionQueryService } from '@/services/discussion/query-service'
import { DiscussionMutateService } from '@/services/discussion/mutate-service'

// Services
const discussionQueryService = new DiscussionQueryService()
const discussionMutateService = new DiscussionMutateService()

// GraphQL args are schema-validated before the resolver runs
interface CreateDiscussPostArgs {
  userProfileId: string
  title: string
  body: string
  projectId?: string | null
}

interface DeleteDiscussPostArgs {
  userProfileId: string
  id: string
}

interface CreateDiscussCommentArgs {
  userProfileId: string
  postId: string
  body: string
  parentCommentId?: string
}

interface DeleteDiscussCommentArgs {
  userProfileId: string
  id: string
}

// Code
export async function getDiscussPosts(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { profileId, projectId } = args as unknown as {
    profileId?: string | null
    projectId?: string | null
  }

  // Query
  return discussionQueryService.getDiscussPosts(
    prisma,
    profileId ?? undefined,
    projectId ?? undefined)
}

export async function getDiscussPostByPublicId(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { publicId } = args as unknown as { publicId: string }

  // Query
  return discussionQueryService.getDiscussPostByPublicId(
    prisma,
    publicId)
}

export async function getDiscussCommentsByPostId(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { postId } = args as unknown as { postId: string }

  // Query
  return discussionQueryService.getDiscussCommentsByPostId(
    prisma,
    postId)
}

export async function createDiscussPost(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId,
    title,
    body,
    projectId
  } = args as unknown as CreateDiscussPostArgs

  // Mutation
  return discussionMutateService.createDiscussPost(
    prisma,
    userProfileId,
    title,
    body,
    projectId ?? undefined)
}

export async function deleteDiscussPost(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { userProfileId, id } = args as unknown as DeleteDiscussPostArgs

  // Mutation
  return discussionMutateService.deleteDiscussPost(
    prisma,
    userProfileId,
    id)
}

export async function createDiscussComment(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId,
    postId,
    body,
    parentCommentId
  } = args as unknown as CreateDiscussCommentArgs

  // Mutation
  return discussionMutateService.createDiscussComment(
    prisma,
    userProfileId,
    postId,
    body,
    parentCommentId)
}

export async function deleteDiscussComment(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { userProfileId, id } = args as unknown as DeleteDiscussCommentArgs

  // Mutation
  return discussionMutateService.deleteDiscussComment(
    prisma,
    userProfileId,
    id)
}
