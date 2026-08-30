import { gql } from '@apollo/client'

export const loadServerStartDataMutation = gql`
  mutation loadServerStartData(
             $userProfileId: String!,
             $instanceId: String,
             $serverAction: String) {
    loadServerStartData(
      userProfileId: $userProfileId,
      instanceId: $instanceId,
      serverAction: $serverAction) {

      status
      message
      authCode
      redirectUrl
      profile {
        id
        type
        displayName
        headline
        bio
        location
        avatar
        isPublic
      }
    }
  }
`

export const getOrCreateUserByEmailMutation = gql`
  mutation getOrCreateUserByEmail(
             $email: String!,
             $defaultUserPreferences: String) {
    getOrCreateUserByEmail(
      email: $email,
      defaultUserPreferences: $defaultUserPreferences) {

      id
    }
  }
`