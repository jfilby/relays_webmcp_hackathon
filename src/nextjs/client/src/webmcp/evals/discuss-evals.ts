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
  searchDiscussPostsTool
} from '../tools/discuss'

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
