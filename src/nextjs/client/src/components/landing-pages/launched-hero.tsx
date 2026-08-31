import {
  useEffect,
  useState
} from 'react'
import type { UserProfile } from '@/types/client-only-types'
import CreateProfile from '@/components/profiles/create'
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography
} from '@mui/material'
import { useWebMcpTools } from '@/webmcp/webmcp'
import { createLandingProfileTool } from '@/webmcp/tools/profiles'
import styles from './landing.module.css'

interface LandingProfile {
  displayName?: string
  getEmailUpdates?: boolean
}

interface Props {
  authSession: {
    user?: {
      email?: string | null
    }
  } | null | undefined
  profile?: LandingProfile | null
  userProfile: UserProfile | null
}

export default function LaunchedHero({
  authSession,
  profile,
  userProfile
}: Props) {

  // Consts
  // - undefined: session still loading -> render neither signed-in nor out
  // - null:      logged out
  // - object:    logged in
  const signedIn = authSession == null
    ? authSession === undefined
      ? undefined
      : false
    : true
  const hasProfile = profile != null

  // State
  const [name, setName] = useState<string>('')
  const [updates, setUpdates] = useState<boolean>(true)
  const [createAction, setCreateAction] = useState<boolean>(false)
  const [createdAction, setCreatedAction] = useState<boolean>(false)
  const [key, setKey] = useState<string>('')

  const [alertSeverity, setAlertSeverity] =
    useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  // Effects
  useEffect(() => {

    if (createdAction === true) {
      // Reload so the server picks up the newly created profile
      window.location.reload()
    }

  }, [createdAction])
  // WebMCP
  useWebMcpTools(() => [
    createLandingProfileTool({
      isAvailable: () => signedIn === true && !hasProfile,
      getUpdates: () => updates,
      onCreate: (displayName, updatesPreference) => {

        setName(displayName)
        setUpdates(updatesPreference)
        setCreateAction(true)
      }
    })
  ])

  // Render
  return (
    <section className={styles.hero}>
      <div className={styles.heroCanvas} />

      <div className={styles.heroContentWrapper}>

        <div className={styles.heroLeft}>
          {signedIn === true && hasProfile ?
            <div>
              <Typography
                sx={{ fontWeight: 700, fontSize: '1.6em' }}
                variant='h2'>
                Welcome back
              </Typography>
              <Typography
                className={styles.cardBody}
                sx={{ marginTop: '0.35em' }}
                variant='body2'>
                Pick up where you left off or start something new.
              </Typography>

              <div
                style={{
                  display: 'flex',
                  gap: '1em',
                  marginTop: '1.25em',
                  flexWrap: 'wrap'
                }}>
                <Button
                  onClick={() => window.location.href = '/network'}
                  size='large'
                  variant='contained'>
                  My network
                </Button>
                <Button
                  onClick={() => window.location.href = '/projects'}
                  size='large'
                  variant='outlined'>
                  Explore projects
                </Button>
                <Button
                  onClick={() => window.location.href = '/profile'}
                  size='large'
                  variant='outlined'>
                  My profile
                </Button>
              </div>
            </div>
            :
            <></>
          }

          {signedIn === true && hasProfile === false ?
            <div>
              <Typography
                variant='h6'>
                Welcome back, create your profile
              </Typography>
              <Typography
                className={styles.cardBody}
                sx={{ marginTop: '0.5em' }}
                variant='body2'>
                A profile is how people and agents find you on Relays.
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

              <div style={{ marginTop: '1em' }}>
                <TextField
                  autoComplete='off'
                  fullWidth
                  label='Display name'
                  onChange={(event) => {
                    setName(event.target.value)
                  }}
                  required
                  slotProps={{
                    inputLabel: {
                      shrink: Boolean(name),
                    }
                  }}
                  style={{ marginBottom: '1em' }}
                  value={name} />
              </div>

              <div>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={updates}
                      onChange={(event) => setUpdates(event.target.checked)}
                      color='primary' />
                  }
                  label='Sign-up for updates'
                  style={{ marginBottom: '1em' }} />
              </div>

              <div>
                <Button
                  onClick={() => {
                    setCreateAction(true)
                  }}
                  size='large'
                  variant='contained'>
                  Create
                </Button>
              </div>
            </div>
            :
            <></>
          }
        </div>

        {userProfile?.id != null ?
          <CreateProfile
            userProfileId={userProfile.id}
            name={name}
            updates={updates}
            createAction={createAction}
            setCreateAction={setCreateAction}
            setAlertSeverity={setAlertSeverity}
            setMessage={setMessage}
            setCreatedAction={setCreatedAction}
            setKey={setKey} />
          :
          <></>
        }
      </div>
    </section>
  )
}