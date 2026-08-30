import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Button, FormControl, TextField, Typography } from '@mui/material'
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { getCsrfToken, signIn } from 'next-auth/react'
import Layout from '@/components/layouts/layout'
import { useWebMcpTools } from '@/webmcp/webmcp'

export default function SignIn({ csrfToken }: InferGetServerSidePropsType<typeof getServerSideProps>) {

  // Consts
  const callbackUrl = `/account/auth/post-sign-in`
  const url = '/account/auth/sign-in'

  // State
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')

  // Refs
  const formRef = useRef<HTMLFormElement>(null)

  // Events
  useEffect(() => {

    // Return early if newDirName isn't set
    // setImageBasePath(window.location.protocol + '//' + window.location.host + '/img/')
  }, [])

  // WebMCP
  useWebMcpTools([
    {
      name: 'send_sign_up_link',
      title: 'Send sign-up link',
      description: `Submit the sign-up form, sending a magic sign-in link to the given email address. If the account does not exist yet, following the link creates it.`,
      inputSchema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: `Email address to send the sign-up link to.`
          }
        },
        required: ['email']
      },
      execute: (args) => {

        const emailArg = typeof args.email === 'string' ? args.email.trim() : ''

        if (emailArg === '') {
          throw new Error(`Please provide the email address to send the sign-up link to.`)
        }

        // Update the controlled email input synchronously so the native form
        // posts the new value, then submit the form exactly like the button does.
        flushSync(() => {
          setEmail(emailArg)
        })
        formRef.current?.requestSubmit()

        return `Sending sign-up link to "${emailArg}"`
      }
    }
  ])

  // Render
  return (
    <Layout>

      <br/><br/>

      <div style={{ width: '100%', marginBottom: '2em' }}>
        <center>
          <div style={{ width: '50%' }}>
            <Typography
              style={{ marginBottom: '1m' }}
              variant='h5'>
              Sign-up
            </Typography>

            <Typography variant='body1'>
              If you haven&apos;t signed up yet, this will create a new account for you.
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
                })
            }
            style={{ marginBottom: '1em' }}
            variant='contained'>
            Sign in with Google
          </Button>
          <br/><br/>

          <Typography
            variant='body1'>
            .. or you can test this project as a signed-out user. You can still
            personalize your experience until you clear cookies for this site.
          </Typography>
        </div>

        <form ref={formRef} method='post' action='/api/auth/signin/email'>
          <input name='csrfToken' type='hidden' defaultValue={csrfToken} />
          <input type='hidden' name='callbackUrl' value={callbackUrl} />

          <FormControl style={{ marginBottom: '2em', width: '20em' }}>
            <TextField
              id='email'
              label='Email'
              name='email'
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              variant='outlined' />
          </FormControl>
          <br/>

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
              Remember your sign-in choice
            </Typography>

            <Typography variant='body1'>
              You&amp;ll need to use the same sign-in method that you originally
              used to sign-up with.
            </Typography>
          </div>
        </center>
      </div>

    </Layout>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const csrfToken = await getCsrfToken(context)
  return {
    props: { csrfToken },
  }
}
