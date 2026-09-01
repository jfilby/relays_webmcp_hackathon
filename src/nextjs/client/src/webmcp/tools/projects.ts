//
// WebMCP tool factories for project-related tools. Each factory returns the
// tool definition used by a page, taking its page dependencies (state
// accessors and submit functions) as an explicit object, so the tools can be
// exercised by evals without a DOM.
//
import type { ProjectFormValues } from '@/components/projects/project-form'
import type { WebMcpTool } from '../webmcp'
import type { SubmitResult } from './types'

// search_projects: directory search driven by the projects page search form.
export interface SearchProjectsToolDeps {
  onSearch: (query: string, promoted: boolean) => void
}

export function searchProjectsTool(deps: SearchProjectsToolDeps): WebMcpTool {

  return {
    name: 'search_projects',
    title: 'Search projects',
    description: `Search the Relays project directory by text, optionally limited to showcased projects. Returns matches rendered on the page.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: `Text to match against project names and details. Empty to list all projects.`
        },
        promoted: {
          type: 'boolean',
          description: `true to show showcased projects only. Omit to include all projects.`
        }
      }
    },
    execute: (args) => {

      const query = typeof args.query === 'string' ? args.query : ''
      const promoted = typeof args.promoted === 'boolean' ? args.promoted : false

      deps.onSearch(query, promoted)

      return `Searching projects${query.trim() !== '' ? ` matching "${query.trim()}"` : ''}${promoted === true ? ' (showcased only)' : ''}`
    }
  }
}

// create_project: submits the add-project form. Missing or invalid arguments
// keep the current form values.
export interface CreateProjectToolDeps {
  getValues: () => ProjectFormValues
  onSubmit: (submitValues?: ProjectFormValues) => SubmitResult
}

export function createProjectTool(deps: CreateProjectToolDeps): WebMcpTool {

  return {
    name: 'create_project',
    title: 'Create project',
    description: `Create a new project for the signed-in user by submitting the Add project form. On success the page redirects to the viewer's projects list.`,
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: `Project name. Required.`
        },
        tagline: {
          type: 'string',
          description: `Short tagline for the project.`
        },
        description: {
          type: 'string',
          description: `Longer description of the project.`
        },
        website: {
          type: 'string',
          description: `Project website URL.`
        },
        imageUrl: {
          type: 'string',
          description: `URL of the project image.`
        },
        technologies: {
          type: 'string',
          description: `Comma-separated list of technologies, e.g. "React, Node.js".`
        },
        stage: {
          type: 'string',
          enum: ['I', 'A', 'B', 'G'],
          description: `Project stage: I for Idea, A for Alpha, B for Beta, G for Generally available.`
        },
        isOpenToCollaborators: {
          type: 'boolean',
          description: `Whether the project is open to collaborators.`
        },
        isPromoted: {
          type: 'boolean',
          description: `Whether the project is showcased on Relays.`
        },
        isPublic: {
          type: 'boolean',
          description: `Whether the project is public.`
        }
      },
      required: ['name']
    },
    execute: (args) => {

      const sanitizedArgs: Partial<ProjectFormValues> = {}

      if (typeof args.name === 'string') {
        sanitizedArgs.name = args.name
      }
      if (typeof args.tagline === 'string') {
        sanitizedArgs.tagline = args.tagline
      }
      if (typeof args.description === 'string') {
        sanitizedArgs.description = args.description
      }
      if (typeof args.website === 'string') {
        sanitizedArgs.website = args.website
      }
      if (typeof args.imageUrl === 'string') {
        sanitizedArgs.image = args.imageUrl
      }
      if (typeof args.technologies === 'string') {
        sanitizedArgs.techStack = args.technologies
      }
      if (typeof args.stage === 'string' && ['I', 'A', 'B', 'G'].includes(args.stage)) {
        sanitizedArgs.stage = args.stage
      }
      if (typeof args.isOpenToCollaborators === 'boolean') {
        sanitizedArgs.isOpenToCollaborators = args.isOpenToCollaborators
      }
      if (typeof args.isPromoted === 'boolean') {
        sanitizedArgs.isPromoted = args.isPromoted
      }
      if (typeof args.isPublic === 'boolean') {
        sanitizedArgs.isPublic = args.isPublic
      }

      const result = deps.onSubmit({ ...deps.getValues(), ...sanitizedArgs })

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}

// update_project: submits the edit-project form. Missing or invalid arguments
// keep the current form values.
export interface UpdateProjectToolDeps {
  // True when a project is selected for editing.
  hasProject: () => boolean
  getValues: () => ProjectFormValues
  onSubmit: (submitValues?: ProjectFormValues) => SubmitResult
}

export function updateProjectTool(deps: UpdateProjectToolDeps): WebMcpTool {

  return {
    name: 'update_project',
    title: 'Update project',
    description: `Update the selected project by submitting the Edit project form with the given field values. Fields not provided keep their current values. On success the page redirects to the viewer's projects list.`,
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: `Project name. Required.`
        },
        tagline: {
          type: 'string',
          description: `Short tagline for the project.`
        },
        description: {
          type: 'string',
          description: `Longer description of the project.`
        },
        website: {
          type: 'string',
          description: `Project website URL.`
        },
        imageUrl: {
          type: 'string',
          description: `URL of the project image.`
        },
        technologies: {
          type: 'string',
          description: `Comma-separated list of technologies, e.g. "React, Node.js".`
        },
        stage: {
          type: 'string',
          enum: ['I', 'A', 'B', 'G'],
          description: `Project stage: I for Idea, A for Alpha, B for Beta, G for Generally available.`
        },
        isOpenToCollaborators: {
          type: 'boolean',
          description: `Whether the project is open to collaborators.`
        },
        isPromoted: {
          type: 'boolean',
          description: `Whether the project is showcased on Relays.`
        },
        isPublic: {
          type: 'boolean',
          description: `Whether the project is public.`
        }
      },
      required: ['name']
    },
    execute: (args) => {

      if (deps.hasProject() !== true) {
        throw new Error(`Select a project to edit first`)
      }

      const sanitizedArgs: Partial<ProjectFormValues> = {}

      if (typeof args.name === 'string') {
        sanitizedArgs.name = args.name
      }
      if (typeof args.tagline === 'string') {
        sanitizedArgs.tagline = args.tagline
      }
      if (typeof args.description === 'string') {
        sanitizedArgs.description = args.description
      }
      if (typeof args.website === 'string') {
        sanitizedArgs.website = args.website
      }
      if (typeof args.imageUrl === 'string') {
        sanitizedArgs.image = args.imageUrl
      }
      if (typeof args.technologies === 'string') {
        sanitizedArgs.techStack = args.technologies
      }
      if (typeof args.stage === 'string' && ['I', 'A', 'B', 'G'].includes(args.stage)) {
        sanitizedArgs.stage = args.stage
      }
      if (typeof args.isOpenToCollaborators === 'boolean') {
        sanitizedArgs.isOpenToCollaborators = args.isOpenToCollaborators
      }
      if (typeof args.isPromoted === 'boolean') {
        sanitizedArgs.isPromoted = args.isPromoted
      }
      if (typeof args.isPublic === 'boolean') {
        sanitizedArgs.isPublic = args.isPublic
      }

      const result = deps.onSubmit({ ...deps.getValues(), ...sanitizedArgs })

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}

// toggle_project_interest: toggles (or explicitly sets) the viewer's interest
// in the project on the project page.
export interface ToggleProjectInterestToolDeps {
  isSignedIn: () => boolean
  isInterested: () => boolean
  onToggleInterest: (submitInterested?: boolean) => Promise<SubmitResult>
}

export function toggleProjectInterestTool(deps: ToggleProjectInterestToolDeps): WebMcpTool {

  return {
    name: 'toggle_project_interest',
    title: 'Toggle project interest',
    description: `Mark the signed-in user as interested in this project, or remove their interest. The Interested button and count on the page update once saved.`,
    inputSchema: {
      type: 'object',
      properties: {
        interested: {
          type: 'boolean',
          description: `true to mark interested, false to remove interest. Omit to toggle the current state.`
        }
      }
    },
    execute: async (args) => {

      if (deps.isSignedIn() !== true) {
        throw new Error(`Sign in to follow projects`)
      }

      const desired = typeof args.interested === 'boolean' ?
        args.interested :
        !deps.isInterested()

      const result = await deps.onToggleInterest(desired)

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}

// create_project_post: submits the compose-post form on a project page.
export interface CreateProjectPostToolDeps {
  isSignedIn: () => boolean
  getValues: () => { title: string; body: string }
  onCreatePost: (submitValues?: { title: string; body: string }) => Promise<SubmitResult>
}

export function createProjectPostTool(deps: CreateProjectPostToolDeps): WebMcpTool {

  return {
    name: 'create_project_post',
    title: 'Create project post',
    description: `Publish a new post on this project's page with the given title and body. The post appears in the project's posts list once saved.`,
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: `Title of the post.`
        },
        body: {
          type: 'string',
          description: `Body text of the post.`
        }
      },
      required: ['title', 'body']
    },
    execute: async (args) => {

      if (deps.isSignedIn() !== true) {
        throw new Error(`Sign in to post about this project`)
      }

      const title = typeof args.title === 'string' ? args.title : ''
      const body = typeof args.body === 'string' ? args.body : ''

      const result = await deps.onCreatePost({ ...deps.getValues(), title, body })

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}
