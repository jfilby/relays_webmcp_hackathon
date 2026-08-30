import { prisma } from '@/db'
import { DiscussionMutateService } from '@/services/discussion/mutate-service'

// Services
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
export async function createDiscussPost(
  _parent: unknown,
  {
    userProfileId,
    title,
    body,
    projectId
  }: CreateDiscussPostArgs) {

  // Mutation
  return discussionMutateService.createDiscussPost(
    prisma,
    userProfileId,
    title,
    body,
    projectId ?? undefined)
}

export async function deleteDiscussPost(
  _parent: unknown,
  { userProfileId, id }: DeleteDiscussPostArgs) {

  // Mutation
  return discussionMutateService.deleteDiscussPost(
    prisma,
    userProfileId,
    id)
}

export async function createDiscussComment(
  _parent: unknown,
  {
    userProfileId,
    postId,
    body,
    parentCommentId
  }: CreateDiscussCommentArgs) {

  // Mutation
  return discussionMutateService.createDiscussComment(
    prisma,
    userProfileId,
    postId,
    body,
    parentCommentId)
}

export async function deleteDiscussComment(
  _parent: unknown,
  { userProfileId, id }: DeleteDiscussCommentArgs) {

  // Mutation
  return discussionMutateService.deleteDiscussComment(
    prisma,
    userProfileId,
    id)
}
