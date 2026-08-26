import { prisma } from '@/db'
import { ProjectsMutateService } from '@/services/projects/mutate-service'

// Services
const projectsMutateService = new ProjectsMutateService()

// GraphQL args are schema-validated before the resolver runs
interface CreateProjectArgs {
  userProfileId: string
  name: string
  tagline?: string | null
  description?: string | null
  website?: string | null
  image?: string | null
  isPromoted?: boolean | null
  isPublic?: boolean | null
}

interface UpdateProjectArgs {
  id: string
  userProfileId: string
  name?: string | null
  tagline?: string | null
  description?: string | null
  website?: string | null
  image?: string | null
  isPromoted?: boolean | null
  isPublic?: boolean | null
}

interface DeleteProjectArgs {
  id: string
  userProfileId: string
}

// Code
export async function createProject(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // Debug
  const fnName = `createProject()`

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId,
    name,
    tagline,
    description,
    website,
    image,
    isPromoted,
    isPublic
  } = args as unknown as CreateProjectArgs

  // Query
  const results = await
    projectsMutateService.create(
      prisma,
      userProfileId,
      name,
      tagline ?? undefined,
      description ?? undefined,
      website ?? undefined,
      image ?? undefined,
      isPromoted ?? undefined,
      isPublic ?? undefined)

  // Return
  return results
}

export async function updateProject(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // Debug
  const fnName = `updateProject()`

  // GraphQL args are schema-validated before the resolver runs
  const {
    id,
    userProfileId,
    name,
    tagline,
    description,
    website,
    image,
    isPromoted,
    isPublic
  } = args as unknown as UpdateProjectArgs

  // Query
  const results = await
    projectsMutateService.update(
      prisma,
      id,
      userProfileId,
      name ?? undefined,
      tagline ?? undefined,
      description ?? undefined,
      website ?? undefined,
      image ?? undefined,
      isPromoted ?? undefined,
      isPublic ?? undefined)

  // Return
  return results
}

export async function deleteProject(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // Debug
  const fnName = `deleteProject()`

  // GraphQL args are schema-validated before the resolver runs
  const {
    id,
    userProfileId
  } = args as unknown as DeleteProjectArgs

  // Query
  const results = await
    projectsMutateService.deleteById(
      prisma,
      id,
      userProfileId)

  // Return
  return results
}