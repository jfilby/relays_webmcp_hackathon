import { CustomError, UsersService } from 'serene-core-server'
import { prisma } from '@/db'

// Services
const usersService = new UsersService()

// Code
export async function loadServerStartData(
  parent: any,
  args: any,
  context: any,
  info: any) {

  // Debug
  const fnName = `loadServerStartData()`

  // console.log(`${fnName}: args: ` + JSON.stringify(args))

  // Get user
  const user = await
    usersService.getUserByUserProfileId(
      prisma,
      args.userProfileId)

  // Return
  return {
    status: true,
    // redirectUrl: redirectUrl
  }
}
