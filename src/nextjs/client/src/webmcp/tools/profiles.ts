//
// WebMCP tool factories for profile-related tools. Each factory returns the
// tool definition used by a page, taking its page dependencies (state
// accessors and submit functions) as an explicit object, so the tools can be
// exercised by evals without a DOM.
//
import type { ProfileFormValues } from '@/components/profiles/profile-form'
import type { WebMcpTool } from '../webmcp'
import type { SubmitResult } from './types'

type OnSubmitProfile = (submitValues?: ProfileFormValues) => SubmitResult

// Extracts the profile form values from tool args, keeping the current form
// value for any argument that is missing or invalid.
function buildProfileSubmitValues(args: Record<string, unknown>, current: ProfileFormValues): ProfileFormValues {

  return {
    displayName: typeof args.displayName === 'string' ? args.displayName : current.displayName,
    type: typeof args.type === 'string' && (args.type === 'H' || args.type === 'A') ? args.type : current.type,
    isPublic: typeof args.isPublic === 'boolean' ? args.isPublic : current.isPublic,
    headline: typeof args.headline === 'string' ? args.headline : current.headline,
    bio: typeof args.bio === 'string' ? args.bio : current.bio,
    location: typeof args.location === 'string' ? args.location : current.location,
    availabilityStatus: typeof args.availabilityStatus === 'string' && (args.availabilityStatus === 'A' || args.availabilityStatus === 'B' || args.availabilityStatus === 'U') ? args.availabilityStatus : current.availabilityStatus
  }
}

const profileSchema = {
  type: 'object' as const,
  properties: {
    displayName: {
      type: 'string',
      description: `Display name shown on the profile. Required.`
    },
    type: {
      type: 'string',
      enum: ['H', 'A'],
      description: `Profile type: H for Human, A for Agent.`
    },
    availabilityStatus: {
      type: 'string',
      enum: ['A', 'B', 'U'],
      description: `Availability status: A for Available, B for Busy, U for Unavailable.`
    },
    headline: {
      type: 'string',
      description: `Short headline shown on the profile.`
    },
    bio: {
      type: 'string',
      description: `Longer bio shown on the profile.`
    },
    location: {
      type: 'string',
      description: `Location shown on the profile.`
    },
    isPublic: {
      type: 'boolean',
      description: `Whether the profile is publicly visible.`
    }
  },
  required: ['displayName']
}

// search_profiles: directory search driven by the profiles page search form.
export interface SearchProfilesToolDeps {
  onSearch: (query: string, type: string) => void
}

export function searchProfilesTool(deps: SearchProfilesToolDeps): WebMcpTool {

  return {
    name: 'search_profiles',
    title: 'Search profiles',
    description: `Search the Relays network directory for profiles by text and type. Returns matches rendered on the page.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: `Text to match against profile names and details. Empty to list all profiles.`
        },
        type: {
          type: 'string',
          enum: ['H', 'A'],
          description: `Profile type: H for Human, A for Agent. Omit to include all types.`
        }
      }
    },
    execute: (args) => {

      const query = typeof args.query === 'string' ? args.query : ''
      const type = typeof args.type === 'string' ? args.type : ''

      deps.onSearch(query, type === '' || type === 'H' || type === 'A' ? type : '')

      const typeLabel = type === 'H' ? 'human' : type === 'A' ? 'agent' : 'all'

      return `Searching profiles${query.trim() !== '' ? ` matching "${query.trim()}"` : ''} (type: ${typeLabel})`
    }
  }
}

// create_profile: submits the create-profile form. Missing or invalid
// arguments keep the current form values.
export interface CreateProfileToolDeps {
  getValues: () => ProfileFormValues
  onSubmit: OnSubmitProfile
}

export function createProfileTool(deps: CreateProfileToolDeps): WebMcpTool {

  return {
    name: 'create_profile',
    title: 'Create profile',
    description: `Create the signed-in user's Relays profile from the create-profile form on this page. The page redirects to the profile once creation succeeds.`,
    inputSchema: profileSchema,
    execute: (args) => {

      const submitValues = buildProfileSubmitValues(args, deps.getValues())

      const result = deps.onSubmit(submitValues)

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return `Creating your profile "${submitValues.displayName}"`
    }
  }
}

// update_profile: submits the edit-profile form. Fields omitted from the
// arguments keep their current values.
export interface UpdateProfileToolDeps {
  getValues: () => ProfileFormValues
  onSubmit: OnSubmitProfile
}

export function updateProfileTool(deps: UpdateProfileToolDeps): WebMcpTool {

  return {
    name: 'update_profile',
    title: 'Update profile',
    description: `Update the signed-in user's Relays profile from the edit-profile form on this page. Fields omitted from the arguments keep their current values. The page redirects to the profile once the update succeeds.`,
    inputSchema: profileSchema,
    execute: (args) => {

      const submitValues = buildProfileSubmitValues(args, deps.getValues())

      const result = deps.onSubmit(submitValues)

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return `Updating your profile "${submitValues.displayName}"`
    }
  }
}

// add_profile_skill: adds a skill with a proficiency level.
export interface AddProfileSkillToolDeps {
  onAddSkill: (submitName?: string, submitLevel?: string) => Promise<SubmitResult>
}

export function addProfileSkillTool(deps: AddProfileSkillToolDeps): WebMcpTool {

  return {
    name: 'add_profile_skill',
    title: 'Add profile skill',
    description: `Add a skill with a proficiency level to the signed-in user's Relays profile. The skills list on this page refreshes once the skill is added.`,
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: `Skill name, e.g. TypeScript. Required.`
        },
        level: {
          type: 'string',
          enum: ['B', 'I', 'A', 'E'],
          description: `Proficiency level: B for Beginner, I for Intermediate, A for Advanced, E for Expert. Defaults to Intermediate.`
        }
      },
      required: ['name']
    },
    execute: async (args) => {

      const name = typeof args.name === 'string' ? args.name : ''
      const level = typeof args.level === 'string' && (args.level === 'B' || args.level === 'I' || args.level === 'A' || args.level === 'E') ? args.level : 'I'

      const result = await deps.onAddSkill(name, level)

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}

// add_profile_link: adds a link with a kind.
export interface AddProfileLinkToolDeps {
  // Current link kind selected on the page, used when the argument is omitted
  // or invalid.
  getKind: () => string
  onAddLink: (submitKind?: string, submitUrl?: string) => Promise<SubmitResult>
}

export function addProfileLinkTool(deps: AddProfileLinkToolDeps): WebMcpTool {

  return {
    name: 'add_profile_link',
    title: 'Add profile link',
    description: `Add a link (website, GitHub, LinkedIn, repository, MCP endpoint, or other) to the signed-in user's Relays profile. The links list on this page refreshes once the link is added.`,
    inputSchema: {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          enum: ['W', 'G', 'L', 'R', 'M', 'X'],
          description: `Link kind: W for Website, G for GitHub, L for LinkedIn, R for Repository, M for MCP endpoint, X for Other. Defaults to Website.`
        },
        url: {
          type: 'string',
          description: `Absolute URL starting with http:// or https://. Required.`
        }
      },
      required: ['url']
    },
    execute: async (args) => {

      const kind = typeof args.kind === 'string' && (args.kind === 'W' || args.kind === 'G' || args.kind === 'L' || args.kind === 'R' || args.kind === 'M' || args.kind === 'X') ? args.kind : deps.getKind()
      const url = typeof args.url === 'string' ? args.url : ''

      const result = await deps.onAddLink(kind, url)

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}

// create_profile on the launched landing page hero form.
export interface CreateLandingProfileToolDeps {
  // True when the hero form is usable: signed in and no profile yet.
  isAvailable: () => boolean
  // Current email-updates checkbox state, used when the argument is omitted.
  getUpdates: () => boolean
  onCreate: (displayName: string, updates: boolean) => void
}

export function createLandingProfileTool(deps: CreateLandingProfileToolDeps): WebMcpTool {

  return {
    name: 'create_profile',
    title: 'Create profile',
    description: `Create the signed-in user's Relays profile from the hero form using a display name and an optional email-updates preference. The page reloads once the profile is created; the outcome is shown in the page alert.`,
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: `Display name for the new profile.`
        },
        updates: {
          type: 'boolean',
          description: `Whether to also sign up for email updates. Defaults to the current checkbox state.`
        }
      },
      required: ['name']
    },
    execute: (args) => {

      if (deps.isAvailable() !== true) {
        throw new Error(`The profile creation form is only available to signed-in users without a profile`)
      }

      const displayName = typeof args.name === 'string' ? args.name.trim() : ''

      if (displayName === '') {
        throw new Error(`A display name is required to create a profile`)
      }

      const updatesPreference = typeof args.updates === 'boolean' ? args.updates : deps.getUpdates()

      deps.onCreate(displayName, updatesPreference)

      return `Creating profile "${displayName}"...`
    }
  }
}

// connect_profile: sends a connection request to the viewed profile.
export interface ConnectProfileToolDeps {
  isSignedIn: () => boolean
  isOwner: () => boolean
  // 'none' when no connection exists, 'pending' when a request is awaiting a
  // response, 'connected' when the profiles are connected.
  getConnectionStatus: () => 'none' | 'pending' | 'connected'
  onConnect: (submitMessage?: string) => Promise<SubmitResult>
}

export function connectProfileTool(deps: ConnectProfileToolDeps): WebMcpTool {

  return {
    name: 'connect_profile',
    title: 'Connect with profile',
    description: `Send a connection request to this Relays profile, with an optional message. The connection becomes pending until the recipient accepts.`,
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: `Optional message included with the connection request.`
        }
      }
    },
    execute: async (args) => {

      if (deps.isSignedIn() !== true) {
        throw new Error(`Sign in to connect with profiles`)
      }

      if (deps.isOwner() === true) {
        throw new Error(`You cannot connect with your own profile`)
      }

      const status = deps.getConnectionStatus()

      if (status === 'pending') {
        throw new Error(`A connection request is already pending for this profile`)
      }

      if (status === 'connected') {
        throw new Error(`You are already connected with this profile`)
      }

      const message = typeof args.message === 'string' && args.message.trim() !== '' ?
        args.message :
        undefined

      const result = await deps.onConnect(message)

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}

// remove_profile_connection: removes the connection with the viewed profile.
export interface RemoveProfileConnectionToolDeps {
  isSignedIn: () => boolean
  getConnectionStatus: () => 'none' | 'pending' | 'connected'
  onRemove: () => Promise<SubmitResult>
}

export function removeProfileConnectionTool(deps: RemoveProfileConnectionToolDeps): WebMcpTool {

  return {
    name: 'remove_profile_connection',
    title: 'Remove profile connection',
    description: `Remove the connection between the signed-in user and this Relays profile.`,
    inputSchema: {
      type: 'object',
      properties: {}
    },
    execute: async () => {

      if (deps.isSignedIn() !== true) {
        throw new Error(`Sign in to manage connections`)
      }

      if (deps.getConnectionStatus() !== 'connected') {
        throw new Error(`You are not connected with this profile`)
      }

      const result = await deps.onRemove()

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}
