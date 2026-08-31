//
// WebMCP tool factories for sign-in, sign-up and email-capture tools. Each
// factory returns the tool definition used by a page, taking its page
// dependencies as an explicit object, so the tools can be exercised by evals
// without a DOM.
//
import type { WebMcpTool } from '../webmcp'
import type { SubmitResult } from './types'

// demo_sign_in: signs in to the demo account as a selected demo user.
export interface DemoSignInToolDeps {
  onAttemptLogin: (username: string, password: string) => void | Promise<unknown>
}

export function demoSignInTool(deps: DemoSignInToolDeps): WebMcpTool {

  return {
    name: 'demo_sign_in',
    title: 'Sign in to the demo account',
    description: `Sign in to the Relays demo account as the given demo user (defaults to demo-alice) with the shared demo password. On success the browser is redirected into the app; on a wrong password the page shows an error alert.`,
    inputSchema: {
      type: 'object',
      properties: {
        user: {
          type: 'string',
          description: `Username of the demo user to sign in as, e.g. demo-alice, demo-ben, demo-priya, demo-relay-bot or demo-atlas.`
        },
        password: {
          type: 'string',
          description: `Demo account password.`
        }
      },
      required: ['password']
    },
    execute: async (args) => {
      const pw = typeof args.password === 'string' ? args.password : ''
      const username = typeof args.user === 'string' && args.user !== '' ?
        args.user :
        'demo-alice'

      if (pw === '') {
        throw new Error(`Please provide the demo account password.`)
      }

      // Fire and forget like the page button: the page navigates on success
      deps.onAttemptLogin(username, pw)

      return `Signing in to the demo account as ${username}`
    }
  }
}

// send_sign_in_link: submits the email sign-in form.
export interface SendSignInLinkToolDeps {
  onSend: (email: string) => void | Promise<unknown>
}

export function sendSignInLinkTool(deps: SendSignInLinkToolDeps): WebMcpTool {

  return {
    name: 'send_sign_in_link',
    title: 'Send sign-in link',
    description: `Submit the email sign-in form, sending a magic sign-in link to the given email address. The user follows the link in their email to sign in.`,
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: `Email address of the account to send the sign-in link to.`
        }
      },
      required: ['email']
    },
    execute: async (args) => {

      const emailArg = typeof args.email === 'string' ? args.email.trim() : ''

      if (emailArg === '') {
        throw new Error(`Please provide the email address to send the sign-in link to.`)
      }

      // Fire and forget like the page button: next-auth navigates on success
      void deps.onSend(emailArg)

      return `Sending sign-in link to "${emailArg}"`
    }
  }
}

// send_sign_up_link: submits the sign-up form.
export interface SendSignUpLinkToolDeps {
  onSend: (email: string) => void | Promise<unknown>
}

export function sendSignUpLinkTool(deps: SendSignUpLinkToolDeps): WebMcpTool {

  return {
    name: 'send_sign_up_link',
    title: 'Send sign-up link',
    description: `Submit the sign-up form, sending a magic sign-in link to the given email address. If the account does not exist yet, following the link creates it.`,
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: `Email address to send the sign-up link to.`
        }
      },
      required: ['email']
    },
    execute: async (args) => {

      const emailArg = typeof args.email === 'string' ? args.email.trim() : ''

      if (emailArg === '') {
        throw new Error(`Please provide the email address to send the sign-up link to.`)
      }

      // Fire and forget like the page button: next-auth navigates on success
      void deps.onSend(emailArg)

      return `Sending sign-up link to "${emailArg}"`
    }
  }
}

// join_waitlist: submits the waitlist form on the pre-launch landing page.
export interface JoinWaitlistToolDeps {
  onSignup: (signupEmail?: string) => Promise<SubmitResult>
}

export function joinWaitlistTool(deps: JoinWaitlistToolDeps): WebMcpTool {

  return {
    name: 'join_waitlist',
    title: 'Join the waitlist',
    description: `Submit the waitlist form to apply to join the private beta with the given email address. The outcome is shown in the page alert.`,
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: `Email address to apply with.`
        }
      },
      required: ['email']
    },
    execute: async (args) => {

      const submittedEmail = typeof args.email === 'string' ? args.email.trim() : ''

      const result = await deps.onSignup(submittedEmail)

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}

// sign_up_for_updates: submits the email-updates form on the launched landing
// page.
export interface SignUpForUpdatesToolDeps {
  // True when the viewer is signed out (session resolved as logged out).
  isSignedOut: () => boolean
  onSignup: (signupEmail?: string) => Promise<SubmitResult>
}

export function signUpForUpdatesTool(deps: SignUpForUpdatesToolDeps): WebMcpTool {

  return {
    name: 'sign_up_for_updates',
    title: 'Sign up for updates',
    description: `Submit the email-updates form to subscribe the current visitor to Relays updates. Signed-out visitors must pass an email address; signed-in users are subscribed against their account address. The outcome is shown in the page alert.`,
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: `Email address to subscribe. Required when signed out; ignored when signed in.`
        }
      }
    },
    execute: async (args) => {

      const submittedEmail = typeof args.email === 'string' ? args.email.trim() : undefined

      if (deps.isSignedOut() === true && (submittedEmail == null || submittedEmail === '')) {
        throw new Error(`An email address is required to sign up for updates while signed out`)
      }

      const result = await deps.onSignup(submittedEmail)

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}
