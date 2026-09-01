//
// Evals for the discussion WebMCP tools: search_discuss_posts,
// create_discuss_post, add_discuss_comment and add_discuss_reply.
//
import {
  check,
  checkDeepEqual,
  checkEqual,
  checkThrows,
  evals
} from './harness'
import {
  addDiscussCommentTool,
  addDiscussReplyTool,
  createDiscussPostTool,
  deleteDiscussCommentTool,
  deleteDiscussPostTool,
  flagDiscussCommentTool,
  flagDiscussPostTool,
  searchDiscussPostsTool
} from '../tools/discuss'
import type { DiscussCommentItem } from '@/types/client-only-types'

evals('discuss: search_discuss_posts runs the search with the query', () => {

  const searches: string[] = []

  const tool = searchDiscussPostsTool({
    onSearch: (query) => {
      searches.push(query)
    }
  })

  checkEqual(tool.name, 'search_discuss_posts', 'tool name')

  const result = tool.execute({ query: '  webmcp  ' })

  checkEqual(result, `Searching discussion posts matching "webmcp"`, 'return message')
  checkDeepEqual(searches, ['  webmcp  '], 'search calls')
})

evals('discuss: search_discuss_posts defaults to listing all posts', () => {

  const searches: string[] = []

  const tool = searchDiscussPostsTool({
    onSearch: (query) => {
      searches.push(query)
    }
  })

  const result = tool.execute({})

  checkEqual(result, `Searching discussion posts`, 'return message')
  checkDeepEqual(searches, [''], 'empty query lists all')
})

evals('discuss: create_discuss_post requires sign-in', async () => {

  const tool = createDiscussPostTool({
    isSignedIn: () => false,
    getValues: () => ({ title: '', body: '' }),
    onSubmit: () => ({ status: 'ok', message: '' })
  })

  await checkThrows(() => tool.execute({ title: 'T', body: 'B' }), `Sign in to start a discussion`, 'signed-out should throw')
})

evals('discuss: create_discuss_post submits title and body', () => {

  const submitted: Array<{ title: string; body: string }> = []

  const tool = createDiscussPostTool({
    isSignedIn: () => true,
    getValues: () => ({ title: 'Draft', body: 'Draft body' }),
    onSubmit: (submitValues) => {

      submitted.push(submitValues!)

      return { status: 'ok', message: `Posting your discussion "Hello"` }
    }
  })

  checkEqual(tool.name, 'create_discuss_post', 'tool name')
  checkDeepEqual(tool.inputSchema.required, ['title', 'body'], 'required fields')

  const result = tool.execute({ title: 'Hello', body: 'World' })

  checkEqual(result, `Posting your discussion "Hello"`, 'return message from submit')
  checkDeepEqual(submitted, [{ title: 'Hello', body: 'World' }], 'submitted values')
})

evals('discuss: create_discuss_post surfaces validation errors', async () => {

  const tool = createDiscussPostTool({
    isSignedIn: () => true,
    getValues: () => ({ title: '', body: '' }),
    onSubmit: () => ({ status: 'error', message: `Title is required` })
  })

  await checkThrows(() => tool.execute({ title: '', body: 'B' }), `Title is required`, 'missing title should throw')
})

evals('discuss: add_discuss_comment requires sign-in and submits body', async () => {

  const submitted: Array<{ body: string }> = []

  const tool = addDiscussCommentTool({
    isSignedIn: () => true,
    getValues: () => ({ body: '' }),
    onComment: (submitValues) => {

      submitted.push(submitValues!)

      return { status: 'ok', message: `Comment posted` }
    }
  })

  checkEqual(tool.name, 'add_discuss_comment', 'tool name')

  const result = tool.execute({ body: 'Nice post' })

  checkEqual(result, `Comment posted`, 'return message from submit')
  checkDeepEqual(submitted, [{ body: 'Nice post' }], 'submitted body')

  const signedOutTool = addDiscussCommentTool({
    isSignedIn: () => false,
    getValues: () => ({ body: '' }),
    onComment: () => ({ status: 'ok', message: '' })
  })

  await checkThrows(() => signedOutTool.execute({ body: 'x' }), `Sign in to comment`, 'signed-out should throw')
})

evals('discuss: add_discuss_reply requires an open reply target', async () => {

  const replied: Array<{ commentId: string; body: string }> = []

  const tool = addDiscussReplyTool({
    isSignedIn: () => true,
    getReplyTarget: () => undefined,
    onReplySubmit: (commentId, submitValues) => {

      replied.push({ commentId, body: submitValues!.body })

      return { status: 'ok', message: `Reply posted` }
    }
  })

  checkEqual(tool.name, 'add_discuss_reply', 'tool name')

  await checkThrows(() => tool.execute({ body: 'x' }), `No reply target is open`, 'no open target should throw')

  const openTool = addDiscussReplyTool({
    isSignedIn: () => true,
    getReplyTarget: () => 'comment-42',
    onReplySubmit: (commentId, submitValues) => {

      replied.push({ commentId, body: submitValues!.body })

      return { status: 'ok', message: `Reply posted` }
    }
  })

  const result = await openTool.execute({ body: 'Me too' })

  checkEqual(result, `Reply posted`, 'return message from submit')
  checkDeepEqual(replied, [{ commentId: 'comment-42', body: 'Me too' }], 'reply routed to open target')
})

evals('discuss: reply tool checks sign-in before the reply target', async () => {

  const tool = addDiscussReplyTool({
    isSignedIn: () => false,
    getReplyTarget: () => 'comment-42',
    onReplySubmit: () => ({ status: 'ok', message: '' })
  })

  await checkThrows(() => tool.execute({ body: 'x' }), `Sign in to reply`, 'sign-in checked first')
})

const comment = (overrides: Partial<DiscussCommentItem>): DiscussCommentItem => ({
  id: 'c1',
  postId: 'p1',
  authorProfileId: 'prof-1',
  body: 'Hello',
  created: '2026-01-01T00:00:00Z',
  ...overrides
})

const commentDeps = (comments: DiscussCommentItem[]) => ({
  isSignedIn: () => true,
  viewerProfileId: () => 'me',
  getComments: () => comments
})

evals('discuss: delete_discuss_post requires sign-in and authorship', async () => {

  let deleted = 0

  const tool = deleteDiscussPostTool({
    isSignedIn: () => true,
    isAuthor: () => true,
    onDeletePost: () => {

      deleted++

      return { status: 'ok', message: `Deleting your post` }
    }
  })

  checkEqual(tool.name, 'delete_discuss_post', 'tool name')

  const result = await tool.execute({})

  checkEqual(result, `Deleting your post`, 'return message from delete')
  checkEqual(deleted, 1, 'delete called once')

  const signedOut = deleteDiscussPostTool({
    isSignedIn: () => false,
    isAuthor: () => true,
    onDeletePost: () => ({ status: 'ok', message: '' })
  })

  await checkThrows(() => signedOut.execute({}), `Sign in to delete this post`, 'signed-out should throw')

  const notAuthor = deleteDiscussPostTool({
    isSignedIn: () => true,
    isAuthor: () => false,
    onDeletePost: () => ({ status: 'ok', message: '' })
  })

  await checkThrows(() => notAuthor.execute({}), `Only the post author can delete`, 'non-author should throw')
})

evals('discuss: flag_discuss_post rejects the author and submits otherwise', async () => {

  let flagged = 0

  const tool = flagDiscussPostTool({
    isSignedIn: () => true,
    canFlag: () => true,
    onFlagPost: () => {

      flagged++

      return { status: 'ok', message: `Flagging this post for review` }
    }
  })

  checkEqual(tool.name, 'flag_discuss_post', 'tool name')

  const result = await tool.execute({})

  checkEqual(result, `Flagging this post for review`, 'return message from flag')
  checkEqual(flagged, 1, 'flag called once')

  const ownPost = flagDiscussPostTool({
    isSignedIn: () => true,
    canFlag: () => false,
    onFlagPost: () => ({ status: 'ok', message: '' })
  })

  await checkThrows(() => ownPost.execute({}), `You cannot flag your own post`, 'author should throw')

  const signedOut = flagDiscussPostTool({
    isSignedIn: () => false,
    canFlag: () => true,
    onFlagPost: () => ({ status: 'ok', message: '' })
  })

  await checkThrows(() => signedOut.execute({}), `Sign in to flag this post`, 'signed-out should throw')
})

evals('discuss: delete_discuss_comment resolves by page position', async () => {

  const deletedIds: string[] = []

  const comments = [
    comment({ id: 'c-a', authorProfileId: 'me' }),
    comment({ id: 'c-b', authorProfileId: 'someone-else' }),
    comment({ id: 'c-c', authorProfileId: 'me' })
  ]

  const tool = deleteDiscussCommentTool({
    ...commentDeps(comments),
    onDeleteComment: (commentId) => {

      deletedIds.push(commentId)

      return { status: 'ok', message: `Deleting your comment` }
    }
  })

  checkEqual(tool.name, 'delete_discuss_comment', 'tool name')

  const result = await tool.execute({ commentNumber: 3 })

  checkEqual(result, `Deleting your comment`, 'return message from delete')
  checkDeepEqual(deletedIds, ['c-c'], 'third comment deleted')

  await checkThrows(() => tool.execute({ commentNumber: 4 }), `between 1 and 3`, 'out of range should throw')

  const other = deleteDiscussCommentTool({
    ...commentDeps(comments),
    onDeleteComment: () => ({ status: 'ok', message: '' })
  })

  await checkThrows(() => other.execute({ commentNumber: 2 }), `Only the comment's author can delete it`, "someone else's comment should throw")

  const alreadyDeleted = deleteDiscussCommentTool({
    ...commentDeps([comment({ id: 'c-a', authorProfileId: 'me', deleted: '2026-01-02T00:00:00Z' })]),
    onDeleteComment: () => ({ status: 'ok', message: '' })
  })

  await checkThrows(() => alreadyDeleted.execute({ commentNumber: 1 }), `already deleted`, 'deleted comment should throw')

  const empty = deleteDiscussCommentTool({
    ...commentDeps([]),
    onDeleteComment: () => ({ status: 'ok', message: '' })
  })

  await checkThrows(() => empty.execute({ commentNumber: 1 }), `no comments to target`, 'no comments should throw')
})

evals('discuss: flag_discuss_comment resolves by page position', async () => {

  const flaggedIds: string[] = []

  const comments = [
    comment({ id: 'c-a', authorProfileId: 'me' }),
    comment({ id: 'c-b', authorProfileId: 'someone-else' })
  ]

  const tool = flagDiscussCommentTool({
    ...commentDeps(comments),
    onFlagComment: (commentId) => {

      flaggedIds.push(commentId)

      return { status: 'ok', message: `Flagging this comment for review` }
    }
  })

  checkEqual(tool.name, 'flag_discuss_comment', 'tool name')

  const result = await tool.execute({ commentNumber: 2 })

  checkEqual(result, `Flagging this comment for review`, 'return message from flag')
  checkDeepEqual(flaggedIds, ['c-b'], 'second comment flagged')

  await checkThrows(() => tool.execute({ commentNumber: 1 }), `You cannot flag your own comment`, 'own comment should throw')

  await checkThrows(() => tool.execute({ commentNumber: 0 }), `commentNumber must be between 1 and 2`, 'out of range should throw')

  const signedOut = flagDiscussCommentTool({
    ...commentDeps(comments),
    isSignedIn: () => false,
    onFlagComment: () => ({ status: 'ok', message: '' })
  })

  await checkThrows(() => signedOut.execute({ commentNumber: 1 }), `Sign in to flag comments`, 'signed-out should throw')
})
