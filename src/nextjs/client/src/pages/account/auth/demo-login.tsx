import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Button, FormControl, TextField, Typography } from '@mui/material'
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { signIn } from 'next-auth/react'
import Layout from '@/components/layouts/layout'

// https://<host>/account/auth/demo-login?password=<demo password>
// signs them straight into the demo account. Without the password in the URL
// the page shows a password field which they must fill in and submit.
export default function DemoLogin({
  urlPassword
}: InferGetServerSidePropsType<typeof getServerSideProps>) {

  // Consts
  const callbackUrl = '/'

  // State
  const [password, setPassword] = useState(urlPassword ?? '')
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [loggingIn, setLoggingIn] = useState(false)

  // Ret
  const urlLoginRun = useRef(false)

  // Functions
  const attemptLogin = useCallback(async (pw: string) => {

    // Set
    setLoggingIn(true)
    setAlertSeverity(undefined)
    setMessage(undefined)

    // Sign in with the demo user credentials. The credentials provider
    // validates username 'demo' / the given password.
    const result = await signIn('credentials', {
      username: 'demo',
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

    // Automatically log in with the URL password, once
    if (urlPassword != null &&
        !urlLoginRun.current) {
      urlLoginRun.current = true
      attemptLogin(urlPassword)
    }
  }, [urlPassword, attemptLogin])

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
          This is a demo account for experimenting with Relays.
        </Typography>

        {alertSeverity != null &&
          <Alert severity={alertSeverity} style={{ marginBottom: '2em', width: '20em', marginLeft: 'auto', marginRight: 'auto' }}>
            {message}
          </Alert>
        }

        <form
          onSubmit={(e) => {
            e.preventDefault()
            attemptLogin(password)
          }}>
          <FormControl style={{ marginBottom: '2em', width: '20em', marginLeft: 'auto', marginRight: 'auto' }}>
            <TextField
              id='password'
              label='Password'
              name='password'
              type='password'
              autoFocus={urlPassword == null}
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
              Enter the demo password, then click Login.
            </Typography>
          </div>
        </center>
      </div>

    </Layout>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  // Get the password from the URL (?password=..) so demo login links can
  // include it. The page signs the user in automatically when it's present.
  const urlPassword =
    typeof context.query.password === 'string'
      ? context.query.password
      : null

  // Return
  return {
    props: {
      urlPassword
    }
  }
}
