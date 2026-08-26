import { getSession } from 'next-auth/react'
import type { GetServerSidePropsContext } from 'next'
import type { Session } from 'next-auth'

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

  // Return page props (profile is resolved client-side for now)
  return {
    props: {
      session,
      userProfileId: getSessionUserId(session),
      profile: null,
      clientUrl: process.env.CLIENT_URL,
      serverUrl: process.env.SERVER_URL
    }
  }
}