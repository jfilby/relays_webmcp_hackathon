import { prisma } from '@/db'
import { EmailListsMutateService } from '@/services/email-lists/mutate-service'

// Services
const emailListsMutateService = new EmailListsMutateService()

// Subscribe to the updates email list. Pass a userProfileId for a signed-in
// user, or an email for a visitor who isn't signed-in.
export async function signUpForUpdates(parent: any, args: any, context: any, info: any) {

  // Debug
  const fnName = `signUpForUpdates()`

  console.log(`${fnName}: args: ${JSON.stringify(args)}`)

  // The userProfileId path requires a value
  if (args.userProfileId != null) {

    await
      emailListsMutateService.subscribeByUserProfileId(
        prisma,
        args.userProfileId)

    // Return OK
    return {
      status: true,
      message: "You've subscribed to updates!"
    }
  }

  // The email path requires a valid email address
  const email = typeof args.email === 'string' ?
    args.email.toLowerCase().trim() :
    undefined

  const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)

  if (email == null || regexp.test(email) === false) {
    return {
      status: false,
      message: `The email address you entered is invalid`
    }
  }

  // Subscribe the email address
  await
    emailListsMutateService.subscribeByEmail(
      prisma,
      email)

  // Return OK
  return {
    status: true,
    message: "You've subscribed to updates!"
  }
}