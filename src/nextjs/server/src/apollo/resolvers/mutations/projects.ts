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

interface ToggleProjectInterestArgs {
  userProfileId: string
  projectId: string
}

interface DeleteProjectArgs {
  id: string
  userProfileId: string
}

// Code
export async function createProject(
  _parent: unknown,
  {
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
  }: CreateProjectArgs) {

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
  _parent: unknown,
  {
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
  }: UpdateProjectArgs) {

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
  _parent: unknown,
  { userProfileId, projectId }: ToggleProjectInterestArgs) {

  // Mutation
  return projectsMutateService.toggleProjectInterest(
    prisma,
    userProfileId,
    projectId)
}

export async function deleteProject(
  _parent: unknown,
  { id, userProfileId }: DeleteProjectArgs) {

  // Mutation
  return projectsMutateService.deleteById(
    prisma,
    id,
    userProfileId)
}
