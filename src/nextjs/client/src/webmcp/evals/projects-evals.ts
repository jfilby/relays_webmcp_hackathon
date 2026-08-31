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
  searchProjectsTool
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
