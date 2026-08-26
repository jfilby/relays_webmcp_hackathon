import React, { useState } from 'react'
import { Alert, Button, TextField, Typography } from '@mui/material'
import { useMutation } from '@apollo/client/react'
import { signUpForUpdatesMutation } from '@/apollo/sign-ups'
import styles from './landing.module.css'

interface SignUpResult {
  status: boolean
  message: string
}

interface Props {
  authSession: {
    user?: {
      email?: string | null
    }
  } | null | undefined
  userProfileId: string | null | undefined
  updatesEnabled: boolean
}

export default function LaunchedDetails({
  authSession,
  userProfileId,
  updatesEnabled
}: Props) {

  // A user who has email updates enabled is already subscribed, so the
  // sign-up form at the bottom of the front page is hidden for them.
  const hideUpdatesSignup = updatesEnabled === true

  // Whether the viewer is signed-in
  // - undefined: session still loading -> render neither signed-in nor out
  // - null:      logged out
  // - object:    logged in
  const signedIn = authSession == null
    ? authSession === undefined
      ? undefined
      : false
    : userProfileId != null

  // State
  const [email, setEmail] = useState('')
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [submitDisabled, setSubmitDisabled] = useState(false)

  // GraphQL
  const [fetchSignUpForUpdatesMutation] =
    useMutation<{
      signUpForUpdates: SignUpResult
    }>(signUpForUpdatesMutation, {
      fetchPolicy: 'no-cache'
    })

  // Functions
  function isEmail(search: string): boolean {

    const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)

    return regexp.test(search)
  }

  async function updatesSignup() {

    // Anonymous visitors must provide a valid email address
    if (signedIn === false) {

      if (isEmail(email) === false) {
        setAlertSeverity('error')
        setMessage('The email address you entered is invalid')
        return
      } else {
        setAlertSeverity(undefined)
        setMessage(undefined)
      }
    }

    // Disable the submit button
    setSubmitDisabled(true)

    // Call the GraphQL mutation
    let result: SignUpResult | undefined

    await fetchSignUpForUpdatesMutation({
      variables: {
        email: signedIn === true ? null : email,
        userProfileId: signedIn === true ? userProfileId : null
      }
    }).then(res => result = res.data?.signUpForUpdates)

    // Process the results
    if (result == null) {
      setAlertSeverity('error')
      setMessage(`Failed to sign up for updates`)
      setSubmitDisabled(false)
      return
    }

    if (result.status === true) {

      if (signedIn === true) {
        // Reload so the server reflects the newly-enabled updates preference
        // and this form is hidden.
        window.location.reload()
      } else {
        // Success
        setAlertSeverity('success')
        setMessage("You've subscribed to updates!")
        setSubmitDisabled(false)
      }
    } else {
      // Error
      setAlertSeverity('error')
      setMessage(result.message)
      setSubmitDisabled(false)
    }
  }

  // Render
  return (
    <section
      id='get-updates'
      className={styles.ctaBand}>

      <Typography
        className={styles.ctaTitle}
        component='h2'
        variant='h4'>
        Ready to build something?
      </Typography>

      <Typography
        className={styles.ctaSubtitle}
        style={{ marginTop: '0.75em' }}
        variant='body1'>
        Join Relays, meet collaborators and agents, and turn a plan into
        a project that ships.
      </Typography>

      <div style={{ height: '1.5em' }} />

      {signedIn === false ?
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            onClick={() => window.location.href = '/api/auth/signin'}
            className={styles.ctaEyeButton}
            size='large'
            variant='contained'>
            Join Relays, it&apos;s free
          </Button>
        </div>
        :
        <></>
      }

      {hideUpdatesSignup === false ?
        <div className={styles.ctaFormWrapper}>
          <Typography
            className={styles.ctaSecondary}
            variant='body2'>
            Get collaboration ideas like these in your inbox:
          </Typography>

          <form
            onSubmit={(e) => { e.preventDefault(); updatesSignup() }}
            className={styles.ctaForm}>
            {signedIn === false ? (

              <TextField
                id='email'
                placeholder='Email address'
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '21em' }}
                value={email}
                variant='outlined'
                slotProps={{
                  input: {
                    style: {
                      backgroundColor: '#fff',
                      color: '#111',
                      borderRadius: '999em',
                      padding: '0 0.5em'
                    }
                  }
                }} />
            ) : (
              <Typography
                className={styles.ctaSecondary}
                variant='body2'>
                We&apos;ll send updates to the address on your account.
              </Typography>
            )}

            <Button
              disabled={submitDisabled}
              onClick={() => updatesSignup()}
              className={styles.ctaEyeButton}
              type='submit'
              variant='contained'>
              Sign-up for updates
            </Button>
          </form>

          {alertSeverity && message ?
            <div style={{ marginTop: '1em' }}>
              <Alert
                severity={alertSeverity}>
                {message}
              </Alert>
            </div>
            :
            <></>
          }
        </div>
        :
        <></>
      }
    </section>
  )
}