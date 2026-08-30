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
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

export default function ProfilesPage({
  userProfile
}: Props) {

  // State
  const [search, setSearch] = useState<string>('')
  const [type, setType] = useState<string>('')
  const [profiles, setProfiles] = useState<Profile[] | undefined>(undefined)
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

          <form style={{ marginBottom: '2em', display: 'flex', gap: '1em', flexWrap: 'wrap' }} onSubmit={submitSearch}>
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

            <FormControl>
              <InputLabel id='profile-type-filter'>Type</InputLabel>
              <Select
                labelId='profile-type-filter'
                label='Type'
                onChange={(event: SelectChangeEvent) => setType(event.target.value as string)}
                size='small'
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