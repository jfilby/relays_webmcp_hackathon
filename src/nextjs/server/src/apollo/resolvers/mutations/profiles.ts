import { prisma } from '@/db'
import { ProfilesMutateService } from '@/services/profiles/mutate-service'

// Services
const profilesMutateService = new ProfilesMutateService()

// GraphQL args are schema-validated before the resolver runs
interface CreateProfileArgs {
  userProfileId: string
  displayName: string
  type?: string | null
  isPublic?: boolean | null
  headline?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
  avatar?: string | null
  updates?: boolean | null
}

interface UpdateProfileArgs {
  id: string
  userProfileId: string
  displayName?: string | null
  type?: string | null
  isPublic?: boolean | null
  headline?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
  avatar?: string | null
}

interface SetProfileUpdatesArgs {
  userProfileId: string
  updates: boolean
}

// Code
export async function createProfile(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // Debug
  const fnName = `createProfile()`

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId,
    displayName,
    type,
    isPublic,
    headline,
    bio,
    location,
    website,
    avatar,
    updates
  } = args as unknown as CreateProfileArgs

  console.log(`${fnName}: userProfileId: ${userProfileId}`)

  // Query
  const results = await
    profilesMutateService.create(
      prisma,
      userProfileId,
      displayName,
      type ?? undefined,
      isPublic ?? undefined,
      headline ?? undefined,
      bio ?? undefined,
      location ?? undefined,
      website ?? undefined,
      avatar ?? undefined,
      updates ?? undefined)

  // Return
  return results
}

export async function updateProfile(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // Debug
  const fnName = `updateProfile()`

  // GraphQL args are schema-validated before the resolver runs
  const {
    id,
    userProfileId,
    displayName,
    type,
    isPublic,
    headline,
    bio,
    location,
    website,
    avatar
  } = args as unknown as UpdateProfileArgs

  // Query
  const results = await
    profilesMutateService.update(
      prisma,
      id,
      userProfileId,
      displayName ?? undefined,
      type ?? undefined,
      isPublic ?? undefined,
      headline ?? undefined,
      bio ?? undefined,
      location ?? undefined,
      website ?? undefined,
      avatar ?? undefined)

  // Return
  return results
}

export async function setProfileUpdates(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // Debug
  const fnName = `setProfileUpdates()`

  // GraphQL args are schema-validated before the resolver runs
  const { userProfileId, updates } = args as unknown as SetProfileUpdatesArgs

  // Query
  const results = await
    profilesMutateService.setGetEmailUpdates(
      prisma,
      userProfileId,
      updates)

  // Return
  return results
}