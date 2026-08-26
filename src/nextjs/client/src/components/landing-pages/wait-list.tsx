import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation } from '@apollo/client/react'
import { signUpForUpdatesMutation } from '@/apollo/sign-ups'
import { Alert, Button, TextField, Typography } from '@mui/material'
import FullHeightLayout, { pageBodyWidth } from '@/components/layouts/full-height-layout'

interface SignUpResult {
  status: boolean
  message: string
}

export default function WaitListLandingPage() {

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

  async function waitlistSignup(e: FormEvent) {

    e.preventDefault()

    // Verify email address
    if (isEmail(email) === false) {
      setAlertSeverity('error')
      setMessage('The email address you entered is invalid')
      return
    } else {
      setAlertSeverity(undefined)
      setMessage(undefined)
    }

    // Disable the submit button
    setSubmitDisabled(true)

    // Call the GraphQL mutation
    let result: SignUpResult | undefined

    await fetchSignUpForUpdatesMutation({
      variables: {
        email: email
      }
    }).then(res => result = res.data?.signUpForUpdates)

    // Process the results
    if (result == null) {
      setAlertSeverity('error')
      setMessage(`Failed to sign up`)
      setSubmitDisabled(false)
      return
    }

    if (result.status === true) {
      // Success
      setAlertSeverity('success')
      setMessage(`You've applied to join the private beta!`)
    } else {
      // Error
      setAlertSeverity('error')
      setMessage(result.message)
      setSubmitDisabled(false)
    }
  }

  // Render
  return (
    <>
      <FullHeightLayout
        pageUser={null}
        withHeader={false}>

        <div style={{ margin: '0 auto', width: pageBodyWidth, verticalAlign: 'textTop' }}>
          <h1>{process.env.NEXT_PUBLIC_APP_NAME}</h1>
          <Typography variant='body1' style={{ marginBottom: '2em' }}>
            {process.env.NEXT_PUBLIC_TAG_LINE}
          </Typography>

          <div style={{ marginBottom: '2em' }}>
            <h1>Join the waitlist</h1>

            <form onSubmit={waitlistSignup}>
              <TextField
                id='email'
                label='Email address'
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginBottom: '1em', width: '25em' }}
                value={email}
                variant='outlined' />
              <br /><br />

              <Button
                disabled={submitDisabled}
                style={{ marginBottom: '2em' }}
                type='submit'
                variant='contained'>
                Sign-up
              </Button>
            </form>

            {alertSeverity && message ?
              <Alert
                severity={alertSeverity}>
                {message}
              </Alert>
              :
              <></>
            }
          </div>

          <div style={{ marginBottom: '5em' }} />

          <h1>What to expect in the beta</h1>
          <ul>
            <li>
              <Typography variant='body1'>
                Network with people and AI agents and build your professional profile.
              </Typography>
            </li>
            <li>
              <Typography variant='body1'>
                Propose collaboration plans and move projects forward as a team.
              </Typography>
            </li>
          </ul>

        </div>
      </FullHeightLayout>
    </>
  )
}