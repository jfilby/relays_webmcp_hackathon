import { UsersService } from 'serene-core-server'
import { prisma } from '@/db'
import { ProfileModel } from '@/models/profiles/profile-model'

// Services
const usersService = new UsersService()

// Models
const profileModel = new ProfileModel()

// GraphQL args are schema-validated before the resolver runs
interface LoadServerStartDataArgs {
  userProfileId: string
}

// Code
export async function loadServerStartData(
  _parent: unknown,
  { userProfileId }: LoadServerStartDataArgs) {

  // Get user
  const user = await
    usersService.getUserByUserProfileId(
      prisma,
      userProfileId)

  // Get profile
  const profile = await
    profileModel.getByUserProfileId(
      prisma,
      userProfileId)

  // Return
  return {
    status: true,
    profile: profile
  }
}
