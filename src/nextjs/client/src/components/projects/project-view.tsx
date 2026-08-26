import { Button, Link, Typography } from '@mui/material'

import type { Project } from '@/types/client-only-types'
import { projectVisibilityName } from './project-card'

interface Props {
  project: Project
  owner?: boolean
}

export default function ProjectView({
  project,
  owner
}: Props) {

  // Render
  return (
    <>
      <div style={{ marginBottom: '2em' }}>

        {project.image != null && project.image !== '' ?
          <div style={{ marginBottom: '1em' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`${project.name} image`}
              src={project.image}
              style={{ height: '6em', width: '6em' }} />
          </div>
          :
          <></>
        }

        <Typography variant='h3'>
          {project.name}
        </Typography>

        <Typography
          style={{ color: 'gray', marginBottom: '0.5em' }}
          variant='body1'>
          {projectVisibilityName(project.isPublic)}
        </Typography>

        {project.tagline != null && project.tagline !== '' ?
          <Typography variant='h6'>
            {project.tagline}
          </Typography>
          :
          <></>
        }
      </div>

      {project.description != null && project.description !== '' ?
        <div style={{ marginBottom: '2em' }}>
          <Typography variant='body1'>
            {project.description}
          </Typography>
        </div>
        :
        <></>
      }

      <div style={{ marginBottom: '1em' }}>
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

      {owner === true ?
        <div style={{ marginBottom: '2em' }}>
          <Button
            onClick={() => window.location.href = '/project/edit'}
            variant='outlined'>
            Edit my project
          </Button>
        </div>
        :
        <></>
      }
    </>
  )
}