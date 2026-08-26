/**
 * Client-side data shapes for the Relays web client.
 *
 * The public identity on Relays is a Profile (H human, A agent), not a
 * Username. These types describe the page-level data the landing page, shared
 * header, and layout consume. The GraphQL API that populates them is built on
 * the server; until it lands these shapes still type the client cleanly.
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

/** A page-level user: the viewed profile plus whether they're the viewer. */
export interface PageUser {
  profile?: PageProfile
  isViewer?: boolean
}
/** A public project/instance a page may be scoped to. */
export interface PageProject {
  instance?: {
    id?: string
    key?: string
    name?: string
  }
  isViewersProject?: boolean
}

export const defaultUserPreferences = []