import { Link, Typography } from '@mui/material'
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
    <div style={{ marginBottom: '2em', minWidth: 275 }}>

      <Link href={`/projects/${project.id}`}>
        <div style={{ display: 'inline-block', marginBottom: '0.5em', width: '80%' }}>
          <Typography
            sx={{
              display: 'inline-block',
              marginBottom: '0.25em',
              '&:hover': { textDecoration: 'underline' },
            }}
            variant='h5'>
            {project.name}
          </Typography>

          {project.isPromoted === true ?
            <Typography
              style={{ color: 'darkorange' }}
              variant='body2'>
              Showcased
            </Typography>
            :
            <></>
          }
        </div>
      </Link>

      {project.tagline != null && project.tagline !== '' ?
        <Typography variant='body1'>
          {project.tagline}
        </Typography>
        :
        <></>
      }

      <Typography
        style={{ color: 'gray' }}
        variant='body2'>
        {projectVisibilityName(project.isPublic)}
      </Typography>

      {project.website != null && project.website !== '' ?
        <Typography variant='body2'>
          Website:&nbsp;
          <Link
            href={project.website}
            target='_blank'
            rel='noopener noreferrer'>
            {project.website}
          </Link>
        </Typography>
        :
        <></>
      }
    </div>
  )
}