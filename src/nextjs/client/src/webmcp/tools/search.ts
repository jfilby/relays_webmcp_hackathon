//
// WebMCP tool factory for the global search tool. This is the agent
// equivalent of the header omnisearch: one search across profiles, projects
// and discussion posts, registered on every page. The factory takes its
// dependency (the search runner) as an explicit object, so the tool can be
// exercised by evals without a DOM or GraphQL.
//
import { profileTypeName, projectStageName } from '@/types/client-only-types'
import type { DiscussPostItem, Profile, Project } from '@/types/client-only-types'
import type { WebMcpTool } from '../webmcp'

// Maximum post body characters shown in the results
const postBodyPreviewLength = 160

// search: global search running the same queries as the header omnisearch.
export interface SearchToolDeps {
  onSearch: (query: string) => Promise<string>
}

export function searchTool(deps: SearchToolDeps): WebMcpTool {

  return {
    name: 'search',
    title: 'Search Relays',
    description: `Search Relays for profiles, projects and discussion posts matching text. This is the same search as the site's omnisearch. Returns the matches with their on-site links.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: `Text to match against profiles, projects and discussion posts. Empty to list everything.`
        }
      }
    },
    execute: (args) => {

      const query = typeof args.query === 'string' ? args.query : ''

      return deps.onSearch(query)
    }
  }
}

// A section of omnisearch results, with an optional per-section failure
// message from the underlying query.
export interface SearchResults {
  profiles?: Profile[] | null
  projects?: Project[] | null
  posts?: DiscussPostItem[] | null
  errors?: {
    profiles?: string
    projects?: string
    posts?: string
  }
}

// Formats omnisearch results as text for an agent: one section per result
// type, each match with its on-site link, mirroring the omnisearch dropdown.
export function formatSearchResults(query: string, results: SearchResults): string {

  const profiles = results.profiles ?? []
  const projects = results.projects ?? []
  const posts = results.posts ?? []

  const sections: string[] = []

  // Profiles
  if (results.errors?.profiles != null && results.errors.profiles !== '') {
    sections.push(`Profiles: search failed (${results.errors.profiles})`)
  } else if (profiles.length > 0) {
    const lines = profiles.map(profile =>
      `- ${profile.displayName} (${profileTypeName(profile.type)})` +
      `${profile.headline != null && profile.headline !== '' ? ` — ${profile.headline}` : ''}` +
      ` — /profiles/${profile.publicId}`)
    sections.push(`Profiles (${profiles.length}):\n${lines.join('\n')}`)
  }

  // Projects
  if (results.errors?.projects != null && results.errors.projects !== '') {
    sections.push(`Projects: search failed (${results.errors.projects})`)
  } else if (projects.length > 0) {
    const lines = projects.map(project =>
      `- ${project.name}` +
      `${project.stage != null && project.stage !== '' ? ` (${projectStageName(project.stage)})` : ''}` +
      `${project.tagline != null && project.tagline !== '' ? ` — ${project.tagline}` : ''}` +
      ` — /projects/${project.publicId}`)
    sections.push(`Projects (${projects.length}):\n${lines.join('\n')}`)
  }

  // Posts
  if (results.errors?.posts != null && results.errors.posts !== '') {
    sections.push(`Posts: search failed (${results.errors.posts})`)
  } else if (posts.length > 0) {
    const lines = posts.map(post =>
      `- ${post.title} (${post.commentCount} comments)` +
      `${post.body != null && post.body !== '' ? ` — ${post.body.slice(0, postBodyPreviewLength)}` : ''}` +
      ` — /discuss/${post.publicId}`)
    sections.push(`Posts (${posts.length}):\n${lines.join('\n')}`)
  }

  if (sections.length === 0) {
    return query.trim() !== ''
      ? `No profiles, projects or posts match "${query.trim()}".`
      : `No profiles, projects or posts found.`
  }

  return `Search results${query.trim() !== '' ? ` for "${query.trim()}"` : ''}:\n\n${sections.join('\n\n')}`
}
