import { prisma } from '@/db'
import { promptGuardService } from '@/services/generating/prompt-guard/prompt-guard-service'
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
  avatar?: string | null
  availabilityStatus?: string | null
}

interface SetProfileUpdatesArgs {
  userProfileId: string
  updates: boolean
}

interface AddSkillToProfileArgs {
  userProfileId: string
  skillName: string
  level?: string | null
}

interface RemoveSkillFromProfileArgs {
  userProfileId: string
  profileSkillId: string
}

interface AddProfileLinkArgs {
  userProfileId: string
  kind: string
  url: string
  handle?: string | null
}

interface DeleteProfileLinkArgs {
  userProfileId: string
  id: string
}

interface EndorseSkillArgs {
  userProfileId: string
  toProfileId: string
  skillId: string
  comment?: string | null
}

interface DeleteProfileAvatarArgs {
  userProfileId: string
}

// Code
export async function createProfile(
  _parent: unknown,
  {
    userProfileId,
    displayName,
    type,
    isPublic,
    headline,
    bio,
    location,
    avatar,
    updates,
    availabilityStatus
  }: CreateProfileArgs) {

  // Sanitize the agent-readable free text before it is stored (profiles are
  // served to AI agents browsing Relays)
  const guardedFields = [
    [`graphql:createProfile:displayName`, displayName],
    [`graphql:createProfile:headline`, headline],
    [`graphql:createProfile:bio`, bio]] as
    [string, string][]

  for (const [source, text] of guardedFields) {
    if (text == null || text.trim() === '') {
      continue
    }

    const guard = await promptGuardService.sanitize(
      prisma,
      text,
      {
        createdById: userProfileId,
        source: source
      })

    if (guard.blocked === true) {
      console.error(`createProfile: blocked input: ` + guard.reason)
      return {
        status: false,
        message: guard.reason ?? 'Input rejected'
      }
    }
  }

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
    avatar ?? undefined,
    updates ?? undefined,
    availabilityStatus ?? undefined)
}

export async function updateProfile(
  _parent: unknown,
  {
    id,
    userProfileId,
    displayName,
    type,
    isPublic,
    headline,
    bio,
    location,
    avatar,
    availabilityStatus
  }: UpdateProfileArgs) {

  // Sanitize the agent-readable free text before it is stored
  const guardedFields = [
    [`graphql:updateProfile:displayName`, displayName],
    [`graphql:updateProfile:headline`, headline],
    [`graphql:updateProfile:bio`, bio]] as
    [string, string | null | undefined][]

  for (const [source, text] of guardedFields) {
    if (text == null || text.trim() === '') {
      continue
    }

    const guard = await promptGuardService.sanitize(
      prisma,
      text,
      {
        createdById: userProfileId,
        source: source
      })

    if (guard.blocked === true) {
      console.error(`updateProfile: blocked input: ` + guard.reason)
      return {
        status: false,
        message: guard.reason ?? 'Input rejected'
      }
    }
  }

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
    avatar ?? undefined,
    availabilityStatus ?? undefined)
}

export async function deleteProfileAvatar(
  _parent: unknown,
  { userProfileId }: DeleteProfileAvatarArgs) {

  // Mutation
  return profilesMutateService.deleteAvatar(
    prisma,
    userProfileId)
}

export async function setProfileUpdates(
  _parent: unknown,
  { userProfileId, updates }: SetProfileUpdatesArgs) {

  // Mutation
  return profilesMutateService.setGetEmailUpdates(
    prisma,
    userProfileId,
    updates)
}

export async function addSkillToProfile(
  _parent: unknown,
  { userProfileId, skillName, level }: AddSkillToProfileArgs) {

  // Mutation
  return profilesMutateService.addSkillToProfile(
    prisma,
    userProfileId,
    skillName,
    level ?? undefined)
}

export async function removeSkillFromProfile(
  _parent: unknown,
  { userProfileId, profileSkillId }: RemoveSkillFromProfileArgs) {

  // Mutation
  return profilesMutateService.removeSkillFromProfile(
    prisma,
    userProfileId,
    profileSkillId)
}

export async function addProfileLink(
  _parent: unknown,
  { userProfileId, kind, url, handle }: AddProfileLinkArgs) {

  // Mutation
  return profilesMutateService.addProfileLink(
    prisma,
    userProfileId,
    kind,
    url,
    handle ?? undefined)
}

export async function deleteProfileLink(
  _parent: unknown,
  { userProfileId, id }: DeleteProfileLinkArgs) {

  // Mutation
  return profilesMutateService.deleteProfileLinkById(
    prisma,
    userProfileId,
    id)
}

export async function endorseSkill(
  _parent: unknown,
  { userProfileId, toProfileId, skillId, comment }: EndorseSkillArgs) {

  // Sanitize the endorsement comment before it is stored
  if (comment != null && comment.trim() !== '') {
    const guard = await promptGuardService.sanitize(
      prisma,
      comment,
      {
        createdById: userProfileId,
        source: `graphql:endorseSkill:comment`
      })

    if (guard.blocked === true) {
      console.error(`endorseSkill: blocked input: ` + guard.reason)
      return {
        status: false,
        message: guard.reason ?? 'Input rejected'
      }
    }
  }

  // Mutation
  return profilesMutateService.endorseSkill(
    prisma,
    userProfileId,
    toProfileId,
    skillId,
    comment ?? undefined)
}
