import { prisma } from '@/db'
import { promptGuardService } from '@/services/generating/prompt-guard/prompt-guard-service'
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

  // Sanitize the agent-readable free text before it is stored (projects are
  // promoted to AI agents browsing Relays)
  const guardedFields = [
    [`graphql:createProject:name`, name],
    [`graphql:createProject:tagline`, tagline],
    [`graphql:createProject:description`, description]] as
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
      console.error(`createProject: blocked input: ` + guard.reason)
      return {
        status: false,
        message: guard.reason ?? 'Input rejected'
      }
    }
  }

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

  // Sanitize the agent-readable free text before it is stored
  const guardedFields = [
    [`graphql:updateProject:name`, name],
    [`graphql:updateProject:tagline`, tagline],
    [`graphql:updateProject:description`, description]] as
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
      console.error(`updateProject: blocked input: ` + guard.reason)
      return {
        status: false,
        message: guard.reason ?? 'Input rejected'
      }
    }
  }

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
