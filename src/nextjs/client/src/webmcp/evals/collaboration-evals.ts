//
// Evals for the collaboration-plan WebMCP tools: create_plan, add_plan_step
// and set_plan_step_status.
//
import {
  check,
  checkDeepEqual,
  checkEqual,
  checkThrows,
  evals
} from './harness'
import {
  addPlanStepTool,
  createPlanTool,
  setPlanStepStatusTool
} from '../tools/collaboration'
import type { PlanFormValues } from '@/components/collaboration/plan-form'
import type { PlanStepItem } from '@/types/client-only-types'

const emptyPlanValues: PlanFormValues = {
  projectId: '',
  title: '',
  description: '',
  rolesNeeded: '',
  commitmentLevel: '',
  compensation: '',
  deliverables: '',
  startBy: '',
  targetProfileId: ''
}

evals('collaboration: create_plan maps args onto form values', () => {

  const submitted: PlanFormValues[] = []

  const tool = createPlanTool({
    getValues: () => emptyPlanValues,
    onSubmit: (submitValues) => {

      submitted.push(submitValues!)

      return { status: 'ok', message: `Creating plan "Build WebMCP"` }
    }
  })

  checkEqual(tool.name, 'create_plan', 'tool name')
  checkDeepEqual(tool.inputSchema.required, ['projectId', 'title'], 'required fields')

  const result = tool.execute({
    projectId: 'project-1',
    title: '  Build WebMCP  ',
    rolesNeeded: 'TypeScript engineer',
    commitmentLevel: 'H',
    compensation: 'P',
    startBy: '2026-10-01',
    targetProfile: 'profile-9'
  })

  checkEqual(result, `Creating plan "Build WebMCP"`, 'return message from submit')
  checkDeepEqual(submitted, [{
    projectId: 'project-1',
    title: '  Build WebMCP  ',
    description: '',
    rolesNeeded: 'TypeScript engineer',
    commitmentLevel: 'H',
    compensation: 'P',
    deliverables: '',
    startBy: '2026-10-01',
    targetProfileId: 'profile-9'
  }], 'arg mapping (targetProfile -> targetProfileId)')
})

evals('collaboration: create_plan keeps current values for omitted args', () => {

  const current: PlanFormValues = {
    ...emptyPlanValues,
    projectId: 'project-1',
    title: 'Existing'
  }

  const submitted: PlanFormValues[] = []

  const tool = createPlanTool({
    getValues: () => current,
    onSubmit: (submitValues) => {

      submitted.push(submitValues!)

      return { status: 'ok', message: `Creating plan "Existing"` }
    }
  })

  tool.execute({ title: 'Existing' })

  checkDeepEqual(submitted, [current], 'only provided fields change')
})

evals('collaboration: create_plan surfaces validation errors', async () => {

  const tool = createPlanTool({
    getValues: () => emptyPlanValues,
    onSubmit: () => ({ status: 'error', message: `Project is required` })
  })

  await checkThrows(() => tool.execute({ title: 'T' }), `Project is required`, 'missing project should throw')
})

evals('collaboration: add_plan_step checks creator, trims and requires title', async () => {

  const added: Array<{ title: string; description: string }> = []

  const tool = addPlanStepTool({
    isCreator: () => true,
    onAddStep: (title, description) => {
      added.push({ title, description })
    }
  })

  checkEqual(tool.name, 'add_plan_step', 'tool name')
  checkDeepEqual(tool.inputSchema.required, ['title'], 'required fields')

  const result = tool.execute({ title: '  Define tool surface  ', description: '  List actions  ' })

  checkEqual(result, `Adding step "Define tool surface" to the plan`, 'return message with trimmed title')
  checkDeepEqual(added, [{ title: 'Define tool surface', description: 'List actions' }], 'values trimmed before submit')

  await checkThrows(() => tool.execute({ title: '   ' }), `Step title is required`, 'blank title should throw')

  const nonCreatorTool = addPlanStepTool({
    isCreator: () => false,
    onAddStep: () => undefined
  })

  await checkThrows(() => nonCreatorTool.execute({ title: 'T' }), `Only the plan creator can add steps`, 'non-creator should throw')
})

evals('collaboration: set_plan_step_status resolves the step and checks creator', async () => {

  const steps: PlanStepItem[] = [
    { id: 'step-1', planId: 'plan-1', seq: 1, title: 'Define tool surface', description: '', status: 'P' },
    { id: 'step-2', planId: 'plan-1', seq: 2, title: 'Build evals', description: '', status: 'P' }
  ]

  const updates: Array<{ stepId: string; status: string }> = []

  const tool = setPlanStepStatusTool({
    isCreator: () => true,
    getSteps: () => steps,
    onUpdateStepStatus: (stepId, status) => {
      updates.push({ stepId, status })
    }
  })

  checkEqual(tool.name, 'set_plan_step_status', 'tool name')
  checkDeepEqual(tool.inputSchema.required, ['stepId', 'status'], 'required fields')

  const result = tool.execute({ stepId: 'step-2', status: 'A' })

  checkEqual(result, `Setting step "Build evals" to A`, 'return message uses step title')
  checkDeepEqual(updates, [{ stepId: 'step-2', status: 'A' }], 'status update routed by id')

  await checkThrows(() => tool.execute({ stepId: 'missing', status: 'A' }), `No step found with id "missing"`, 'unknown step should throw')

  const nonCreatorTool = setPlanStepStatusTool({
    isCreator: () => false,
    getSteps: () => steps,
    onUpdateStepStatus: () => undefined
  })

  await checkThrows(() => nonCreatorTool.execute({ stepId: 'step-1', status: 'A' }), `Only the plan creator can update step statuses`, 'non-creator should throw')
})

evals('collaboration: tools expose object input schemas with required fields', () => {

  const tools = [
    createPlanTool({
      getValues: () => emptyPlanValues,
      onSubmit: () => ({ status: 'ok', message: '' })
    }),
    addPlanStepTool({
      isCreator: () => true,
      onAddStep: () => undefined
    }),
    setPlanStepStatusTool({
      isCreator: () => true,
      getSteps: () => [],
      onUpdateStepStatus: () => undefined
    })
  ]

  for (const tool of tools) {

    check(tool.inputSchema.type === 'object', `${tool.name} has an object input schema`)
    check(Array.isArray(tool.inputSchema.required) && tool.inputSchema.required!.length > 0, `${tool.name} declares required fields`)
  }
})
