import { getSession } from 'next-auth/react'
import { AccessService, UsersService } from 'serene-core-client'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { loadServerStartDataMutation } from '@/apollo/load-server-start'
import { defaultUserPreferences } from '@/services/user-preferences/service'

export interface PageContext {

  serverAction?: string

  verifyLoggedInUsersOnly?: boolean
  verifyAdminUsersOnly?: boolean
}

export async function loadServerStartData(
  apolloClient: any,
  pageContext: PageContext,
  queryParams: any) {

  // Debug
  const fnName = `loadServerStartData()`

  console.log(`${fnName}: starting with queryParams: ` +
              JSON.stringify(queryParams))

  // Validate
  if (queryParams.userProfile == null) {
    throw `queryParams.userProfile == null`
  }

  // GraphQL call to get or create instance chat session
  var results: any = null

  await apolloClient.mutate({
    mutation: loadServerStartDataMutation,
    variables: {
      userProfileId: queryParams.userProfile.id,
      instanceId: queryParams.instanceId,
      serverAction: pageContext.serverAction,
    }
  }).then((result: any) => results = result)
    .catch((error: { networkError: any }) => {
      console.log(`${fnName}: error: ${error}`)
      console.log(`${fnName}: error.networkError: ${JSON.stringify(error.networkError)}`)
    })

  // Debug
  // console.log(`${fnName}: results: ` + JSON.stringify(results))

  if (results == null) {
    throw `Failed to load server data`
  }

  // Get data
  const resultsData = results.data.loadServerStartData

  // Handle failed to load
  if (resultsData.status === false) {

    console.log(`${fnName}: loadServerStartDataMutation failed: ` +
      JSON.stringify(resultsData.message))
  }

  // Return
  return resultsData
}

export async function loadServerPage(
  context: any,
  pageContext: PageContext) {

  // Debug
  const fnName = `loadServerPage()`

  // ApolloClient
  const apolloClient = new ApolloClient({
    link: new HttpLink({
      uri: process.env.GRAPHQL_URL
    }),
    cache: new InMemoryCache(),
  })

  // console.log(`${fnName}: created ApolloClient`)

  // URL parameters
  const queryParams = normalizeQuery(context.query)

  // Debug
  // console.log(`${fnName}: queryParams: ` + JSON.stringify(queryParams))

  // Check access
  const accessService = new AccessService()

  queryParams.hasAccessCode = false

  if (accessService.validateAccessCode(
    { req: context.req, res: context.res },
    queryParams.accessCode)) {
    queryParams.hasAccessCode = true
  }

  // Check isAdmin if required
  if (pageContext.verifyAdminUsersOnly === true) {

    const results =
      await accessService.validateUserIsAdmin(
        {
          req: context.req,
          res: context.res
        },
        apolloClient)

    if (results.status === false) {
      console.error(`Access code validation failed: ${results.message}`)

      return {
        notFound: true,
        props: {
          _status: false
        }
      }
    }
  }

  // Session
  const session = await getSession(context)

  /* if (session != null) {

    console.log(`${fnName}: session exists`)
  } else {
    console.log(`${fnName}: session doesn't exist`)
  } */

  if (pageContext.verifyLoggedInUsersOnly === true &&
    session == null) {

    return {
      redirect: {
        destination: '/account/auth/sign-in',
        permanent: false
      },
      props: {}
    }
  }

  // Get/create User
  const usersService = new UsersService()

  queryParams.userProfile = await
    usersService.getOrCreateUser(
      { req: context.req, res: context.res },
      session,
      apolloClient,
      defaultUserPreferences)

  // Get/create server-start data
  const data = await
    loadServerStartData(
      apolloClient,
      pageContext,
      queryParams)

  // Debug
  // console.log(`${fnName}: data: ` + JSON.stringify(data))

  // Signed-in redirects
  if (session != null &&
    data.redirectUrl !== null) {

    return {
      redirect: {
        destination: data.redirectUrl,
        permanent: false
      },
      props: {}
    }
  }

  // Set data results to queryParam entries
  Object.assign(queryParams, data)

  // Set additional queryParams
  queryParams.clientUrl = process.env.CLIENT_URL
  queryParams.serverUrl = process.env.SERVER_URL

  // Debug
  // console.log(`${fnName}: queryParams: ` + JSON.stringify(queryParams))

  // Return with empty props
  return {
    props: queryParams
  }
}

function normalizeQuery(query: Record<string, any>): Record<string, any> {

  const normalized: Record<string, any> = {}

  for (const key in query) {
    normalized[key] = query[key] !== undefined ? query[key] : null
  }

  return normalized
}
