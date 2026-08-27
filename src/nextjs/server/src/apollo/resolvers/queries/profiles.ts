import { prisma } from '@/db'
import { ProfilesQueryService } from '@/services/profiles/query-service'

// Services
const profilesQueryService = new ProfilesQueryService()

// GraphQL args are schema-validated before the resolver runs
interface ProfileByPublicIdArgs {
  publicId: string
}

interface ProfileByUserProfileIdArgs {
  userProfileId: string
}

interface SearchProfilesArgs {
  search?: string | null
  type?: string | null
}

interface GetNetworkArgs {
  userProfileId: string
}

interface ProfileIdArgs {
  profileId: string
}

// Code
export async function getProfileByPublicId(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { publicId, userProfileId } = args as unknown as ProfileByPublicIdArgs & ProfileByUserProfileIdArgs

  // Query
  const results = await
    profilesQueryService.getProfileByPublicId(
      prisma,
      publicId,
      userProfileId ?? undefined)

  // Return
  return results
}

export async function getProfileByUserProfileId(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

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

export async function getNetwork(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { userProfileId } = args as unknown as GetNetworkArgs

  // Query
  const results = await
    profilesQueryService.getNetwork(
      prisma,
      userProfileId)

  // Return
  return results
}

export async function getSkillsByProfileId(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { profileId } = args as unknown as ProfileIdArgs

  // Query
  return profilesQueryService.getSkillsByProfileId(
    prisma,
    profileId)
}

export async function getProfileLinksByProfileId(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { profileId } = args as unknown as ProfileIdArgs

  // Query
  return profilesQueryService.getLinksByProfileId(
    prisma,
    profileId)
}

export async function getEndorsementsByProfileId(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { profileId } = args as unknown as ProfileIdArgs

  // Query
  return profilesQueryService.getEndorsementsByProfileId(
    prisma,
    profileId)
}

export async function getPostsByProfileId(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { profileId } = args as unknown as ProfileIdArgs

  // Query
  return profilesQueryService.getPostsByProfileId(
    prisma,
    profileId)
}
