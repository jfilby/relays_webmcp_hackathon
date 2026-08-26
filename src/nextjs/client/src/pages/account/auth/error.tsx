import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button, Typography } from '@mui/material'
import Layout from '@/components/layouts/layout'

// Friendly text for standard next-auth error codes. The `error` query param is
// also used to carry custom messages (e.g. the login-method mismatch raised in
// the NextAuth signIn callback), which are shown verbatim.
const KNOWN_ERRORS: Record<string, string> = {
  AccessDenied: 'You do not have permission to sign in.',
  OAuthAccountNotLinked:
    'Please sign in with the method you originally used to sign up.',
  OAuthCallback:
    'There was a problem with the sign-in request. Please try again.',
  OAuthSignin:
    'There was a problem with the sign-in request. Please try again.',
  OAuthCreateAccount:
    'There was a problem creating your account. Please try again.',
  Configuration:
    'There is a problem with the server configuration. Please contact support.',
  default:
    'There was a problem signing you in. Please try again.'
}

export default function AuthError() {

  // Consts
  const router = useRouter()
  const raw =
    typeof router.query.error === 'string' ? router.query.error : ''

  const message =
    KNOWN_ERRORS[raw] ??
    raw ??
    KNOWN_ERRORS.default

  // Render
  return (
    <Layout>

      <br/><br/>

      <div style={{ width: '100%' }}>
        <center>
          <div style={{ width: '50%' }}>
            <Typography variant='body1'>
              {message}
            </Typography>

            <br/>

            <Button
              component={Link}
              href='/account/auth/sign-in'
              variant='contained'>
              Back to sign in
            </Button>
          </div>
        </center>
      </div>

    </Layout>
  )
}
