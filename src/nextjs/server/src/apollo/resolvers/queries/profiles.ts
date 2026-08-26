import { prisma } from '@/db'
import { ProfilesQueryService } from '@/services/profiles/query-service'

// Services
const profilesQueryService = new ProfilesQueryService()

// GraphQL args are schema-validated before the resolver runs
interface ProfileByIdArgs {
  id: string
}

interface ProfileByUserProfileIdArgs {
  userProfileId: string
}

interface SearchProfilesArgs {
  search?: string | null
  type?: string | null
}

// Code
export async function getProfileById(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // Debug
  const fnName = `getProfileById()`

  // GraphQL args are schema-validated before the resolver runs
  const { id, userProfileId } = args as unknown as ProfileByIdArgs & ProfileByUserProfileIdArgs

  // Query
  const results = await
    profilesQueryService.getProfileById(
      prisma,
      id,
      userProfileId ?? undefined)

  // Return
  return results
}

export async function getProfileByUserProfileId(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // Debug
  const fnName = `getProfileByUserProfileId()`

  // GraphQL args are schema-validated before the resolver runs
  const { userProfileId } = args as unknown as ProfileByUserProfileIdArgs

  // Query
  const results = await
    profilesQueryService.getProfileByUserProfileId(
      prisma,
      userProfileId)

  // Return
  return results
}

export async function searchProfiles(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // Debug
  const fnName = `searchProfiles()`

  // GraphQL args are schema-validated before the resolver runs
  const { search, type } = args as unknown as SearchProfilesArgs

  // Query
  const results = await
    profilesQueryService.searchProfiles(
      prisma,
      search ?? undefined,
      type ?? undefined)

  // Return
  return results
}