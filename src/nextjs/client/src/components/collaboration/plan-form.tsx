import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material'
import type { Profile, Project } from '@/types/client-only-types'

// Human-readable commitment level (H hours/week, W weeks, M months)
function commitmentLevelName(commitmentLevel: string): string {

  switch (commitmentLevel) {
    case 'H':
      return 'Hours per week'

    case 'W':
      return 'Weeks'

    case 'M':
      return 'Months'
  }

  return commitmentLevel
}

// Human-readable compensation (N none, E equity, P paid)
function compensationName(compensation: string): string {

  switch (compensation) {
    case 'N':
      return 'None'

    case 'E':
      return 'Equity'

    case 'P':
      return 'Paid'
  }

  return compensation
}

// The editable fields of a plan form
export interface PlanFormValues {
  projectId: string
  title: string
  description: string
  rolesNeeded: string
  commitmentLevel: string
  compensation: string
  deliverables: string
  startBy: string
  targetProfileId: string
}

interface Props {
  projects: Project[]
  networkProfiles: Profile[]
  values: PlanFormValues
  onChange: (field: keyof PlanFormValues, value: string) => void
  onSubmit: () => void
  submitLabel: string
  saving: boolean
  alertSeverity?: 'success' | 'error'
  message?: string
}

export default function PlanForm({
  projects,
  networkProfiles,
  values,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  alertSeverity,
  message
}: Props) {

  // Render
  return (
    <>
      <Typography
        style={{ marginBottom: '0.5em' }}
        variant='h3'>
        Create a plan
      </Typography>

      <Typography
        style={{ marginBottom: '1em' }}
        variant='body1'>
        A plan describes the collaboration you&apos;re offering on one of your projects.
        You need to own at least one project before you can create a plan.
      </Typography>

      {alertSeverity && message ?
        <Alert
          severity={alertSeverity}
          style={{ margin: '1em 0' }}>
          {message}
        </Alert>
        :
        <></>
      }

      <FormControl style={{ marginBottom: '1em', width: '20em', display: 'flex' }}>
        <InputLabel id='plan-project'>Project</InputLabel>
        <Select
          label='Project'
          labelId='plan-project'
          onChange={(event: SelectChangeEvent) => onChange('projectId', event.target.value as string)}
          value={values.projectId}>
          <MenuItem value=''>
            Select a project...
          </MenuItem>
          {projects.map(project => (
            <MenuItem
              key={project.id}
              value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em', display: 'flex' }}>
        <TextField
          autoComplete='off'
          fullWidth
          label='Title'
          onChange={(event) => onChange('title', event.target.value)}
          required
          slotProps={{
            inputLabel: {
              shrink: Boolean(values.title),
            }
          }}
          value={values.title} />
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em', display: 'flex' }}>
        <TextField
          fullWidth
          label='Description'
          minRows={4}
          multiline
          onChange={(event) => onChange('description', event.target.value)}
          slotProps={{
            inputLabel: {
              shrink: Boolean(values.description),
            }
          }}
          value={values.description} />
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em', display: 'flex' }}>
        <TextField
          autoComplete='off'
          fullWidth
          helperText='Comma-separated, e.g. frontend developer, designer'
          label='Roles needed'
          onChange={(event) => onChange('rolesNeeded', event.target.value)}
          slotProps={{
            inputLabel: {
              shrink: Boolean(values.rolesNeeded),
            }
          }}
          value={values.rolesNeeded} />
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em', display: 'flex' }}>
        <InputLabel id='plan-commitment'>Commitment</InputLabel>
        <Select
          label='Commitment'
          labelId='plan-commitment'
          onChange={(event: SelectChangeEvent) => onChange('commitmentLevel', event.target.value as string)}
          value={values.commitmentLevel}>
          <MenuItem value=''>
            Not specified
          </MenuItem>
          {['H', 'W', 'M'].map(level => (
            <MenuItem
              key={level}
              value={level}>
              {commitmentLevelName(level)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em', display: 'flex' }}>
        <InputLabel id='plan-compensation'>Compensation</InputLabel>
        <Select
          label='Compensation'
          labelId='plan-compensation'
          onChange={(event: SelectChangeEvent) => onChange('compensation', event.target.value as string)}
          value={values.compensation}>
          <MenuItem value=''>
            Not specified
          </MenuItem>
          {['N', 'E', 'P'].map(kind => (
            <MenuItem
              key={kind}
              value={kind}>
              {compensationName(kind)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em', display: 'flex' }}>
        <TextField
          fullWidth
          label='Deliverables'
          minRows={3}
          multiline
          onChange={(event) => onChange('deliverables', event.target.value)}
          slotProps={{
            inputLabel: {
              shrink: Boolean(values.deliverables),
            }
          }}
          value={values.deliverables} />
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em', display: 'flex' }}>
        <TextField
          fullWidth
          label='Start by'
          onChange={(event) => onChange('startBy', event.target.value)}
          slotProps={{
            inputLabel: {
              shrink: true,
            }
          }}
          type='date'
          value={values.startBy} />
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em', display: 'flex' }}>
        <InputLabel id='plan-target'>Target profile (optional)</InputLabel>
        <Select
          label='Target profile (optional)'
          labelId='plan-target'
          onChange={(event: SelectChangeEvent) => onChange('targetProfileId', event.target.value as string)}
          value={values.targetProfileId}>
          <MenuItem value=''>
            Open to anyone in your network
          </MenuItem>
          {networkProfiles.map(profile => (
            <MenuItem
              key={profile.id}
              value={profile.id}>
              {profile.displayName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div>
        <Button
          disabled={saving || values.projectId === '' || values.title.trim() === ''}
          onClick={onSubmit}
          size='large'
          variant='contained'>
          {submitLabel}
        </Button>
      </div>
    </>
  )
}
