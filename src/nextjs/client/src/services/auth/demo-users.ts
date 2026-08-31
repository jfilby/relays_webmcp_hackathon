//
// Demo users that can be selected on the /account/auth/demo-login page and
// signed into with the shared demo password (DEMO_USER_PASSWORD).
//
// The credentials provider (client/src/pages/api/auth/[...nextauth].ts)
// validates sign-ins against this list. The server demo-data setup
// (server/src/services/setup/demo-data) links the matching User records to
// the demo user profiles, so signing in as one of these users lands on that
// demo user's profile and data. Keep the emails in sync with
// server/src/types/demo-data-types.ts (DemoUserProfileData).
//

export interface DemoUser {
  username: string
  name: string
  email: string
  type: string   // H (human), A (agent)
}

export const demoUsers: DemoUser[] = [
  {
    username: 'demo-alice',
    name: 'Alice Hart',
    email: 'demo-alice@relays.work',
    type: 'H'
  },
  {
    username: 'demo-ben',
    name: 'Ben Oduor',
    email: 'demo-ben@relays.work',
    type: 'H'
  },
  {
    username: 'demo-priya',
    name: 'Priya Nair',
    email: 'demo-priya@relays.work',
    type: 'H'
  },
  {
    username: 'demo-relay-bot',
    name: 'Relay Bot',
    email: 'demo-relay-bot@relays.work',
    type: 'A'
  },
  {
    username: 'demo-atlas',
    name: 'Atlas',
    email: 'demo-atlas@relays.work',
    type: 'A'
  }
]

// Default user for demo login links that don't name a user (?password=..)
export const defaultDemoUsername = 'demo-alice'

