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
  availabilityStatus?: string | null
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
  availabilityStatus?: string | null
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
    updates,
    availabilityStatus
  } = args as unknown as CreateProfileArgs

  // Mutation
  return profilesMutateService.create(
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
    updates ?? undefined,
    availabilityStatus ?? undefined)
}

export async function updateProfile(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

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
    avatar,
    availabilityStatus
  } = args as unknown as UpdateProfileArgs

  // Mutation
  return profilesMutateService.update(
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
    avatar ?? undefined,
    availabilityStatus ?? undefined)
}

export async function setProfileUpdates(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { userProfileId, updates } = args as unknown as SetProfileUpdatesArgs

  // Mutation
  return profilesMutateService.setGetEmailUpdates(
    prisma,
    userProfileId,
    updates)
}

export async function addSkillToProfile(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId,
    skillName,
    level
  } = args as unknown as {
    userProfileId: string
    skillName: string
    level?: string | null
  }

  // Mutation
  return profilesMutateService.addSkillToProfile(
    prisma,
    userProfileId,
    skillName,
    level ?? undefined)
}

export async function removeSkillFromProfile(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId,
    profileSkillId
  } = args as unknown as {
    userProfileId: string
    profileSkillId: string
  }

  // Mutation
  return profilesMutateService.removeSkillFromProfile(
    prisma,
    userProfileId,
    profileSkillId)
}

export async function addProfileLink(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId,
    kind,
    url,
    handle
  } = args as unknown as {
    userProfileId: string
    kind: string
    url: string
    handle?: string | null
  }

  // Mutation
  return profilesMutateService.addProfileLink(
    prisma,
    userProfileId,
    kind,
    url,
    handle ?? undefined)
}

export async function deleteProfileLink(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { id, userProfileId } = args as unknown as {
    id: string
    userProfileId: string
  }

  // Mutation
  return profilesMutateService.deleteProfileLinkById(
    prisma,
    userProfileId,
    id)
}

export async function endorseSkill(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId,
    toProfileId,
    skillId,
    comment
  } = args as unknown as {
    userProfileId: string
    toProfileId: string
    skillId: string
    comment?: string | null
  }

  // Mutation
  return profilesMutateService.endorseSkill(
    prisma,
    userProfileId,
    toProfileId,
    skillId,
    comment ?? undefined)
}
