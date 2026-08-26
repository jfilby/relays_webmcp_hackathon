import type { AppProps } from 'next/app'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { SessionProvider } from 'next-auth/react'
import Head from 'next/head'
import './styles.css'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { blackAndWhiteTheme } from '@/components/layouts/themes/black-and-white'

const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL_FULL
  }),
  cache: new InMemoryCache()
})

export default function App({
  Component,
  pageProps
}: AppProps) {

  // Consts
  const siteDescription = process.env.NEXT_PUBLIC_TAG_LINE

  // Render
  return (
    <>
      <Head>
        <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
        <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width' />
        <meta name='description' content={siteDescription} key='desc' />
      </Head>
      <SessionProvider session={pageProps.session}>
        <ApolloProvider client={apolloClient}>
          <ThemeProvider theme={blackAndWhiteTheme}>
            <CssBaseline />
            <Component {...pageProps} />
          </ThemeProvider>
        </ApolloProvider>
      </SessionProvider>
    </>
  )
}