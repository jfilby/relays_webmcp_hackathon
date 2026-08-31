//
// WebMCP tool factories for collaboration-plan tools. Each factory returns
// the tool definition used by a page, taking its page dependencies (state
// accessors and submit functions) as an explicit object, so the tools can be
// exercised by evals without a DOM.
//
import type { PlanFormValues } from '@/components/collaboration/plan-form'
import type { PlanStepItem } from '@/types/client-only-types'
import type { WebMcpTool } from '../webmcp'
import type { SubmitResult } from './types'

// create_plan: submits the create-plan form. Missing or invalid arguments
// keep the current form values.
export interface CreatePlanToolDeps {
  getValues: () => PlanFormValues
  onSubmit: (submitValues?: PlanFormValues) => SubmitResult
}

export function createPlanTool(deps: CreatePlanToolDeps): WebMcpTool {

  return {
    name: 'create_plan',
    title: 'Create a plan',
    description: `Fill in and submit the create-plan form. Creates a collaboration plan on one of your projects; on success the page redirects to the plans list.`,
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: `ID of one of your projects to create the plan on.`
        },
        title: {
          type: 'string',
          description: `Short title for the plan.`
        },
        description: {
          type: 'string',
          description: `Longer description of the collaboration you're offering.`
        },
        rolesNeeded: {
          type: 'string',
          description: `Comma-separated roles needed, e.g. "frontend developer, designer".`
        },
        commitmentLevel: {
          type: 'string',
          enum: ['', 'H', 'W', 'M'],
          description: `Commitment: H for a few hours per week, W for weeks, M for months. Empty to leave unspecified.`
        },
        compensation: {
          type: 'string',
          enum: ['', 'N', 'E', 'P'],
          description: `Compensation: N for none, E for equity, P for paid. Empty to leave unspecified.`
        },
        deliverables: {
          type: 'string',
          description: `Expected deliverables for the collaboration.`
        },
        startBy: {
          type: 'string',
          description: `Earliest start date as an ISO date string (YYYY-MM-DD).`
        },
        targetProfile: {
          type: 'string',
          description: `Profile ID of the network member to target with this plan. Omit or pass empty to leave it open to anyone in your network.`
        }
      },
      required: ['projectId', 'title']
    },
    execute: (args) => {

      const sanitized: Partial<PlanFormValues> = {}

      const stringFields: Array<keyof PlanFormValues> = [
        'projectId',
        'title',
        'description',
        'rolesNeeded',
        'commitmentLevel',
        'compensation',
        'deliverables',
        'startBy'
      ]

      for (const field of stringFields) {
        const value = args[field]
        if (typeof value === 'string') {
          sanitized[field] = value
        }
      }

      if (typeof args.targetProfile === 'string') {
        sanitized.targetProfileId = args.targetProfile
      }

      const result = deps.onSubmit({ ...deps.getValues(), ...sanitized })

      if (result.status === 'error') {
        throw new Error(result.message)
      }

      return result.message
    }
  }
}

// add_plan_step: adds a step to the plan being viewed.
export interface AddPlanStepToolDeps {
  isCreator: () => boolean
  onAddStep: (title: string, description: string) => void
}

export function addPlanStepTool(deps: AddPlanStepToolDeps): WebMcpTool {

  return {
    name: 'add_plan_step',
    title: 'Add plan step',
    description: `Add a new step to this collaboration plan. The step is saved and appears in the plan's steps list.`,
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: `Short title for the step.`
        },
        description: {
          type: 'string',
          description: `What the step involves. Optional.`
        }
      },
      required: ['title']
    },
    execute: (args) => {

      if (deps.isCreator() !== true) {
        throw new Error(`Only the plan creator can add steps`)
      }

      const title = typeof args.title === 'string' ? args.title.trim() : ''
      const description = typeof args.description === 'string' ? args.description.trim() : ''

      if (title === '') {
        throw new Error(`Step title is required`)
      }

      deps.onAddStep(title, description)

      return `Adding step "${title}" to the plan`
    }
  }
}

// set_plan_step_status: updates one of the plan's steps.
export interface SetPlanStepStatusToolDeps {
  isCreator: () => boolean
  getSteps: () => PlanStepItem[] | undefined
  onUpdateStepStatus: (stepId: string, status: string) => void
}

export function setPlanStepStatusTool(deps: SetPlanStepStatusToolDeps): WebMcpTool {

  return {
    name: 'set_plan_step_status',
    title: 'Set plan step status',
    description: `Set the status of one of this plan's steps, the same as changing the step's status select as the plan creator.`,
    inputSchema: {
      type: 'object',
      properties: {
        stepId: {
          type: 'string',
          description: `ID of the step to update.`
        },
        status: {
          type: 'string',
          enum: ['P', 'A', 'C', 'X'],
          description: `Step status: P for pending, A for active, C for completed, X for skipped.`
        }
      },
      required: ['stepId', 'status']
    },
    execute: (args) => {

      if (deps.isCreator() !== true) {
        throw new Error(`Only the plan creator can update step statuses`)
      }

      const stepId = typeof args.stepId === 'string' ? args.stepId : ''
      const status = typeof args.status === 'string' ? args.status : ''

      const step = (deps.getSteps() ?? []).find(candidate => candidate.id === stepId)

      if (step == null) {
        throw new Error(`No step found with id "${stepId}"`)
      }

      deps.onUpdateStepStatus(stepId, status)

      return `Setting step "${step.title}" to ${status}`
    }
  }
}
