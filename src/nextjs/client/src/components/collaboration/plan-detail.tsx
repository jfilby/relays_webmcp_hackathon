import { useState } from 'react'
import {
  Avatar,
  Button,
  Chip,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import type { CollaborationPlanItem, PlanStepItem } from '@/types/client-only-types'

// Human-readable plan status (D draft, O open, A accepted, C completed, X cancelled)
export function planStatusName(status: string): string {

  switch (status) {
    case 'D':
      return 'Draft'

    case 'O':
      return 'Open'

    case 'A':
      return 'Accepted'

    case 'C':
      return 'Completed'

    case 'X':
      return 'Cancelled'
  }

  return status
}

// Human-readable commitment level (H hours/week, W weeks, M months)
export function commitmentLevelName(commitmentLevel: string | undefined | null): string {

  switch (commitmentLevel) {
    case 'H':
      return 'Hours per week'

    case 'W':
      return 'Weeks'

    case 'M':
      return 'Months'
  }

  return commitmentLevel ?? ''
}

// Human-readable compensation (N none, E equity, P paid)
export function compensationName(compensation: string | undefined | null): string {

  switch (compensation) {
    case 'N':
      return 'None'

    case 'E':
      return 'Equity'

    case 'P':
      return 'Paid'
  }

  return compensation ?? ''
}

// Human-readable step status (P pending, A active, C completed, X skipped)
function stepStatusName(status: string): string {

  switch (status) {
    case 'P':
      return 'Pending'

    case 'A':
      return 'Active'

    case 'C':
      return 'Completed'

    case 'X':
      return 'Skipped'
  }

  return status
}

function formatDate(value: string | undefined | null): string {

  if (value == null || value === '') {
    return ''
  }

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const stepStatuses = ['P', 'A', 'C', 'X']

interface Props {
  plan: CollaborationPlanItem
  steps: PlanStepItem[]
  isCreator: boolean
  isTarget: boolean
  onSaveStatus: (status: string) => void
  onAddStep: (title: string, description: string) => void
  onUpdateStepStatus: (stepId: string, status: string) => void
  onDeleteStep: (stepId: string) => void
}

export default function PlanDetail({
  plan,
  steps,
  isCreator,
  isTarget,
  onSaveStatus,
  onAddStep,
  onUpdateStepStatus,
  onDeleteStep
}: Props) {

  // State
  const [newStepTitle, setNewStepTitle] = useState<string>('')
  const [newStepDescription, setNewStepDescription] = useState<string>('')

  // Render
  return (
    <>
      <div style={{ marginBottom: '1em' }}>
        <Typography variant='h3'>
          {plan.title}
        </Typography>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginTop: '0.75em', flexWrap: 'wrap' }}>
          <Chip
            label={planStatusName(plan.status)}
            size='small'
            sx={{
              height: '1.6em',
              fontSize: '0.72rem',
              fontWeight: 600,
              backgroundColor: '#f0f0f0',
              color: '#444444'
            }} />
          {plan.projectName != null && plan.projectName !== '' ?
            <Chip
              label={plan.projectName}
              size='small'
              sx={{
                height: '1.6em',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: '#f0f0f0',
                color: '#444444'
              }} />
            :
            <></>
          }
        </div>
      </div>

      {plan.description != null && plan.description !== '' ?
        <Typography
          style={{ marginBottom: '1em', whiteSpace: 'pre-wrap' }}
          variant='body1'>
          {plan.description}
        </Typography>
        :
        <></>
      }

      {plan.rolesNeeded != null && plan.rolesNeeded.length > 0 ?
        <div style={{ marginBottom: '1em', display: 'flex', gap: '0.4em', flexWrap: 'wrap' }}>
          {plan.rolesNeeded.map(role => (
            <Chip
              key={role}
              label={role}
              size='small'
              sx={{
                height: '1.6em',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: '#f0f0f0',
                color: '#444444'
              }} />
          ))}
        </div>
        :
        <></>
      }

      <Typography
        style={{ color: '#5a5a5a', marginBottom: '1.5em', fontSize: '0.85rem' }}
        variant='body2'>
        {plan.createdByName != null && plan.createdByName !== '' ?
          `Created by ${plan.createdByName}` :
          'Plan'}
        {plan.targetName != null && plan.targetName !== '' ?
          ` · Target: ${plan.targetName}` :
          ''}
        {plan.commitmentLevel != null && plan.commitmentLevel !== '' ?
          ` · Commitment: ${commitmentLevelName(plan.commitmentLevel)}` :
          ''}
        {plan.compensation != null && plan.compensation !== '' ?
          ` · Compensation: ${compensationName(plan.compensation)}` :
          ''}
        {plan.startBy != null && plan.startBy !== '' ?
          ` · Start by ${formatDate(plan.startBy)}` :
          ''}
        {plan.status === 'C' && plan.completedAt != null ?
          ` · Completed ${formatDate(plan.completedAt)}` :
          ''}
      </Typography>

      {plan.deliverables != null && plan.deliverables !== '' ?
        <div style={{ marginBottom: '1.5em' }}>
          <Typography
            style={{ marginBottom: '0.25em' }}
            variant='h6'>
            Deliverables
          </Typography>
          <Typography
            style={{ whiteSpace: 'pre-wrap' }}
            variant='body1'>
            {plan.deliverables}
          </Typography>
        </div>
        :
        <></>
      }

      {(isCreator || isTarget) && plan.status !== 'C' && plan.status !== 'X' ?
        <div style={{ display: 'flex', gap: '0.5em', marginBottom: '1.5em' }}>
          {isCreator ?
            <Button
              onClick={() => onSaveStatus('C')}
              size='small'
              variant='contained'>
              Complete
            </Button>
            :
            <></>
          }
          {isTarget && plan.status === 'O' ?
            <Button
              onClick={() => onSaveStatus('A')}
              size='small'
              variant='contained'>
              Accept
            </Button>
            :
            <></>
          }
          <Button
            onClick={() => onSaveStatus('X')}
            size='small'
            variant='outlined'>
            Cancel plan
          </Button>
        </div>
        :
        <></>
      }

      <Typography
        style={{ marginTop: '2em', marginBottom: '0.5em' }}
        variant='h4'>
        Steps
      </Typography>

      {steps.length > 0 ?
        steps.slice().sort((a, b) => a.seq - b.seq).map(step => (
          <Paper
            key={step.id}
            sx={{
              marginBottom: '0.75em',
              padding: '1em 1.25em',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75em'
            }}>
            <Avatar
              sx={{
                width: '1.8em',
                height: '1.8em',
                fontSize: '0.85rem',
                backgroundColor: '#111111',
                color: '#ffffff',
                fontWeight: 700
              }}>
              {step.seq}
            </Avatar>

            <div style={{ flex: 1 }}>
              <Typography
                sx={{ fontWeight: 600 }}
                variant='body1'>
                {step.title}
              </Typography>

              {step.description != null && step.description !== '' ?
                <Typography
                  style={{ color: '#5a5a5a', marginTop: '0.25em' }}
                  variant='body2'>
                  {step.description}
                </Typography>
                :
                <></>
              }

              {isCreator === false ?
                <Chip
                  label={stepStatusName(step.status)}
                  size='small'
                  sx={{
                    marginTop: '0.5em',
                    height: '1.6em',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    backgroundColor: '#f0f0f0',
                    color: '#444444'
                  }} />
                :
                <></>
              }
            </div>

            {isCreator ?
              <>
                <FormControl size='small' style={{ width: '10em' }}>
                  <Select
                    labelId={`step-status-${step.id}`}
                    onChange={(event: SelectChangeEvent) => onUpdateStepStatus(step.id, event.target.value as string)}
                    value={step.status}>
                    {stepStatuses.map(status => (
                      <MenuItem
                        key={status}
                        value={status}>
                        {stepStatusName(status)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <IconButton
                  aria-label='delete step'
                  onClick={() => onDeleteStep(step.id)}
                  size='small'>
                  <DeleteIcon fontSize='small' />
                </IconButton>
              </>
              :
              <></>
            }
          </Paper>
        ))
        :
        <Typography
          style={{ color: '#5a5a5a', marginBottom: '1em' }}
          variant='body1'>
          No steps yet.
        </Typography>
      }

      {isCreator ?
        <Paper
          sx={{
            padding: '1em 1.25em',
            marginBottom: '2em'
          }}>
          <Typography
            style={{ marginBottom: '0.75em' }}
            variant='h6'>
            Add a step
          </Typography>
          <div style={{ display: 'flex', gap: '0.75em', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <FormControl style={{ width: '16em' }}>
              <TextField
                autoComplete='off'
                fullWidth
                label='Step title'
                onChange={(event) => setNewStepTitle(event.target.value)}
                size='small'
                value={newStepTitle} />
            </FormControl>
            <FormControl style={{ width: '20em' }}>
              <TextField
                fullWidth
                label='Description'
                onChange={(event) => setNewStepDescription(event.target.value)}
                size='small'
                value={newStepDescription} />
            </FormControl>
            <Button
              disabled={newStepTitle.trim() === ''}
              onClick={() => {
                onAddStep(newStepTitle.trim(), newStepDescription.trim())
                setNewStepTitle('')
                setNewStepDescription('')
              }}
              variant='outlined'>
              Add step
            </Button>
          </div>
        </Paper>
        :
        <></>
      }
    </>
  )
}
