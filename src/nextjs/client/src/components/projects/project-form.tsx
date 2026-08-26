import {
  Alert,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  TextField,
  Typography
} from '@mui/material'

// The editable fields of a project form
export interface ProjectFormValues {
  name: string
  tagline: string
  description: string
  website: string
  image: string
  isPromoted: boolean
  isPublic: boolean
}

interface Props {
  title: string
  subtitle?: string
  values: ProjectFormValues
  onChange: (field: keyof ProjectFormValues, value: string | boolean) => void
  onSubmit: () => void
  submitLabel: string
  saving: boolean
  alertSeverity?: 'success' | 'error'
  message?: string
}

export default function ProjectForm({
  title,
  subtitle,
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
        {title}
      </Typography>

      {subtitle != null ?
        <Typography
          style={{ marginBottom: '1em' }}
          variant='body1'>
          {subtitle}
        </Typography>
        :
        <></>
      }

      {alertSeverity && message ?
        <Alert
          severity={alertSeverity}
          style={{ margin: '1em 0' }}>
          {message}
        </Alert>
        :
        <></>
      }

      <FormControl style={{ marginBottom: '1em', width: '20em' }}>
        <TextField
          autoComplete='off'
          fullWidth
          label='Name'
          onChange={(event) => onChange('name', event.target.value)}
          required
          slotProps={{
            inputLabel: {
              shrink: Boolean(values.name),
            }
          }}
          value={values.name} />
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em' }}>
        <TextField
          fullWidth
          label='Tagline'
          onChange={(event) => onChange('tagline', event.target.value)}
          slotProps={{
            inputLabel: {
              shrink: Boolean(values.tagline),
            }
          }}
          value={values.tagline} />
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em' }}>
        <TextField
          fullWidth
          label='Description'
          multiline
          minRows={4}
          onChange={(event) => onChange('description', event.target.value)}
          slotProps={{
            inputLabel: {
              shrink: Boolean(values.description),
            }
          }}
          value={values.description} />
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em' }}>
        <TextField
          fullWidth
          label='Website'
          onChange={(event) => onChange('website', event.target.value)}
          slotProps={{
            inputLabel: {
              shrink: Boolean(values.website),
            }
          }}
          value={values.website} />
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em' }}>
        <TextField
          fullWidth
          label='Image URL'
          onChange={(event) => onChange('image', event.target.value)}
          slotProps={{
            inputLabel: {
              shrink: Boolean(values.image),
            }
          }}
          value={values.image} />
      </FormControl>

      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={values.isPromoted}
              onChange={(event) => onChange('isPromoted', event.target.checked)}
              color='primary' />
          }
          label='Showcase this project'
          style={{ marginBottom: '1em' }} />
      </div>

      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={values.isPublic}
              onChange={(event) => onChange('isPublic', event.target.checked)}
              color='primary' />
          }
          label='Make my project public'
          style={{ marginBottom: '1em' }} />
      </div>

      <div>
        <Button
          disabled={saving}
          onClick={onSubmit}
          size='large'
          variant='contained'>
          {submitLabel}
        </Button>
      </div>
    </>
  )
}