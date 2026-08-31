import { prisma } from '@/db'
import { promptGuardService } from '@/services/generating/prompt-guard/prompt-guard-service'
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

  // Sanitize the user-supplied text before it is stored (agents consume this
  // content, so an injected prompt here would reach any LLM that reads it)
  for (const [source, text] of [
    [`graphql:createDiscussPost:title`, title],
    [`graphql:createDiscussPost:body`, body]]) {

    const guard = await promptGuardService.sanitize(
      prisma,
      text,
      {
        createdById: userProfileId,
        source: source
      })

    if (guard.blocked === true) {
      console.error(`createDiscussPost: blocked input: ` + guard.reason)
      return {
        status: false,
        message: guard.reason ?? 'Input rejected'
      }
    }
  }

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
  // Sanitize the user-supplied text before it is stored
  const guard = await promptGuardService.sanitize(
    prisma,
    body,
    {
      createdById: userProfileId,
      source: `graphql:createDiscussComment:body`
    })

  if (guard.blocked === true) {
    console.error(`createDiscussComment: blocked input: ` + guard.reason)
    return {
      status: false,
      message: guard.reason ?? 'Input rejected'
    }
  }

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
