import { CustomError, UsersService } from 'serene-core-server'
import { prisma } from '@/db'
import { ProfileModel } from '@/models/profiles/profile-model'

// Services
const usersService = new UsersService()

// Models
const profileModel = new ProfileModel()

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

  // Get profile
  const profile = await
    profileModel.getByUserProfileId(
      prisma,
      args.userProfileId)

  // Debug
  // console.log(`${fnName}: profile: ` + JSON.stringify(profile))

  // Return
  return {
    status: true,
    profile: profile,
    // redirectUrl: redirectUrl
  }
}
