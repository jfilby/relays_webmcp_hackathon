//
// Evals for the project WebMCP tools: search_projects and create_project.
//
import {
  check,
  checkDeepEqual,
  checkEqual,
  checkThrows,
  evals
} from './harness'
import {
  createProjectTool,
  createProjectPostTool,
  searchProjectsTool,
  toggleProjectInterestTool
} from '../tools/projects'
import type { ProjectFormValues } from '@/components/projects/project-form'

const emptyProjectValues: ProjectFormValues = {
  name: '',
  tagline: '',
  description: '',
  website: '',
  image: '',
  techStack: '',
  stage: '',
  isOpenToCollaborators: false,
  isPromoted: false,
  isPublic: true
}

evals('projects: search_projects runs the search with query and promoted', () => {

  const searches: Array<{ query: string; promoted: boolean }> = []

  const tool = searchProjectsTool({
    onSearch: (query, promoted) => {
      searches.push({ query, promoted })
    }
  })

  checkEqual(tool.name, 'search_projects', 'tool name')

  const result = tool.execute({ query: '  relays  ', promoted: true })

  checkEqual(result, `Searching projects matching "relays" (showcased only)`, 'return message')
  checkDeepEqual(searches, [{ query: '  relays  ', promoted: true }], 'search calls')
})

evals('projects: search_projects defaults query and promoted', () => {

  const searches: Array<{ query: string; promoted: boolean }> = []

  const tool = searchProjectsTool({
    onSearch: (query, promoted) => {
      searches.push({ query, promoted })
    }
  })

  const result = tool.execute({ promoted: 'yes' })

  checkEqual(result, `Searching projects`, 'return message')
  checkDeepEqual(searches, [{ query: '', promoted: false }], 'invalid promoted falls back to false')
})

evals('projects: create_project maps args onto form values', () => {

  const submitted: ProjectFormValues[] = []

  const tool = createProjectTool({
    getValues: () => emptyProjectValues,
    onSubmit: (submitValues) => {

      submitted.push(submitValues!)

      return { status: 'ok', message: `Creating project "Relays"` }
    }
  })

  checkEqual(tool.name, 'create_project', 'tool name')
  checkDeepEqual(tool.inputSchema.required, ['name'], 'required fields')

  const result = tool.execute({
    name: 'Relays',
    imageUrl: 'https://example.com/img.png',
    technologies: 'React, Node.js',
    stage: 'G',
    isOpenToCollaborators: true,
    isPromoted: true,
    isPublic: false
  })

  checkEqual(result, `Creating project "Relays"`, 'return message from submit')
  checkDeepEqual(submitted, [{
    ...emptyProjectValues,
    name: 'Relays',
    image: 'https://example.com/img.png',
    techStack: 'React, Node.js',
    stage: 'G',
    isOpenToCollaborators: true,
    isPromoted: true,
    isPublic: false
  }], 'arg mapping (imageUrl -> image, technologies -> techStack)')
})

evals('projects: create_project keeps current values for omitted args', () => {

  const current: ProjectFormValues = {
    ...emptyProjectValues,
    name: 'Existing',
    stage: 'A',
    isPublic: false
  }

  const submitted: ProjectFormValues[] = []

  const tool = createProjectTool({
    getValues: () => current,
    onSubmit: (submitValues) => {

      submitted.push(submitValues!)

      return { status: 'ok', message: `Creating project "Existing"` }
    }
  })

  tool.execute({ stage: 'Z' })

  checkDeepEqual(submitted, [current], 'invalid stage falls back, other fields keep current values')
})

evals('projects: create_project surfaces validation errors', async () => {

  const tool = createProjectTool({
    getValues: () => emptyProjectValues,
    onSubmit: () => ({ status: 'error', message: `Name is required` })
  })

  await checkThrows(() => tool.execute({}), `Name is required`, 'execute should throw')
})

evals('projects: toggle_project_interest toggles by default', async () => {

  const toggles: Array<boolean | undefined> = []

  const tool = toggleProjectInterestTool({
    isSignedIn: () => true,
    isInterested: () => false,
    onToggleInterest: async (desired) => {

      toggles.push(desired)

      return { status: 'ok', message: `You are now interested` }
    }
  })

  checkEqual(tool.name, 'toggle_project_interest', 'tool name')

  const result = await tool.execute({})

  checkEqual(result, `You are now interested`, 'return message from toggle')
  checkDeepEqual(toggles, [true], 'omitting interested toggles to true')
})

evals('projects: toggle_project_interest respects explicit state', async () => {

  const toggles: Array<boolean | undefined> = []

  const tool = toggleProjectInterestTool({
    isSignedIn: () => true,
    isInterested: () => true,
    onToggleInterest: async (desired) => {

      toggles.push(desired)

      return { status: 'ok', message: `Interest removed` }
    }
  })

  const result = await tool.execute({ interested: false })

  checkEqual(result, `Interest removed`, 'return message from toggle')
  checkDeepEqual(toggles, [false], 'explicit false passes through')

  const signedOut = toggleProjectInterestTool({
    isSignedIn: () => false,
    isInterested: () => false,
    onToggleInterest: async () => ({ status: 'ok', message: '' })
  })

  await checkThrows(() => signedOut.execute({ interested: true }), `Sign in to follow projects`, 'signed-out should throw')
})

evals('projects: create_project_post submits title and body', async () => {

  const submitted: Array<{ title: string; body: string }> = []

  const tool = createProjectPostTool({
    isSignedIn: () => true,
    getValues: () => ({ title: 'Draft', body: 'Draft body' }),
    onCreatePost: async (submitValues) => {

      submitted.push(submitValues!)

      return { status: 'ok', message: `Posting your update` }
    }
  })

  checkEqual(tool.name, 'create_project_post', 'tool name')
  checkDeepEqual(tool.inputSchema.required, ['title', 'body'], 'required fields')

  const result = await tool.execute({ title: 'Hello', body: 'World' })

  checkEqual(result, `Posting your update`, 'return message from create')
  checkDeepEqual(submitted, [{ title: 'Hello', body: 'World' }], 'submitted values')

  const signedOut = createProjectPostTool({
    isSignedIn: () => false,
    getValues: () => ({ title: '', body: '' }),
    onCreatePost: async () => ({ status: 'ok', message: '' })
  })

  await checkThrows(() => signedOut.execute({ title: 'T', body: 'B' }), `Sign in to post about this project`, 'signed-out should throw')
})

evals('projects: create_project_post surfaces validation errors', async () => {

  const tool = createProjectPostTool({
    isSignedIn: () => true,
    getValues: () => ({ title: '', body: '' }),
    onCreatePost: async () => ({ status: 'error', message: `A post title and body are required` })
  })

  await checkThrows(() => tool.execute({ title: '', body: 'B' }), `A post title and body are required`, 'missing title should throw')
})
