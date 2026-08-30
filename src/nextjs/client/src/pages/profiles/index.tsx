import Head from 'next/head'
import { useState, type FormEvent } from 'react'
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadProfilesByFilter from '@/components/profiles/load-by-filter'
import EmptyState from '@/components/layouts/empty-state'
import ProfileCard from '@/components/profiles/profile-card'
import type { Profile, UserProfile } from '@/types/client-only-types'
import { useWebMcpTools } from '@/webmcp/webmcp'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
  search?: string | string[]
}

export default function ProfilesPage({
  userProfile,
  search: initialSearch
}: Props) {

  // Consts
  const startingSearch =
    typeof initialSearch === 'string' ?
      initialSearch
      :
      ''

  // State
  const [search, setSearch] = useState<string>(startingSearch)
  const [type, setType] = useState<string>('')
  const [profiles, setProfiles] = useState<Profile[] | undefined>(undefined)
  const [searched, setSearched] = useState<boolean>(startingSearch !== '')
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [loadAction, setLoadAction] = useState<boolean>(true)
  const [appliedInitialSearch, setAppliedInitialSearch] = useState<string>(startingSearch)

  // Re-run the search when the page is navigated to again with a different
  // query (e.g. breaking out of the header omnibar while already here).
  if (appliedInitialSearch !== startingSearch) {
    setAppliedInitialSearch(startingSearch)
    setSearch(startingSearch)
    setType('')
    setSearched(startingSearch !== '')
    setLoadAction(true)
  }

  // Functions
  function runSearch() {

    setSearched(true)
    setLoadAction(true)
  }

  function submitSearch(event: FormEvent) {

    event.preventDefault()
    runSearch()
  }

  // WebMCP
  useWebMcpTools([
    {
      name: 'search_profiles',
      title: 'Search profiles',
      description: `Search the Relays network directory for profiles by text and type. Returns matches rendered on the page.`,
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: `Text to match against profile names and details. Empty to list all profiles.`
          },
          type: {
            type: 'string',
            enum: ['H', 'A'],
            description: `Profile type: H for Human, A for Agent. Omit to include all types.`
          }
        }
      },
      execute: (args) => {

        const query = typeof args.query === 'string' ? args.query : ''
        const type = typeof args.type === 'string' ? args.type : ''

        setSearch(query)
        setType(type === '' || type === 'H' || type === 'A' ? type : '')
        runSearch()

        const typeLabel = type === 'H' ? 'human' : type === 'A' ? 'agent' : 'all'

        return `Searching profiles${query.trim() !== '' ? ` matching "${query.trim()}"` : ''} (type: ${typeLabel})`
      }
    }
  ])
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Profiles`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          <div style={{ marginBottom: '2em' }}>
            <Typography
              style={{ marginBottom: '0.5em' }}
              variant='h3'>
              Profiles
            </Typography>
            <Typography variant='body1'>
              Find people and agents to collaborate with.
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

            <FormControl style={{ width: '10em' }}>
              <InputLabel id='profile-type-filter'>Type</InputLabel>
              <Select
                labelId='profile-type-filter'
                label='Type'
                onChange={(event: SelectChangeEvent) => setType(event.target.value as string)}
                value={type}>
                <MenuItem value=''>
                  All
                </MenuItem>
                <MenuItem value='H'>
                  Human
                </MenuItem>
                <MenuItem value='A'>
                  Agent
                </MenuItem>
              </Select>
            </FormControl>

            <Button
              type='submit'
              variant='contained'>
              Search
            </Button>
          </form>

          {userProfile.id != null ?
            <div style={{ marginBottom: '2em' }}>
              <Button
                onClick={() => window.location.href = '/profile'}
                variant='outlined'>
                My profile
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

          {profiles != null ?
            <>
              {profiles.length > 0 ?
                <>
                  {profiles.map(profile => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile} />
                  ))}
                </>
                :
                <EmptyState
                  message={searched === true ?
                    'No profiles found. Try a different search.'
                    :
                    'No profiles yet.'
                  } />
              }
            </>
            :
            <></>
          }

        </div>
      </Layout>

      <LoadProfilesByFilter
        search={search}
        type={type !== '' ? type : undefined}
        setProfiles={setProfiles}
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