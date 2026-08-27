import { gql } from '@apollo/client'

export const sendConnectionRequestMutation = gql`
  mutation sendConnectionRequest(
    $userProfileId: String!,
    $toProfileId: String!,
    $message: String)
  {
    sendConnectionRequest(
      userProfileId: $userProfileId,
      toProfileId: $toProfileId,
      message: $message) {

      status
      message
    }
  }
`

export const respondToConnectionRequestMutation = gql`
  mutation respondToConnectionRequest(
    $userProfileId: String!,
    $connectionId: String!,
    $response: String!)
  {
    respondToConnectionRequest(
      userProfileId: $userProfileId,
      connectionId: $connectionId,
      response: $response) {

      status
      message
    }
  }
`

export const removeConnectionMutation = gql`
  mutation removeConnection(
    $userProfileId: String!,
    $peerProfileId: String!)
  {
    removeConnection(
      userProfileId: $userProfileId,
      peerProfileId: $peerProfileId) {

      status
      message
    }
  }
`

export const getIncomingConnectionRequestsQuery = gql`
  query getIncomingConnectionRequests(
          $userProfileId: String!) {
    getIncomingConnectionRequests(
      userProfileId: $userProfileId) {

      status
      message
      requests {
        id
        fromProfileId
        fromDisplayName
        fromAvatar
        fromType
        message
        created
      }
    }
  }
`
