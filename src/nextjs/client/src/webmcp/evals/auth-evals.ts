//
// Evals for the auth and email-capture WebMCP tools: demo_sign_in,
// send_sign_in_link, send_sign_up_link, join_waitlist and
// sign_up_for_updates.
//
import {
  check,
  checkDeepEqual,
  checkEqual,
  checkThrows,
  evals
} from './harness'
import {
  demoSignInTool,
  joinWaitlistTool,
  sendSignInLinkTool,
  sendSignUpLinkTool,
  signUpForUpdatesTool
} from '../tools/auth'

evals('auth: demo_sign_in validates password and delegates to attemptLogin', async () => {

  const attempts: string[] = []

  const tool = demoSignInTool({
    onAttemptLogin: (pw) => {
      attempts.push(pw)
    }
  })

  checkEqual(tool.name, 'demo_sign_in', 'tool name')
  checkDeepEqual(tool.inputSchema.required, ['password'], 'required fields')

  const result = await tool.execute({ password: 'demo-pass' })

  checkEqual(result, `Signing in to the demo account`, 'return message')
  checkDeepEqual(attempts, ['demo-pass'], 'login attempted with the password')

  await checkThrows(() => tool.execute({ password: '' }), `Please provide the demo account password.`, 'empty password should throw')
  await checkThrows(() => tool.execute({}), `Please provide the demo account password.`, 'missing password should throw')
})
evals('auth: send_sign_in_link trims email and requires one', async () => {

  const sent: string[] = []

  const tool = sendSignInLinkTool({
    onSend: (email) => {
      sent.push(email)
    }
  })

  checkEqual(tool.name, 'send_sign_in_link', 'tool name')

  const result = await tool.execute({ email: '  alice@example.com  ' })

  checkEqual(result, `Sending sign-in link to "alice@example.com"`, 'return message with trimmed email')
  checkDeepEqual(sent, ['alice@example.com'], 'email trimmed before send')

  await checkThrows(() => tool.execute({ email: '   ' }), `Please provide the email address to send the sign-in link to.`, 'blank email should throw')
})

evals('auth: send_sign_up_link trims email and requires one', async () => {

  const sent: string[] = []

  const tool = sendSignUpLinkTool({
    onSend: (email) => {
      sent.push(email)
    }
  })

  checkEqual(tool.name, 'send_sign_up_link', 'tool name')

  const result = await tool.execute({ email: 'bob@example.com' })

  checkEqual(result, `Sending sign-up link to "bob@example.com"`, 'return message')
  checkDeepEqual(sent, ['bob@example.com'], 'email passed through')

  await checkThrows(() => tool.execute({}), `Please provide the email address to send the sign-up link to.`, 'missing email should throw')
})

evals('auth: join_waitlist submits the email and reports errors', async () => {

  const applied: Array<string | undefined> = []

  let failing = false

  const tool = joinWaitlistTool({
    onSignup: async (signupEmail) => {

      applied.push(signupEmail)

      if (failing) {
        return { status: 'error', message: `Invalid email address` }
      }

      return { status: 'ok', message: `You've applied to join the private beta!` }
    }
  })

  checkEqual(tool.name, 'join_waitlist', 'tool name')
  checkDeepEqual(tool.inputSchema.required, ['email'], 'required fields')

  const result = await tool.execute({ email: '  carol@example.com  ' })

  checkEqual(result, `You've applied to join the private beta!`, 'return message from signup')
  checkDeepEqual(applied, ['carol@example.com'], 'email trimmed before submit')

  failing = true

  await checkThrows(() => tool.execute({ email: 'nope' }), `Invalid email address`, 'signup failure should throw')
})

evals('auth: sign_up_for_updates requires email when signed out', async () => {

  const subscribed: Array<string | undefined> = []

  const tool = signUpForUpdatesTool({
    isSignedOut: () => true,
    onSignup: async (signupEmail) => {

      subscribed.push(signupEmail)

      return { status: 'ok', message: `Subscribed` }
    }
  })

  checkEqual(tool.name, 'sign_up_for_updates', 'tool name')

  await checkThrows(() => tool.execute({}), `An email address is required to sign up for updates while signed out`, 'signed-out without email should throw')

  const result = await tool.execute({ email: '  dave@example.com  ' })

  checkEqual(result, `Subscribed`, 'return message from signup')
  checkDeepEqual(subscribed, ['dave@example.com'], 'email trimmed before subscribe')
})

evals('auth: sign_up_for_updates allows omitted email when signed in', async () => {

  const subscribed: Array<string | undefined> = []

  const tool = signUpForUpdatesTool({
    isSignedOut: () => false,
    onSignup: async (signupEmail) => {

      subscribed.push(signupEmail)

      return { status: 'ok', message: `Subscribed` }
    }
  })

  const result = await tool.execute({})

  checkEqual(result, `Subscribed`, 'return message from signup')
  checkDeepEqual(subscribed, [undefined], 'signed-in subscribe uses the account address')
})
