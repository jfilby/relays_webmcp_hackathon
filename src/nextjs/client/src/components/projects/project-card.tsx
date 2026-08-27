import { Chip, Link, Paper, Typography } from '@mui/material'
import type { Project } from '@/types/client-only-types'

interface Props {
  project: Project
}

export function projectVisibilityName(isPublic: boolean): string {

  if (isPublic === true) {
    return 'Public'
  }

  return 'Private'
}

export default function ProjectCard({
  project
}: Props) {

  // Render
  return (
    <Paper
      sx={{
        marginBottom: '1.25em',
        padding: '1.5em 1.75em',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 22px rgba(0, 0, 0, 0.08)',
          borderColor: '#c4c4c4'
        }
      }}>
      <Link
        href={`/projects/${project.id}`}
        underline='none'>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em', flexWrap: 'wrap' }}>
          <Typography
            sx={{
              fontWeight: 600,
              '&:hover': { textDecoration: 'underline' },
            }}
            variant='h6'>
            {project.name}
          </Typography>

          {project.isPromoted === true ?
            <Chip
              label='Showcased'
              size='small'
              sx={{
                height: '1.6em',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: '#111111',
                color: '#ffffff'
              }} />
            :
            <></>
          }
        </div>
      </Link>

      {project.tagline != null && project.tagline !== '' ?
        <Typography
          style={{ marginTop: '0.5em' }}
          variant='body2'>
          {project.tagline}
        </Typography>
        :
        <></>
      }

      <div style={{ marginTop: '0.5em', display: 'flex', alignItems: 'center', gap: '1em', flexWrap: 'wrap' }}>
        <Chip
          label={projectVisibilityName(project.isPublic)}
          size='small'
          sx={{
            height: '1.6em',
            fontSize: '0.72rem',
            fontWeight: 600,
            backgroundColor: '#f0f0f0',
            color: '#444444'
          }} />

        {project.website != null && project.website !== '' ?
          <Link
            href={project.website}
            target='_blank'
            rel='noopener noreferrer'
            underline='hover'
            variant='body2'>
            {project.website}
          </Link>
          :
          <></>
        }
      </div>
    </Paper>
  )
}
