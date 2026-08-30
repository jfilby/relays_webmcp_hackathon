/**
 * Client-side data shapes for the Relays web client.
 *
 * The public identity on Relays is a Profile (H human, A agent). These types
 * describe the page-level data the pages, shared header, and layout consume.
 * The GraphQL API that populates them is built on the server.
 */

export interface PageProfile {
  id?: string
  publicId?: string
  userProfileId?: string
  displayName?: string
  headline?: string
  type?: string        // H (human), A (agent)
  isViewer?: boolean
  getEmailUpdates?: boolean
}

// The GraphQL Profile shape returned by the profile queries/mutations
export interface Profile {
  id: string
  publicId?: string
  type?: string        // H (human), A (agent)
  status?: string
  userProfileId?: string
  displayName: string
  headline?: string | null
  bio?: string | null
  location?: string | null
  avatar?: string | null
  isPublic?: boolean
  availabilityStatus?: string | null   // A (available), B (busy), U (unavailable)
  isVerified?: boolean | null
  isDemoData?: boolean | null
  verifiedAt?: string | null
  created?: string
  updated?: string | null
}

export const profileTypes = [
  { value: 'H', name: 'Human' },
  { value: 'A', name: 'Agent' }
]

// Availability statuses for profiles
export const availabilityStatuses = [
  { value: 'A', name: 'Available' },
  { value: 'B', name: 'Busy' },
  { value: 'U', name: 'Unavailable' }
]

// Human-readable availability status
export function availabilityStatusName(availabilityStatus: string | undefined | null): string {

  const found = availabilityStatuses.find(status => status.value === availabilityStatus)

  return found?.name ?? ''
}

// Human-readable skill level
export function skillLevelName(levelName: string | undefined | null): string {

  const found = skillLevels.find(level => level.value === levelName)

  return found?.name ?? ''
}
export interface ProfileSkill {
  id: string
  skillId: string
  name?: string | null
  level?: string | null    // B (beginner), I (intermediate), A (advanced), E (expert)
}

export const skillLevels = [
  { value: 'B', name: 'Beginner' },
  { value: 'I', name: 'Intermediate' },
  { value: 'A', name: 'Advanced' },
  { value: 'E', name: 'Expert' }
]

// A link on a profile: W website, G github, L linkedin, R repository,
// M MCP endpoint, X other
export interface ProfileLink {
  id: string
  kind: string
  url: string
  handle?: string | null
}

// Profile link kinds: W website, G github, L linkedin, R repository,
// M MCP endpoint, X other
export const profileLinkKinds = [
  { value: 'W', name: 'Website' },
  { value: 'G', name: 'GitHub' },
  { value: 'L', name: 'LinkedIn' },
  { value: 'R', name: 'Repository' },
  { value: 'M', name: 'MCP endpoint' },
  { value: 'X', name: 'Other' }
]

// Human-readable profile link kind
export function profileLinkName(kind: string | undefined | null): string {

  const found = profileLinkKinds.find(linkKind => linkKind.value === kind)

  return found?.name ?? 'Link'
}

// An endorsement of a profile's skill
export interface Endorsement {
  id: string
  fromProfileId: string
  fromDisplayName?: string | null
  skillId: string
  skillName?: string | null
  comment?: string | null
  created?: string
}

// A discussion post, optionally attached to a project
export interface DiscussPostItem {
  id: string
  publicId?: string
  authorProfileId: string
  authorName?: string | null
  authorProfilePublicId?: string | null
  authorProfileIsPublic?: boolean | null
  projectId?: string | null
  title: string
  body: string
  commentCount: number
  created: string
}

// A comment on a discussion post, optionally a reply to another comment.
// parentCommentId is null for top-level comments.
export interface DiscussCommentItem {
  id: string
  publicId?: string
  postId: string
  parentCommentId?: string | null
  authorProfileId: string
  authorName?: string | null
  authorProfilePublicId?: string | null
  authorProfileIsPublic?: boolean | null
  body: string
  created: string
  deleted?: string | null
}

// An incoming pending connection request
export interface IncomingConnectionRequest {
  id: string
  fromProfileId: string
  fromDisplayName: string
  fromAvatar?: string | null
  fromType?: string | null
  message?: string | null
  created: string
}

// An in-app notification
export interface NotificationItem {
  id: string
  type: string
  refModel?: string | null
  refId?: string | null
  readAt?: string | null
  created: string
}

// A typed URL on a project
export interface ProjectUrlItem {
  id: string
  kind: string   // W website, R repository, D docs, E demo, S social, X other
  url: string
  label?: string | null
}

// The GraphQL Project shape returned by the project queries/mutations
export interface Project {
  id: string
  publicId?: string
  instanceId: string
  name: string
  isOwner: boolean
  tagline?: string | null
  description?: string | null
  website?: string | null
  image?: string | null
  techStack?: string[] | null
  stage?: string | null             // I (idea), A (alpha), B (beta), G (GA)
  isOpenToCollaborators?: boolean | null
  isPromoted: boolean
  isDemoData?: boolean | null
  isPublic: boolean
  urls?: ProjectUrlItem[] | null
  interestCount?: number | null
  viewerIsInterested?: boolean | null
  status?: string
  created?: string
  updated?: string | null
}

// A collaboration plan
export interface CollaborationPlanItem {
  id: string
  projectId: string
  projectName?: string | null
  createdByProfileId: string
  createdByName?: string | null
  targetProfileId?: string | null
  targetName?: string | null
  status: string   // D draft, O open, A accepted, C completed, X cancelled
  title: string
  description?: string | null
  rolesNeeded?: string[] | null
  commitmentLevel?: string | null  // H hours/week, W weeks, M months
  compensation?: string | null     // N none, E equity, P paid
  deliverables?: string | null
  startBy?: string | null
  completedAt?: string | null
  created?: string
  updated?: string | null
}

// A step of a collaboration plan
export interface PlanStepItem {
  id: string
  planId: string
  seq: number
  title: string
  description?: string | null
  status: string   // P pending, A active, C completed, X skipped
}

// Project stage options
export const projectStages = [
  { value: 'I', name: 'Idea' },
  { value: 'A', name: 'Alpha' },
  { value: 'B', name: 'Beta' },
  { value: 'G', name: 'Generally available' }
]

// Human-readable project stage
export function projectStageName(stage: string | undefined | null): string {

  const found = projectStages.find(option => option.value === stage)

  return found?.name ?? ''
}

export const defaultUserPreferences = []

export interface UserProfile {
  id: string
  userId: string
  isAdmin: boolean
}
