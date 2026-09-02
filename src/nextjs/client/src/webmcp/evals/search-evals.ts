//
// Evals for the global WebMCP search tool: search (the agent equivalent of
// the omnisearch) and the result formatter.
//
import {
  check,
  checkDeepEqual,
  checkEqual,
  evals
} from './harness'
import { formatSearchResults, searchTool } from '../tools/search'
import type { DiscussPostItem, Profile, Project } from '@/types/client-only-types'

evals('search: tool awaits the omnisearch and returns its results', async () => {

  const searches: string[] = []

  const tool = searchTool({
    onSearch: async (query) => {

      searches.push(query)

      return `results for ${query.trim()}`
    }
  })

  checkEqual(tool.name, 'search', 'tool name')

  const result = await tool.execute({ query: '  orbit  ' })

  checkEqual(result, `results for orbit`, 'returned results')
  checkDeepEqual(searches, ['  orbit  '], 'search calls')
})

evals('search: tool defaults a missing query to empty', async () => {

  const searches: string[] = []

  const tool = searchTool({
    onSearch: async (query) => {

      searches.push(query)

      return 'no matches'
    }
  })

  const result = await tool.execute({ query: 42 })

  checkEqual(result, 'no matches', 'returned results')
  checkDeepEqual(searches, [''], 'search calls with sanitized query')
})

evals('search: formatter renders sections with links', () => {

  const profiles: Profile[] = [
    { id: '1', publicId: 'prof-1', type: 'A', displayName: 'Orbit Agent', headline: 'Plans sprints' }
  ]

  const projects: Project[] = [
    { id: '2', publicId: 'proj-1', instanceId: 'i1', name: 'Relays', stage: 'B', tagline: 'Network for humans and agents', isOwner: false, isPromoted: false, isPublic: true }
  ]

  const posts: DiscussPostItem[] = [
    { id: '3', publicId: 'post-1', authorProfileId: 'p1', authorName: 'Jane', title: 'Launch feedback', body: 'Great launch', commentCount: 4, created: '2026-01-01' }
  ]

  const text = formatSearchResults('relays', {
    profiles: profiles,
    projects: projects,
    posts: posts
  })

  check(text.includes('Profiles (1)'), 'profiles section header')
  check(text.includes('Orbit Agent (Agent) — Plans sprints — /profiles/prof-1'), 'profile line')
  check(text.includes('Projects (1)'), 'projects section header')
  check(text.includes('Relays (Beta) — Network for humans and agents — /projects/proj-1'), 'project line')
  check(text.includes('Posts (1)'), 'posts section header')
  check(text.includes('Launch feedback (4 comments) — Great launch — /discuss/post-1'), 'post line')
  check(text.includes('Search results for "relays"'), 'results header')
})

evals('search: formatter reports no matches', () => {

  const text = formatSearchResults('  zzz  ', { profiles: [], projects: null, posts: undefined })

  checkEqual(text, `No profiles, projects or posts match "zzz".`, 'no matches message')
})

evals('search: formatter reports per-section failures without losing others', () => {

  const profiles: Profile[] = [
    { id: '1', publicId: 'prof-1', type: 'H', displayName: 'Jane Doe' }
  ]

  const text = formatSearchResults('', {
    profiles: profiles,
    projects: [],
    posts: [],
    errors: { projects: 'upstream timeout' }
  })

  check(text.includes('Jane Doe (Human) — /profiles/prof-1'), 'profile line kept')
  check(text.includes('Projects: search failed (upstream timeout)'), 'projects failure reported')
  check(text.includes('Search results:'), 'header without query')
})
