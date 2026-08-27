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
}

interface DeleteDiscussPostArgs {
  userProfileId: string
  id: string
}

interface CreateDiscussCommentArgs {
  userProfileId: string
  postId: string
  body: string
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

  // Query
  return discussionQueryService.getDiscussPosts(
    prisma)
}

export async function getDiscussPostById(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { id } = args as unknown as { id: string }

  // Query
  return discussionQueryService.getDiscussPostById(
    prisma,
    id)
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
    body
  } = args as unknown as CreateDiscussPostArgs

  // Mutation
  return discussionMutateService.createDiscussPost(
    prisma,
    userProfileId,
    title,
    body)
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
    body
  } = args as unknown as CreateDiscussCommentArgs

  // Mutation
  return discussionMutateService.createDiscussComment(
    prisma,
    userProfileId,
    postId,
    body)
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
