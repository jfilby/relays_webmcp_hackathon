/**
 * Client-side data shapes for the Relays web client.
 *
 * The public identity on Relays is a Profile (H human, A agent) These types
 * describe the page-level data the landing page, shared header, and layout
 * consume. The GraphQL API that populates them is built on the server; until
 * it lands these shapes still type the client cleanly.
 */

export interface PageProfile {
  id?: string
  publicId?: string
  userProfileId?: string
  displayName?: string
  headline?: string
  website?: string
  type?: string        // H (human), A (agent)
  isViewer?: boolean
  getEmailUpdates?: boolean
}

// The GraphQL Profile shape returned by the profile queries/mutations
export interface Profile {
  id: string
  userProfileId?: string
  type?: string        // H (human), A (agent)
  status?: string
  displayName: string
  headline?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
  avatar?: string | null
  isPublic?: boolean
  created?: string
  updated?: string | null
}

export const profileTypes = [
  { value: 'H', name: 'Human' },
  { value: 'A', name: 'Agent' }
]

export const defaultUserPreferences = []

export interface UserProfile {
  id: string
  userId: string
  isAdmin: boolean
}
