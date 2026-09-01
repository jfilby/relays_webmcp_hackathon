//
// Evals for the profile WebMCP tools: search_profiles, create_profile
// (add-profile page and landing-page hero), update_profile, add_profile_skill
// and add_profile_link.
//
import {
  check,
  checkDeepEqual,
  checkEqual,
  checkThrows,
  evals
} from './harness'
import {
  addProfileLinkTool,
  addProfileSkillTool,
  connectProfileTool,
  createLandingProfileTool,
  createProfileTool,
  removeProfileConnectionTool,
  searchProfilesTool,
  updateProfileTool
} from '../tools/profiles'
import type { ProfileFormValues } from '@/components/profiles/profile-form'

const emptyProfileValues: ProfileFormValues = {
  displayName: '',
  type: 'H',
  isPublic: true,
  headline: '',
  bio: '',
  location: '',
  availabilityStatus: 'A'
}

evals('profiles: search_profiles runs the search with query and type', () => {

  const searches: Array<{ query: string; type: string }> = []

  const tool = searchProfilesTool({
    onSearch: (query, type) => {
      searches.push({ query, type })
    }
  })

  checkEqual(tool.name, 'search_profiles', 'tool name')

  const result = tool.execute({ query: '  alice  ', type: 'A' })

  checkEqual(result, `Searching profiles matching "alice" (type: agent)`, 'return message')
  checkDeepEqual(searches, [{ query: '  alice  ', type: 'A' }], 'search calls')
})

evals('profiles: search_profiles sanitizes invalid type and defaults query', () => {

  const searches: Array<{ query: string; type: string }> = []

  const tool = searchProfilesTool({
    onSearch: (query, type) => {
      searches.push({ query, type })
    }
  })

  const result = tool.execute({ type: 'Z' })

  checkEqual(result, `Searching profiles (type: all)`, 'return message')
  checkDeepEqual(searches, [{ query: '', type: '' }], 'search calls with sanitized values')
})

evals('profiles: create_profile submits sanitized form values', () => {

  const submitted: ProfileFormValues[] = []

  const tool = createProfileTool({
    getValues: () => emptyProfileValues,
    onSubmit: (submitValues) => {

      submitted.push(submitValues!)

      return { status: 'ok', message: `Profile creation started` }
    }
  })

  checkEqual(tool.name, 'create_profile', 'tool name')
  checkDeepEqual(tool.inputSchema.required, ['displayName'], 'required fields')

  const result = tool.execute({
    displayName: '  Alice  ',
    type: 'A',
    availabilityStatus: 'B',
    headline: 'Builder',
    bio: 'Builds things',
    location: 'Lisbon',
    isPublic: false
  })

  checkEqual(result, `Creating your profile "  Alice  "`, 'return message')
  checkDeepEqual(submitted, [{
    displayName: '  Alice  ',
    type: 'A',
    isPublic: false,
    headline: 'Builder',
    bio: 'Builds things',
    location: 'Lisbon',
    availabilityStatus: 'B'
  }], 'submitted values')
})

evals('profiles: create_profile falls back to current form values', () => {

  const current: ProfileFormValues = {
    displayName: 'Current',
    type: 'H',
    isPublic: true,
    headline: 'Current headline',
    bio: 'Current bio',
    location: 'Porto',
    availabilityStatus: 'U'
  }

  const submitted: ProfileFormValues[] = []

  const tool = createProfileTool({
    getValues: () => current,
    onSubmit: (submitValues) => {

      submitted.push(submitValues!)

      return { status: 'ok', message: `Profile creation started` }
    }
  })

  tool.execute({ type: 'X' })

  checkDeepEqual(submitted, [current], 'invalid type falls back, other fields keep current values')
})

evals('profiles: create_profile surfaces validation errors', async () => {

  const tool = createProfileTool({
    getValues: () => emptyProfileValues,
    onSubmit: () => ({ status: 'error', message: `Display name is required` })
  })

  await checkThrows(() => tool.execute({}), `Display name is required`, 'execute should throw')
})

evals('profiles: update_profile merges args over current values', () => {

  const current: ProfileFormValues = {
    displayName: 'Current',
    type: 'H',
    isPublic: true,
    headline: 'Current headline',
    bio: 'Current bio',
    location: 'Porto',
    availabilityStatus: 'A'
  }

  const submitted: ProfileFormValues[] = []

  const tool = updateProfileTool({
    getValues: () => current,
    onSubmit: (submitValues) => {

      submitted.push(submitValues!)

      return { status: 'ok', message: `Profile update started` }
    }
  })

  checkEqual(tool.name, 'update_profile', 'tool name')

  const result = tool.execute({ displayName: 'Renamed', availabilityStatus: 'B' })

  checkEqual(result, `Updating your profile "Renamed"`, 'return message')
  checkDeepEqual(submitted, [{
    displayName: 'Renamed',
    type: 'H',
    isPublic: true,
    headline: 'Current headline',
    bio: 'Current bio',
    location: 'Porto',
    availabilityStatus: 'B'
  }], 'merged values keep untouched fields')
})

evals('profiles: add_profile_skill defaults level to Intermediate', async () => {

  const calls: Array<{ name: string; level: string }> = []

  const tool = addProfileSkillTool({
    onAddSkill: async (submitName, submitLevel) => {

      calls.push({ name: submitName ?? '', level: submitLevel ?? '' })

      return { status: 'ok', message: `Skill added` }
    }
  })

  checkEqual(tool.name, 'add_profile_skill', 'tool name')
  checkDeepEqual(tool.inputSchema.required, ['name'], 'required fields')

  const result = await tool.execute({ name: 'TypeScript' })

  checkEqual(result, `Skill added`, 'return message')
  checkDeepEqual(calls, [{ name: 'TypeScript', level: 'I' }], 'level defaults to Intermediate')
})

evals('profiles: add_profile_skill validates level and reports errors', async () => {

  const calls: Array<{ name: string; level: string }> = []

  const tool = addProfileSkillTool({
    onAddSkill: async (submitName, submitLevel) => {

      calls.push({ name: submitName ?? '', level: submitLevel ?? '' })

      return { status: 'error', message: `Skill name is required` }
    }
  })

  await checkThrows(() => tool.execute({ name: 'TS', level: 'expert' }), `Skill name is required`, 'mutation error surfaces')

  checkDeepEqual(calls[0], { name: 'TS', level: 'I' }, 'invalid level falls back to Intermediate')
})

evals('profiles: add_profile_link passes kind and url', async () => {

  const calls: Array<{ kind: string; url: string }> = []

  const tool = addProfileLinkTool({
    getKind: () => 'W',
    onAddLink: async (submitKind, submitUrl) => {

      calls.push({ kind: submitKind ?? '', url: submitUrl ?? '' })

      return { status: 'ok', message: `Link added` }
    }
  })

  checkEqual(tool.name, 'add_profile_link', 'tool name')
  checkDeepEqual(tool.inputSchema.required, ['url'], 'required fields')

  const result = await tool.execute({ kind: 'M', url: 'https://example.com/mcp' })

  checkEqual(result, `Link added`, 'return message')
  checkDeepEqual(calls, [{ kind: 'M', url: 'https://example.com/mcp' }], 'kind and url passed through')
})

evals('profiles: add_profile_link falls back to the page link kind', async () => {

  const calls: Array<{ kind: string; url: string }> = []

  const tool = addProfileLinkTool({
    getKind: () => 'G',
    onAddLink: async (submitKind, submitUrl) => {

      calls.push({ kind: submitKind ?? '', url: submitUrl ?? '' })

      return { status: 'ok', message: `Link added` }
    }
  })

  await tool.execute({ kind: 'Q', url: 'https://github.com/example' })

  checkDeepEqual(calls, [{ kind: 'G', url: 'https://github.com/example' }], 'invalid kind falls back to page state')
})

evals('profiles: landing create_profile requires signed-in user without profile', async () => {

  let availability = false

  const created: Array<{ displayName: string; updates: boolean }> = []

  const tool = createLandingProfileTool({
    isAvailable: () => availability,
    getUpdates: () => true,
    onCreate: (displayName, updates) => {
      created.push({ displayName, updates })
    }
  })

  checkEqual(tool.name, 'create_profile', 'tool name')

  await checkThrows(() => tool.execute({ name: 'Alice' }), `only available to signed-in users`, 'unavailable form should throw')

  availability = true

  const result = tool.execute({ name: '  Alice  ' })

  checkEqual(result, `Creating profile "Alice"...`, 'return message trims name')
  checkDeepEqual(created, [{ displayName: 'Alice', updates: true }], 'updates default from checkbox state')
})

evals('profiles: landing create_profile validates name and updates override', async () => {

  const created: Array<{ displayName: string; updates: boolean }> = []

  const tool = createLandingProfileTool({
    isAvailable: () => true,
    getUpdates: () => false,
    onCreate: (displayName, updates) => {
      created.push({ displayName, updates })
    }
  })

  await checkThrows(() => tool.execute({ name: '   ' }), `display name is required`, 'blank name should throw')

  tool.execute({ name: 'Bob', updates: false })

  checkDeepEqual(created, [{ displayName: 'Bob', updates: false }], 'explicit updates overrides checkbox')
})

evals('profiles: tools expose descriptions for agent discoverability', () => {

  const tools = [
    searchProfilesTool({ onSearch: () => undefined }),
    createProfileTool({
      getValues: () => emptyProfileValues,
      onSubmit: () => ({ status: 'ok', message: '' })
    }),
    updateProfileTool({
      getValues: () => emptyProfileValues,
      onSubmit: () => ({ status: 'ok', message: '' })
    }),
    addProfileSkillTool({ onAddSkill: async () => ({ status: 'ok', message: '' }) }),
    addProfileLinkTool({
      getKind: () => 'W',
      onAddLink: async () => ({ status: 'ok', message: '' })
    }),
    createLandingProfileTool({
      isAvailable: () => true,
      getUpdates: () => true,
      onCreate: () => undefined
    })
  ]

  for (const tool of tools) {

    check(typeof tool.description === 'string' && tool.description.length > 20, `${tool.name} has a description`)
    check(tool.inputSchema.type === 'object', `${tool.name} has an object input schema`)
    check(typeof tool.execute === 'function', `${tool.name} has an execute function`)
  }
})

evals('profiles: connect_profile sends an optional message', async () => {

  const sent: Array<string | undefined> = []

  const tool = connectProfileTool({
    isSignedIn: () => true,
    isOwner: () => false,
    getConnectionStatus: () => 'none',
    onConnect: async (submitMessage) => {

      sent.push(submitMessage)

      return { status: 'ok', message: `Connection request sent` }
    }
  })

  checkEqual(tool.name, 'connect_profile', 'tool name')

  const result = await tool.execute({ message: 'Let us collaborate' })

  checkEqual(result, `Connection request sent`, 'return message from connect')
  checkDeepEqual(sent, ['Let us collaborate'], 'message passed through')

  const noMessage = await tool.execute({})

  checkEqual(noMessage, `Connection request sent`, 'connect without message')
  checkDeepEqual(sent, ['Let us collaborate', undefined], 'omitted message passes undefined')
})

evals('profiles: connect_profile rejects signed-out, owner and existing connections', async () => {

  const base = (status: 'none' | 'pending' | 'connected', owner: boolean, signedIn: boolean) => connectProfileTool({
    isSignedIn: () => signedIn,
    isOwner: () => owner,
    getConnectionStatus: () => status,
    onConnect: async () => ({ status: 'ok', message: '' })
  })

  await checkThrows(() => base('none', false, false).execute({}), `Sign in to connect with profiles`, 'signed-out should throw')
  await checkThrows(() => base('none', true, true).execute({}), `You cannot connect with your own profile`, 'own profile should throw')
  await checkThrows(() => base('pending', false, true).execute({}), `already pending`, 'pending connection should throw')
  await checkThrows(() => base('connected', false, true).execute({}), `already connected`, 'connected profile should throw')
})

evals('profiles: remove_profile_connection only works when connected', async () => {

  const removed: number[] = []

  const tool = removeProfileConnectionTool({
    isSignedIn: () => true,
    getConnectionStatus: () => 'connected',
    onRemove: async () => {

      removed.push(1)

      return { status: 'ok', message: `Connection removed` }
    }
  })

  checkEqual(tool.name, 'remove_profile_connection', 'tool name')

  const result = await tool.execute({})

  checkEqual(result, `Connection removed`, 'return message from remove')
  checkEqual(removed.length, 1, 'remove called once')

  const notConnected = removeProfileConnectionTool({
    isSignedIn: () => true,
    getConnectionStatus: () => 'none',
    onRemove: async () => ({ status: 'ok', message: '' })
  })

  await checkThrows(() => notConnected.execute({}), `You are not connected with this profile`, 'not connected should throw')

  const signedOut = removeProfileConnectionTool({
    isSignedIn: () => false,
    getConnectionStatus: () => 'connected',
    onRemove: async () => ({ status: 'ok', message: '' })
  })

  await checkThrows(() => signedOut.execute({}), `Sign in to manage connections`, 'signed-out should throw')
})
