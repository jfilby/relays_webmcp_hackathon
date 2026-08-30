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
    website,
    avatar,
    updates,
    availabilityStatus
  }: CreateProfileArgs) {

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
    website,
    avatar,
    availabilityStatus
  }: UpdateProfileArgs) {

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

  // Mutation
  return profilesMutateService.endorseSkill(
    prisma,
    userProfileId,
    toProfileId,
    skillId,
    comment ?? undefined)
}
