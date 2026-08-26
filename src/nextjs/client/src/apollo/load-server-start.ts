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
    }
  }
`
