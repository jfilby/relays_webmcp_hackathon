import Head from 'next/head'
import { useState, type FormEvent } from 'react'
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  TextField,
  Typography
} from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadProjectsByFilter from '@/components/projects/load-by-filter'
import EmptyState from '@/components/layouts/empty-state'
import ProjectCard from '@/components/projects/project-card'
import type { Project, UserProfile } from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

export default function ProjectsPage({
  userProfile
}: Props) {

  // State
  const [search, setSearch] = useState<string>('')
  const [isPromoted, setIsPromoted] = useState<boolean>(false)
  const [projects, setProjects] = useState<Project[] | undefined>(undefined)
  const [searched, setSearched] = useState<boolean>(false)
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [loadAction, setLoadAction] = useState<boolean>(true)

  // Functions
  function submitSearch(event: FormEvent) {

    event.preventDefault()
    setSearched(true)
    setLoadAction(true)
  }

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Projects`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          <div style={{ marginBottom: '2em' }}>
            <Typography
              style={{ marginBottom: '0.5em' }}
              variant='h3'>
              Projects
            </Typography>
            <Typography variant='body1'>
              Find projects to collaborate on.
            </Typography>
          </div>

          <form style={{ marginBottom: '2em', display: 'flex', gap: '1em', flexWrap: 'wrap', alignItems: 'center' }} onSubmit={submitSearch}>
            <FormControl style={{ width: '20em' }}>
              <TextField
                autoComplete='off'
                fullWidth
                label='Search'
                onChange={(event) => setSearch(event.target.value)}
                slotProps={{
                  inputLabel: {
                    shrink: Boolean(search),
                  }
                }}
                value={search} />
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={isPromoted}
                  onChange={(event) => setIsPromoted(event.target.checked)}
                  color='primary' />
              }
              label='Showcased only' />

            <Button
              type='submit'
              variant='contained'>
              Search
            </Button>
          </form>

          {userProfile.id != null ?
            <div style={{ marginBottom: '2em' }}>
              <Button
                onClick={() => window.location.href = '/project'}
                variant='outlined'>
                My projects
              </Button>
            </div>
            :
            <></>
          }

          {alertSeverity && message ?
            <Typography
              style={{ color: '#b91c1c', marginBottom: '1em' }}
              variant='body1'>
              {message}
            </Typography>
            :
            <></>
          }

          {projects != null ?
            <>
              {projects.length > 0 ?
                <>
                  {projects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project} />
                  ))}
                </>
                :
                <EmptyState
                  message={searched === true ?
                    'No projects found. Try a different search.'
                    :
                    'No projects yet.'
                  } />
              }
            </>
            :
            <></>
          }
        </div>
      </Layout>

      <LoadProjectsByFilter
        search={search}
        isPromoted={isPromoted === true ? true : undefined}
        setProjects={setProjects}
        setAlertSeverity={setAlertSeverity}
        setMessage={setMessage}
        loadAction={loadAction}
        setLoadAction={setLoadAction} />
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  return loadServerPage(
    context,
    {})
}