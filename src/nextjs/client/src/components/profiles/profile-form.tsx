import {
  Alert,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material'
import { availabilityStatuses, profileTypes } from '@/types/client-only-types'

// The editable fields of a profile form
export interface ProfileFormValues {
  displayName: string
  type: string
  isPublic: boolean
  headline: string
  bio: string
  location: string
  website: string
  availabilityStatus: string
}

interface Props {
  title: string
  subtitle?: string
  values: ProfileFormValues
  onChange: (field: keyof ProfileFormValues, value: string | boolean) => void
  onSubmit: () => void
  submitLabel: string
  saving: boolean
  alertSeverity?: 'success' | 'error'
  message?: string
}

export default function ProfileForm({
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

      <FormControl style={{ marginBottom: '1em', width: '20em', display: 'flex' }}>
        <TextField
          autoComplete='off'
          fullWidth
          label='Display name'
          onChange={(event) => onChange('displayName', event.target.value)}
          required
          slotProps={{
            inputLabel: {
              shrink: Boolean(values.displayName),
            }
          }}
          value={values.displayName} />
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em', display: 'flex' }}>
        <InputLabel id='profile-type'>Type</InputLabel>
        <Select
          labelId='profile-type'
          label='Type'
          onChange={(event: SelectChangeEvent) => onChange('type', event.target.value as string)}
          value={values.type}>
          {profileTypes.map(profileType => (
            <MenuItem
              key={profileType.value}
              value={profileType.value}>
              {profileType.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em', display: 'flex' }}>
        <InputLabel id='profile-availability-status'>Availability</InputLabel>
        <Select
          labelId='profile-availability-status'
          label='Availability'
          onChange={(event: SelectChangeEvent) => onChange('availabilityStatus', event.target.value as string)}
          value={values.availabilityStatus}>
          {availabilityStatuses.map(availabilityStatus => (
            <MenuItem
              key={availabilityStatus.value}
              value={availabilityStatus.value}>
              {availabilityStatus.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em', display: 'flex' }}>
        <TextField
          fullWidth
          label='Headline'
          onChange={(event) => onChange('headline', event.target.value)}
          slotProps={{
            inputLabel: {
              shrink: Boolean(values.headline),
            }
          }}
          value={values.headline} />
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em', display: 'flex' }}>
        <TextField
          fullWidth
          label='Bio'
          multiline
          minRows={4}
          onChange={(event) => onChange('bio', event.target.value)}
          slotProps={{
            inputLabel: {
              shrink: Boolean(values.bio),
            }
          }}
          value={values.bio} />
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em', display: 'flex' }}>
        <TextField
          fullWidth
          label='Location'
          onChange={(event) => onChange('location', event.target.value)}
          slotProps={{
            inputLabel: {
              shrink: Boolean(values.location),
            }
          }}
          value={values.location} />
      </FormControl>

      <FormControl style={{ marginBottom: '1em', width: '20em', display: 'flex' }}>
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

      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={values.isPublic}
              onChange={(event) => onChange('isPublic', event.target.checked)}
              color='primary' />
          }
          label='Make my profile public'
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