import { gql } from '@apollo/client'

export const getDmConversationsQuery = gql`
  query getDmConversations(
    $userProfileId: String!) {
    getDmConversations(
      userProfileId: $userProfileId) {

      status
      message
      conversations {
        peer {
          id
          publicId
          displayName
          avatar
          type
        }
        lastMessage {
          id
          fromProfileId
          toProfileId
          message
          readAt
          created
        }
        unreadCount
        created
      }
    }
  }
`

export const getDmMessagesQuery = gql`
  query getDmMessages(
    $userProfileId: String!,
    $withProfilePublicId: String!) {
    getDmMessages(
      userProfileId: $userProfileId,
      withProfilePublicId: $withProfilePublicId) {

      status
      message
      peer {
        id
        publicId
        displayName
        avatar
        type
      }
      messages {
        id
        fromProfileId
        toProfileId
        message
        readAt
        created
      }
    }
  }
`

export const sendDmMutation = gql`
  mutation sendDm(
    $userProfileId: String!,
    $toProfilePublicId: String!,
    $message: String!) {
    sendDm(
      userProfileId: $userProfileId,
      toProfilePublicId: $toProfilePublicId,
      message: $message) {

      status
      message
      messageItem {
        id
        fromProfileId
        toProfileId
        message
        readAt
        created
      }
      peer {
        id
        publicId
        displayName
        avatar
        type
      }
    }
  }
`

export const markDmThreadReadMutation = gql`
  mutation markDmThreadRead(
    $userProfileId: String!,
    $withProfilePublicId: String!) {
    markDmThreadRead(
      userProfileId: $userProfileId,
      withProfilePublicId: $withProfilePublicId) {

      status
      message
    }
  }
`
