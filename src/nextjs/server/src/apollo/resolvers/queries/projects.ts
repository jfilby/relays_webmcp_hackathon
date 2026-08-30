import { prisma } from '@/db'
import { ProjectsQueryService } from '@/services/projects/query-service'

// Services
const projectsQueryService = new ProjectsQueryService()

// GraphQL args are schema-validated before the resolver runs
interface GetProjectByPublicIdArgs {
  publicId: string
  userProfileId?: string | null
}

interface SearchProjectsArgs {
  search?: string | null
  isPromoted?: boolean | null
}

interface GetProjectsByUserProfileIdArgs {
  userProfileId: string
  viewerUserProfileId?: string | null
}

// Code
export async function getProjectByPublicId(
  _parent: unknown,
  { publicId, userProfileId }: GetProjectByPublicIdArgs) {

  // Query
  return projectsQueryService.getProjectByPublicId(
    prisma,
    publicId,
    userProfileId ?? undefined)
}

export async function searchProjects(
  _parent: unknown,
  { search, isPromoted }: SearchProjectsArgs) {

  // Query
  return projectsQueryService.searchProjects(
    prisma,
    search ?? undefined,
    isPromoted ?? undefined)
}

export async function getProjectsByUserProfileId(
  _parent: unknown,
  { userProfileId, viewerUserProfileId }: GetProjectsByUserProfileIdArgs) {

  // Query
  return projectsQueryService.getProjectsByUserProfileId(
    prisma,
    userProfileId,
    viewerUserProfileId ?? undefined)
}
