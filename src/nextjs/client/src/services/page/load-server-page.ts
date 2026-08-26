import { getSession } from 'next-auth/react'
import type { GetServerSidePropsContext } from 'next'
import type { Session } from 'next-auth'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { getOrCreateUserByEmailMutation } from '@/apollo/load-server-start'
import { defaultUserPreferences } from '@/types/client-only-types'

export interface PageContext {
  serverAction?: string

  verifyLoggedInUsersOnly?: boolean
  verifyAdminUsersOnly?: boolean
}

/**
 * Auth.js appends `id` to the session user when the session callback maps the
 * User model id (see the relays server's `[...nextauth].ts`). This isn't part
 * of the default Session type, so establish it with a type guard.
 */
type SessionUserWithId = { id: string } & NonNullable<Session['user']>

function isSessionUserWithId(user: NonNullable<Session['user']>): user is SessionUserWithId {
  return 'id' in user && typeof user.id === 'string'
}

export function getSessionUserId(session: Session | null): string | null {

  if (session?.user == null) {
    return null
  }

  return isSessionUserWithId(session.user) ? session.user.id : null
}

// Get-or-create the signed-in user's UserProfile record (server-side), so the
// page identifies the user by their UserProfile id (the identity all Relays
// records link to) rather than the Auth.js User id. When the GraphQL server
// isn't reachable (e.g. a build) falls back to the session User id.
async function getUserProfileId(session: Session | null): Promise<string | null> {

  const sessionUserId = getSessionUserId(session)

  if (session == null ||
      session.user?.email == null) {
    return sessionUserId
  }

  // ApolloClient
  const apolloClient = new ApolloClient({
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL_FULL
    }),
    cache: new InMemoryCache(),
  })

  try {
    const { data } = await apolloClient.mutate<{
      getOrCreateUserByEmail: { id: string }
    }>({
      mutation: getOrCreateUserByEmailMutation,
      variables: {
        email: session.user.email,
        defaultUserPreferences: JSON.stringify(defaultUserPreferences)
      }
    })

    const userProfileId = data?.getOrCreateUserByEmail?.id

    return userProfileId != null ? userProfileId : sessionUserId
  } catch (error) {
    console.error(`getUserProfileId(): error: ${error}`)
    return sessionUserId
  }
}

// Loads the server-side props each Pages-router page needs.
export async function loadServerPage(
  context: GetServerSidePropsContext,
  pageContext: PageContext) {

  // Session
  const session = await getSession(context)

  // Logged-in-only pages redirect elsewhere
  if (pageContext.verifyLoggedInUsersOnly === true &&
    session == null) {

    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false
      },
      props: {}
    }
  }

  // Resolve the UserProfile id (the id all Relays records link to)
  const userProfileId = await getUserProfileId(session)

  // Return page props (profile is resolved client-side for now)
  return {
    props: {
      session,
      userProfileId,
      profile: null,
      clientUrl: process.env.CLIENT_URL,
      serverUrl: process.env.SERVER_URL
    }
  }
}