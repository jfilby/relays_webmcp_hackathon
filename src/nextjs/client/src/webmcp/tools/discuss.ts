//
// WebMCP tool factories for discussion tools. Each factory returns the tool
// definition used by a page, taking its page dependencies (state accessors
// and submit functions) as an explicit object, so the tools can be exercised
// by evals without a DOM.
//
import type { WebMcpTool } from '../webmcp'
import type { SubmitResult } from './types'

// search_discuss_posts: forum search driven by the discussion search form.
export interface SearchDiscussPostsToolDeps {
  onSearch: (query: string) => void
}

export function searchDiscussPostsTool(deps: SearchDiscussPostsToolDeps): WebMcpTool {

  return {
    name: 'search_discuss_posts',
    title: 'Search discussion posts',
    description: `Search the Relays discussion forum for posts matching text. Results replace the list of posts shown on the page.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: `Text to match against discussion posts and comments. Empty to list all posts.`
        }
      }
    },
    execute: (args) => {

      const query = typeof args.query === 'string' ? args.query : ''

      deps.onSearch(query)

      return `Searching discussion posts${query.trim() !== '' ? ` matching "${query.trim()}"` : ''}`
    }
  }
}

// create_discuss_post: submits the new-post form.
export interface CreateDiscussPostToolDeps {
  isSignedIn: () => boolean
  getValues: () => { title: string; body: string }
  onSubmit: (submitValues?: { title: string; body: string }) => SubmitResult
}

export function createDiscussPostTool(deps: CreateDiscussPostToolDeps): WebMcpTool {

  return {
    name: 'create_discuss_post',
    title: 'Create discussion post',
    description: `Publish a new discussion post to the Relays forum with the given title and body. The post appears in the list once saved.`,
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: `Title of the discussion post.`
        },
        body: {
          type: 'string',
          description: `Body text of the discussion post.`
        }
      },
      required: ['title', 'body']
    },
    execute: (args) => {

      if (deps.isSignedIn() !== true) {
        throw new Error(`Sign in to start a discussion`)
      }

      const title = typeof args.title === 'string' ? args.title : ''
      const body = typeof args.body === 'string' ? args.body : ''

      const result = deps.onSubmit({ ...deps.getValues(), title, body })

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}

// add_discuss_comment: posts a top-level comment on the current post.
export interface AddDiscussCommentToolDeps {
  isSignedIn: () => boolean
  getValues: () => { body: string }
  onComment: (submitValues?: { body: string }) => SubmitResult
}

export function addDiscussCommentTool(deps: AddDiscussCommentToolDeps): WebMcpTool {

  return {
    name: 'add_discuss_comment',
    title: 'Add discussion comment',
    description: `Post a top-level comment on this discussion post. The comment appears in the thread once saved.`,
    inputSchema: {
      type: 'object',
      properties: {
        body: {
          type: 'string',
          description: `Text of the comment.`
        }
      },
      required: ['body']
    },
    execute: (args) => {

      if (deps.isSignedIn() !== true) {
        throw new Error(`Sign in to comment`)
      }

      const body = typeof args.body === 'string' ? args.body : ''

      const result = deps.onComment({ ...deps.getValues(), body })

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}

// add_discuss_reply: replies to the comment whose reply box is open.
export interface AddDiscussReplyToolDeps {
  isSignedIn: () => boolean
  // The currently open reply target comment id, or undefined when none is open.
  getReplyTarget: () => string | undefined
  onReplySubmit: (commentId: string, submitValues?: { body: string }) => SubmitResult
}

export function addDiscussReplyTool(deps: AddDiscussReplyToolDeps): WebMcpTool {

  return {
    name: 'add_discuss_reply',
    title: 'Add discussion reply',
    description: `Post a reply to the comment whose inline Reply box is currently open on this discussion post. Only works when a reply target is already open.`,
    inputSchema: {
      type: 'object',
      properties: {
        body: {
          type: 'string',
          description: `Text of the reply.`
        }
      },
      required: ['body']
    },
    execute: (args) => {

      if (deps.isSignedIn() !== true) {
        throw new Error(`Sign in to reply`)
      }

      const targetCommentId = deps.getReplyTarget()

      if (targetCommentId == null || targetCommentId === '') {
        throw new Error(`No reply target is open. Ask the user to click Reply on the comment to reply to, then try again.`)
      }

      const body = typeof args.body === 'string' ? args.body : ''

      const result = deps.onReplySubmit(targetCommentId, { body })

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}
