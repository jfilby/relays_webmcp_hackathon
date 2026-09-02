//
// Registers the WebMCP tools that are available on every page. Mounted once
// from _app, so agents can search the site from anywhere, the same way the
// header omnisearch is available everywhere.
//
import { useApolloClient } from '@apollo/client/react'
import type { ApolloClient, DocumentNode } from '@apollo/client'
import { searchDiscussPostsQuery } from '@/apollo/discussion'
import { searchProfilesQuery } from '@/apollo/profiles'
import { searchProjectsQuery } from '@/apollo/projects'
import { searchTool, formatSearchResults } from './tools/search'
import { useWebMcpTools } from './webmcp'
import type { DiscussPostItem, Profile, Project } from '@/types/client-only-types'
import type { SearchResults } from './tools/search'

interface ProfilesResults {
  status: boolean
  message?: string | null
  profiles?: Profile[] | null
}

interface ProjectsResults {
  status: boolean
  message?: string | null
  projects?: Project[] | null
}

interface PostsResults {
  status: boolean
  message?: string | null
  posts?: DiscussPostItem[] | null
}

// Runs one of the omnisearch queries, returning its items or a failure
// message. GraphQL and HTTP errors are normalized into the failure message so
// one broken section does not lose the others.
async function fetchSection<TResult extends { status: boolean; message?: string | null }, TItems>(
  client: ApolloClient,
  query: DocumentNode,
  variables: Record<string, unknown>,
  resultKey: string,
  getItems: (section: TResult) => TItems[] | null | undefined): Promise<{ items: TItems[]; error?: string }> {

  try {

    const { data } = await client.query<TResult>({
      query: query,
      variables: variables,
      fetchPolicy: 'no-cache'
    })

    const section = (data as unknown as Record<string, TResult>)[resultKey]

    if (section == null || section.status === false) {
      return { items: [], error: section?.message ?? 'search failed' }
    }

    return { items: getItems(section) ?? [] }

  } catch (error) {
    return { items: [], error: error instanceof Error ? error.message : String(error) }
  }
}

// Runs the same three queries as the header omnisearch in parallel and
// formats the combined results as text for the agent.
async function runOmnisearch(client: ApolloClient, query: string): Promise<string> {

  const search = query.trim()

  const [profiles, projects, posts] = await Promise.all([
    fetchSection<ProfilesResults, Profile>(
      client,
      searchProfilesQuery,
      { search: search, type: undefined },
      'searchProfiles',
      (section) => section.profiles),
    fetchSection<ProjectsResults, Project>(
      client,
      searchProjectsQuery,
      { search: search, isPromoted: undefined },
      'searchProjects',
      (section) => section.projects),
    fetchSection<PostsResults, DiscussPostItem>(
      client,
      searchDiscussPostsQuery,
      { search: search },
      'searchDiscussPosts',
      (section) => section.posts)
  ])

  const results: SearchResults = {
    profiles: profiles.items,
    projects: projects.items,
    posts: posts.items,
    errors: {
      profiles: profiles.error,
      projects: projects.error,
      posts: posts.error
    }
  }

  return formatSearchResults(search, results)
}

export default function GlobalWebMcpTools() {

  // GraphQL
  const apolloClient = useApolloClient()

  // WebMCP
  useWebMcpTools(() => [
    searchTool({
      onSearch: (query) => runOmnisearch(apolloClient, query)
    })
  ])

  // Render
  return (
    <></>
  )
}
