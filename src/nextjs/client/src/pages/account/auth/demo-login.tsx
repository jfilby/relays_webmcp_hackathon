import { useCallback, useEffect, useRef, useState } from 'react'
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
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { signIn } from 'next-auth/react'
import Layout from '@/components/layouts/layout'
import { useWebMcpTools } from '@/webmcp/webmcp'
import { demoSignInTool } from '@/webmcp/tools/auth'
import { defaultDemoUsername, demoUsers } from '@/services/auth/demo-users'

// https://<host>/account/auth/demo-login?user=<username>&password=<demo password>
// signs them straight into the selected demo user. Without the password in
// the URL the page shows a demo user selector and a password field which
// they must fill in and submit.
export default function DemoLogin({
  urlUser,
  urlPassword
}: InferGetServerSidePropsType<typeof getServerSideProps>) {

  // Consts
  const callbackUrl = '/'

  // State
  const [username, setUsername] = useState(urlUser ?? defaultDemoUsername)
  const [password, setPassword] = useState(urlPassword ?? '')
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [loggingIn, setLoggingIn] = useState(false)

  // Ret
  const urlLoginRun = useRef(false)

  // Functions
  const attemptLogin = useCallback(async (user: string, pw: string) => {

    // Set
    setLoggingIn(true)
    setAlertSeverity(undefined)
    setMessage(undefined)

    // Sign in as the selected demo user. The credentials provider validates
    // the username against the demo user list and the shared demo password.
    const result = await signIn('credentials', {
      username: user,
      password: pw,
      redirect: false,
      callbackUrl: callbackUrl,
    })

    if (result?.error) {

      // Wrong password (or other sign-in issue)
      setAlertSeverity('error')
      setMessage('Incorrect password, try again.')
      setLoggingIn(false)
    } else if (result?.ok) {

      // Signed in, redirect to the app
      setLoggingIn(false)
      window.location.href = result.url ?? callbackUrl
    } else {
      setAlertSeverity('error')
      setMessage('Sign-in failed, try again.')
      setLoggingIn(false)
    }
  }, [])

  // Events
  useEffect(() => {

    // Automatically log in with the URL user and password, once
    if (urlPassword != null &&
        !urlLoginRun.current) {
      urlLoginRun.current = true
      attemptLogin(urlUser ?? defaultDemoUsername, urlPassword)
    }

  }, [urlUser, urlPassword, attemptLogin])

  // WebMCP
  useWebMcpTools(() => [
    demoSignInTool({
      onAttemptLogin: (user, pw) => attemptLogin(user, pw)
    })
  ])

  // Render
  return (
    <Layout>

      <br /><br />

      <div style={{ width: '100%', marginBottom: '2em' }}>
        <center>
          <div style={{ width: '50%' }}>
            <Typography
              variant='h5'
              style={{ textAlign: 'center' }}>
              Demo account
            </Typography>
          </div>
        </center>
      </div>

      <div style={{ marginBottom: '2em', textAlign: 'center' }}>

        <Typography
          variant='body1'
          style={{ marginBottom: '1em' }}>
          Select a demo user to login as and experiment with Relays.
        </Typography>

        {alertSeverity != null &&
          <Alert severity={alertSeverity} style={{ marginBottom: '2em', width: '20em', marginLeft: 'auto', marginRight: 'auto' }}>
            {message}
          </Alert>
        }

        <form
          onSubmit={(e) => {
            e.preventDefault()
            attemptLogin(username, password)
          }}>

          <FormControl style={{ marginBottom: '2em', width: '20em', display: 'flex', marginLeft: 'auto', marginRight: 'auto' }}>
            <InputLabel id='demo-user'>Demo user</InputLabel>
            <Select
              labelId='demo-user'
              id='demo-user'
              label='Demo user'
              name='demo-user'
              autoFocus={urlPassword == null && urlUser == null}
              disabled={loggingIn}
              onChange={(event: SelectChangeEvent) => setUsername(event.target.value as string)}
              value={username}>
              {demoUsers.map(user => (
                <MenuItem
                  key={user.username}
                  value={user.username}>
                  {user.name}{user.type === 'A' ? ' (agent)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <br />

          <FormControl style={{ marginBottom: '2em', width: '20em', marginLeft: 'auto', marginRight: 'auto' }}>
            <TextField
              id='password'
              label='Password'
              name='password'
              type='password'
              autoFocus={urlUser != null && urlPassword == null}
              disabled={loggingIn}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              variant='outlined' />
          </FormControl>
          <br />

          <Button
            type='submit'
            style={{ marginBottom: '1em' }}
            disabled={loggingIn}
            variant='contained'>
            {loggingIn ? 'Logging in…' : 'Login'}
          </Button>
        </form>
      </div>

      <div style={{ width: '100%', marginBottom: '5em' }}>
        <center>
          <div style={{ width: '50%' }}>
            <Typography variant='body1'>
              Select a demo user, enter the demo password, then click Login.
            </Typography>
          </div>
        </center>
      </div>

    </Layout>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  // Get the user and password from the URL (?user=..&password=..) so demo
  // login links can include them. The page signs the user in automatically
  // when the password is present; the user defaults to the first demo user.
  const urlUser =
    typeof context.query.user === 'string'
      ? context.query.user
      : null

  const urlPassword =
    typeof context.query.password === 'string'
      ? context.query.password
      : null

  // Return
  return {
    props: {
      urlUser,
      urlPassword
    }
  }
}
