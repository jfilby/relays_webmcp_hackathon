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
  techStack?: string[] | null
  stage?: string | null
  isOpenToCollaborators?: boolean | null
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
  techStack?: string[] | null
  stage?: string | null
  isOpenToCollaborators?: boolean | null
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

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId,
    name,
    tagline,
    description,
    website,
    image,
    isPromoted,
    isPublic,
    techStack,
    stage,
    isOpenToCollaborators
  } = args as unknown as CreateProjectArgs

  // Mutation
  return projectsMutateService.create(
    prisma,
    userProfileId,
    name,
    tagline ?? undefined,
    description ?? undefined,
    website ?? undefined,
    image ?? undefined,
    isPromoted ?? undefined,
    isPublic ?? undefined,
    techStack ?? undefined,
    stage ?? undefined,
    isOpenToCollaborators ?? undefined)
}

export async function updateProject(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

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
    isPublic,
    techStack,
    stage,
    isOpenToCollaborators
  } = args as unknown as UpdateProjectArgs

  // Mutation
  return projectsMutateService.update(
    prisma,
    id,
    userProfileId,
    name ?? undefined,
    tagline ?? undefined,
    description ?? undefined,
    website ?? undefined,
    image ?? undefined,
    isPromoted ?? undefined,
    isPublic ?? undefined,
    techStack ?? undefined,
    stage ?? undefined,
    isOpenToCollaborators ?? undefined)
}

export async function toggleProjectInterest(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId,
    projectId
  } = args as unknown as {
    userProfileId: string
    projectId: string
  }

  // Mutation
  return projectsMutateService.toggleProjectInterest(
    prisma,
    userProfileId,
    projectId)
}

export async function deleteProject(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const {
    id,
    userProfileId
  } = args as unknown as DeleteProjectArgs

  // Mutation
  return projectsMutateService.deleteById(
    prisma,
    id,
    userProfileId)
}
