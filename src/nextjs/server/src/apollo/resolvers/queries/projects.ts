import { prisma } from '@/db'
import { ProjectsQueryService } from '@/services/projects/query-service'
import { ProfilesQueryService } from '@/services/profiles/query-service'
// Services
const projectsQueryService = new ProjectsQueryService()
const profilesQueryService = new ProfilesQueryService()
// GraphQL args are schema-validated before the resolver runs
interface GetProjectByIdArgs {
  id: string
  userProfileId: string
}

interface SearchProjectsArgs {
  search?: string | null
  isPromoted?: boolean | null
}

interface GetProjectsByUserProfileIdArgs {
  userProfileId: string
}

// Code
export async function getProjectById(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // Debug
  const fnName = `getProjectById()`

  // GraphQL args are schema-validated before the resolver runs
  const {
    id,
    userProfileId
  } = args as unknown as GetProjectByIdArgs

  // Query
  const results = await
    projectsQueryService.getProjectById(
      prisma,
      id,
      userProfileId)

  // Return
  return results
}

export async function searchProjects(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // Debug
  const fnName = `searchProjects()`

  // GraphQL args are schema-validated before the resolver runs
  const {
    search,
    isPromoted
  } = args as unknown as SearchProjectsArgs

  // Query
  const results = await
    projectsQueryService.searchProjects(
      prisma,
      search ?? undefined,
      isPromoted ?? undefined)

  // Return
  return results
}

export async function getProjectsByUserProfileId(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // Debug
  const fnName = `getProjectsByUserProfileId()`

  // GraphQL args are schema-validated before the resolver runs
  const {
    userProfileId
  } = args as unknown as GetProjectsByUserProfileIdArgs

  // Query
  const results = await
    projectsQueryService.getProjectsByUserProfileId(
      prisma,
      userProfileId)

  // Return
  return results
}

export async function getPostsByProjectId(
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown) {

  // GraphQL args are schema-validated before the resolver runs
  const { projectId } = args as unknown as { projectId: string }

  // Query
  return profilesQueryService.getPostsByProjectId(
    prisma,
    projectId)
}