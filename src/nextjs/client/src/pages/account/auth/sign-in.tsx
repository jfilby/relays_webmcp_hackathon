import { useEffect, useState } from 'react'
import { Button, FormControl, TextField, Typography } from '@mui/material'
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { getCsrfToken, signIn } from 'next-auth/react'
import Layout from '@/components/layouts/layout'
import { useWebMcpTools } from '@/webmcp/webmcp'

export default function SignIn({
  csrfToken,
  callback,
  source
}: InferGetServerSidePropsType<typeof getServerSideProps>) {

  // Consts
  const callbackUrl = source == null ?
    `/` :
    `/account/auth/post-sign-in?source=${source}&callback=${callback}`

  const url = '/account/auth/sign-in'

  // State
  const [email, setEmail] = useState('')

  // Events
  useEffect(() => {

    // Return early if newDirName isn't set
    // setImageBasePath(window.location.protocol + '//' + window.location.host + '/img/')
  }, [])

  // Functions
  const handleEmailSignIn = async (submitEmail?: string) => {

    await signIn('email', {
      email: submitEmail ?? email,
      callbackUrl,
    })
  }

  // WebMCP
  useWebMcpTools([
    {
      name: 'send_sign_in_link',
      title: 'Send sign-in link',
      description: `Submit the email sign-in form, sending a magic sign-in link to the given email address. The user follows the link in their email to sign in.`,
      inputSchema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: `Email address of the account to send the sign-in link to.`
          }
        },
        required: ['email']
      },
      execute: async (args) => {

        const emailArg = typeof args.email === 'string' ? args.email.trim() : ''

        if (emailArg === '') {
          throw new Error(`Please provide the email address to send the sign-in link to.`)
        }

        handleEmailSignIn(emailArg)

        return `Sending sign-in link to "${emailArg}"`
      }
    }
  ])
  // Render
  return (
    <Layout>

      <br /><br />

      {/*
      <p>source: {source}</p>
      <p>callbackUrl: {callbackUrl}</p>
      */}

      <div style={{ width: '100%', marginBottom: '2em' }}>
        <center>
          <div style={{ width: '50%' }}>
            <Typography
              style={{ marginBottom: '1m' }}
              variant='h5'>
              Sign-in
            </Typography>
          </div>
        </center>
      </div>

      <div style={{ marginBottom: '2em', textAlign: 'center' }}>

        <div style={{ marginBottom: '2em' }}>
          <Button
            onClick={() =>
              signIn(
                'google',
                {
                  callbackUrl: callbackUrl
                }
              )
            }
            style={{ marginBottom: '1em' }}
            variant='contained'>
            Sign in with Google
          </Button>
          <br /><br />

          <Typography
            variant='body1'>
            .. or you can test this project as a signed-out user. You can still
            personalize your experience until you clear cookies for this site.
          </Typography>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault()
          handleEmailSignIn()
        }}>
          <FormControl style={{ marginBottom: '2em', width: '20em' }}>
            <TextField
              id='email'
              label='Email'
              name='email'
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              variant='outlined' />
          </FormControl>
          <br />

          <Button
            type='submit'
            variant='contained'>
            Sign in with Email
          </Button>
        </form>
      </div>

      <div style={{ width: '100%', marginBottom: '5em' }}>
        <center>
          <div style={{ width: '50%' }}>
            <Typography variant='body1'>
              Please enter the email address for your account, then click `Sign in with email`
              or press enter.
            </Typography>
          </div>
        </center>
      </div>

      <div style={{ width: '100%' }}>
        <center>
          <div style={{ width: '50%' }}>
            <Typography
              style={{ marginBottom: '1m' }}
              variant='h5'>
              Trouble signing in?
            </Typography>

            <Typography variant='body1'>
              You need to use the same sign-in method that you originally used to
              sign-up with.
            </Typography>
          </div>
        </center>
      </div>

    </Layout>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  // Get CSRF token
  const csrfToken = await getCsrfToken(context)

  // Get parameters
  const callback =
    typeof context.query.callback === 'string'
      ? context.query.callback
      : null

  const source =
    typeof context.query.source === 'string'
      ? context.query.source
      : null

  // Return
  return {
    props: {
      csrfToken,
      callback,
      source
    }
  }
}
