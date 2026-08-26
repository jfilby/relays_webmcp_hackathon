import { prisma } from '@/db'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import AppleProvider from 'next-auth/providers/apple'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
import Email from 'next-auth/providers/email'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { getResend } from '@/services/email/resend'
// import { customSendVerificationRequest } from '@/services/email/nextauth-custom'

const resend = getResend()

export default NextAuth({
  theme: {
    logo: '/img/logo/logo-color.png'
  },
  pages: {
    signIn: '/account/auth/sign-in',
    verifyRequest: '/account/auth/verify-request',
    error: '/account/auth/error'
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    Email({
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({
        identifier,
        url,
        provider,
      }) {
        await resend?.emails.send({
          from: provider.from,
          to: identifier,
          subject: "Sign in to Sfactory",
          html: `
            <h2>Sign in</h2>

            <p>Click the link below to sign in:</p>

            <p>
              <a href="${url}">
                Sign in
              </a>
            </p>

            <p>This link expires in 24 hours.</p>
          `,
        });
      },
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      async authorize(credentials) {

        console.log(`CredentialsProvider.authorize: starting..`)

        if (!credentials) return null

        const demoUser = {
          id: '1',
          name: 'Demo user',
          email: 'demo@sfactory.dev',
          username: 'demo',
          password: process.env.DEMO_USER_PASSWORD
        }

        if (credentials.username === demoUser.username &&
          credentials.password === demoUser.password) {

          console.log(`CredentialsProvider.authorize: logging in demo user..`)

          return {
            id: demoUser.id,  // Required field
            name: demoUser.name,
            email: demoUser.email,
          }
        }

        return null  // Return null if authentication fails
      },
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
    }),
    /* CredentialsProvider({
      async authorize(credentials) {

        console.log(`CredentialsProvider.authorize(): ${credentials}`)

        try {
          const user = await prisma.user.findFirst({
            where: {
              email: credentials['email']
            }
          });

          if (user !== null) {
            //Compare the hash
            const res = await confirmPasswordHash(
                                credentials['password'],
                                user.password)

            if (res === true) {
              userAccount = {
                userId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isActive: user.isActive
              };
              return userAccount;
            }
            else {
              console.log('Hash not matched logging in');
              return null;
            }
          }
          else {
            return null;
          }
        }
        catch (err) {
          console.log('Authorize error:', err);
        }

      },
      credentials: {}
    }), */
    // OAuth authentication providers...
    // Note: temporarily commented out until app approval from the providers
    /* AppleProvider({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET
    }), */
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // allowDangerousEmailAccountLinking: true,
      httpOptions: {
        timeout: 20000,  // 20 seconds
      }
    }),
    // Passwordless / email sign in
    /* EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest({ identifier, url, provider, theme }) {
        customSendVerificationRequest({ identifier, url, provider, theme })
      }
    }), */
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {

      // Validate the attempted login method. Auth.js keeps a User record
      // separate from the provider Accounts that are linked to it: a user
      // created via email magic-link has no Account rows. If an OAuth login
      // arrives for an email that already has a User but no Account for that
      // OAuth provider, the adapter later throws a generic AccountNotLinked
      // error with no actionable reason. Detect that mismatch here (while the
      // signIn callback still runs) and surface an informative message instead
      // of failing silently.
      if (account?.type === 'oauth' && user?.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true }
        })

        const hasProviderAccount =
          existingUser != null &&
          existingUser.accounts.some(a => a.provider === account.provider)

        if (existingUser != null && !hasProviderAccount) {
          throw new Error(
            `This email already has an account, but not via ${account.provider}. ` +
            'Please sign in with the method you originally used to sign up, or ' +
            'contact support to have this login provider linked.'
          )
        }
      }

      return true
    },
    async redirect({ url, baseUrl }) {

      // Relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }

      // Allow same-origin absolute URLs
      if (new URL(url).origin === baseUrl) {
        return url
      }

      // Fallback
      return baseUrl
    },
    async session({ session, user, token }) {

      if (token != null && session.user != null) {

        // session.user.id = token.id  // Pass user ID to session
        session.user.name = token.name
        session.user.email = token.email
      }

      return session
    },
    async jwt({ token, user, account, profile, isNewUser }) {

      if (user) {
        token.id = user.id  // Attach user ID to token
        token.name = user.name
        token.email = user.email
      }

      return token
    }
  },
  secret: process.env.JWT_SECRET,
  session: {
    strategy: 'jwt'
  }
  // debug: true
})
