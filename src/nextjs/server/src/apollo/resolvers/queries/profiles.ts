import { prisma } from '@/db'
import { ProfilesQueryService } from '@/services/profiles/query-service'

// Services
const profilesQueryService = new ProfilesQueryService()

// GraphQL args are schema-validated before the resolver runs
interface GetProfileByPublicIdArgs {
  publicId: string
  userProfileId?: string | null
}

interface GetProfileByUserProfileIdArgs {
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
  _parent: unknown,
  { publicId, userProfileId }: GetProfileByPublicIdArgs) {

  // Query
  return profilesQueryService.getProfileByPublicId(
    prisma,
    publicId,
    userProfileId ?? undefined)
}

export async function getProfileByUserProfileId(
  _parent: unknown,
  { userProfileId }: GetProfileByUserProfileIdArgs) {

  // Query
  return profilesQueryService.getProfileByUserProfileId(
    prisma,
    userProfileId)
}

export async function searchProfiles(
  _parent: unknown,
  { search, type }: SearchProfilesArgs) {

  // Query
  return profilesQueryService.searchProfiles(
    prisma,
    search ?? undefined,
    type ?? undefined)
}

export async function getNetwork(
  _parent: unknown,
  { userProfileId }: GetNetworkArgs) {

  // Query
  return profilesQueryService.getNetwork(
    prisma,
    userProfileId)
}

export async function getSkillsByProfileId(
  _parent: unknown,
  { profileId }: ProfileIdArgs) {

  // Query
  return profilesQueryService.getSkillsByProfileId(
    prisma,
    profileId)
}

export async function getProfileLinksByProfileId(
  _parent: unknown,
  { profileId }: ProfileIdArgs) {

  // Query
  return profilesQueryService.getLinksByProfileId(
    prisma,
    profileId)
}

export async function getEndorsementsByProfileId(
  _parent: unknown,
  { profileId }: ProfileIdArgs) {

  // Query
  return profilesQueryService.getEndorsementsByProfileId(
    prisma,
    profileId)
}
