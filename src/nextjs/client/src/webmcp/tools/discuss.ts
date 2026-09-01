//
// WebMCP tool factories for discussion tools. Each factory returns the tool
// definition used by a page, taking its page dependencies (state accessors
// and submit functions) as an explicit object, so the tools can be exercised
// by evals without a DOM.
//
import type { DiscussCommentItem } from '@/types/client-only-types'
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

// delete_discuss_post: deletes the current post (author only).
export interface DeleteDiscussPostToolDeps {
  isSignedIn: () => boolean
  // True when the signed-in viewer is the post's author.
  isAuthor: () => boolean
  onDeletePost: () => SubmitResult
}

export function deleteDiscussPostTool(deps: DeleteDiscussPostToolDeps): WebMcpTool {

  return {
    name: 'delete_discuss_post',
    title: 'Delete discussion post',
    description: `Delete this discussion post. Only the post's author can delete it; the post and all of its comments are removed permanently.`,
    inputSchema: {
      type: 'object',
      properties: {}
    },
    execute: () => {

      if (deps.isSignedIn() !== true) {
        throw new Error(`Sign in to delete this post`)
      }

      if (deps.isAuthor() !== true) {
        throw new Error(`Only the post author can delete this post`)
      }

      const result = deps.onDeletePost()

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}

// flag_discuss_post: flags the current post for moderation.
export interface FlagDiscussPostToolDeps {
  isSignedIn: () => boolean
  // True when the viewer may flag this post (signed in and not the author).
  canFlag: () => boolean
  onFlagPost: () => SubmitResult
}

export function flagDiscussPostTool(deps: FlagDiscussPostToolDeps): WebMcpTool {

  return {
    name: 'flag_discuss_post',
    title: 'Flag discussion post',
    description: `Flag this discussion post for moderator review, e.g. for spam or abuse. The post's author cannot flag their own post.`,
    inputSchema: {
      type: 'object',
      properties: {}
    },
    execute: () => {

      if (deps.isSignedIn() !== true) {
        throw new Error(`Sign in to flag this post`)
      }

      if (deps.canFlag() !== true) {
        throw new Error(`You cannot flag your own post`)
      }

      const result = deps.onFlagPost()

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}

// Targeting a comment: the comments array as displayed on the page, in
// top-to-bottom order.
export interface DiscussCommentToolsDeps {
  isSignedIn: () => boolean
  // The signed-in viewer's profile id, empty for guests.
  viewerProfileId: () => string
  // Comments in the order they appear on the page, top to bottom.
  getComments: () => DiscussCommentItem[]
}

// Resolves the 1-based commentNumber argument to a comment, throwing when the
// position is missing or out of range.
function resolveComment(deps: DiscussCommentToolsDeps, args: Record<string, unknown>): { comment: DiscussCommentItem; commentNumber: number } {

  const commentNumber = typeof args.commentNumber === 'number' &&
    Number.isInteger(args.commentNumber) ?
    args.commentNumber :
    0

  const comments = deps.getComments()

  if (commentNumber < 1 || commentNumber > comments.length) {
    throw new Error(comments.length === 0 ?
      `This post has no comments to target` :
      `No comment #${commentNumber || ''}. commentNumber must be between 1 and ${comments.length}, counted from the top of the page.`)
  }

  return { comment: comments[commentNumber - 1]!, commentNumber }
}

// delete_discuss_comment: deletes one of the viewer's own comments.
export interface DeleteDiscussCommentToolDeps extends DiscussCommentToolsDeps {
  onDeleteComment: (commentId: string) => SubmitResult
}

export function deleteDiscussCommentTool(deps: DeleteDiscussCommentToolDeps): WebMcpTool {

  return {
    name: 'delete_discuss_comment',
    title: 'Delete discussion comment',
    description: `Delete one of your own comments on this discussion post, chosen by its position on the page. Only the comment's author can delete it.`,
    inputSchema: {
      type: 'object',
      properties: {
        commentNumber: {
          type: 'number',
          description: `1-based position of the comment on the page, counted top to bottom including replies and deleted comments.`
        }
      },
      required: ['commentNumber']
    },
    execute: (args) => {

      if (deps.isSignedIn() !== true) {
        throw new Error(`Sign in to delete comments`)
      }

      const { comment, commentNumber } = resolveComment(deps, args)

      if (comment.deleted != null) {
        throw new Error(`Comment #${commentNumber} is already deleted`)
      }

      if (comment.authorProfileId !== deps.viewerProfileId()) {
        throw new Error(`Only the comment's author can delete it`)
      }

      const result = deps.onDeleteComment(comment.id)

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}

// flag_discuss_comment: flags someone else's comment for moderation.
export interface FlagDiscussCommentToolDeps extends DiscussCommentToolsDeps {
  onFlagComment: (commentId: string) => SubmitResult
}

export function flagDiscussCommentTool(deps: FlagDiscussCommentToolDeps): WebMcpTool {

  return {
    name: 'flag_discuss_comment',
    title: 'Flag discussion comment',
    description: `Flag a comment on this discussion post for moderator review, e.g. for spam or abuse, chosen by its position on the page. You cannot flag your own comment.`,
    inputSchema: {
      type: 'object',
      properties: {
        commentNumber: {
          type: 'number',
          description: `1-based position of the comment on the page, counted top to bottom including replies and deleted comments.`
        }
      },
      required: ['commentNumber']
    },
    execute: (args) => {

      if (deps.isSignedIn() !== true) {
        throw new Error(`Sign in to flag comments`)
      }

      const { comment } = resolveComment(deps, args)

      if (comment.authorProfileId === deps.viewerProfileId()) {
        throw new Error(`You cannot flag your own comment`)
      }

      const result = deps.onFlagComment(comment.id)

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}
