import { gql } from '@apollo/client'

export const flagContentMutation = gql`
  mutation flagContent(
          $userProfileId: String!,
          $refModel: String!,
          $refId: String!) {
    flagContent(
      userProfileId: $userProfileId,
      refModel: $refModel,
      refId: $refId) {
      status
      message
    }
  }
`

export const getModerationQueueQuery = gql`
  query getModerationQueue(
          $userProfileId: String!) {
    getModerationQueue(
      userProfileId: $userProfileId) {

      status
      message
      items {
        id
        refModel
        refId
        contentPublicId
        postPublicId
        title
        excerpt
        authorName
        authorProfilePublicId
        flagCount
        created
        updated
      }
    }
  }
`

export const setModerationFlagStatusMutation = gql`
  mutation setModerationFlagStatus(
          $userProfileId: String!,
          $refModel: String!,
          $refId: String!,
          $status: String!) {
    setModerationFlagStatus(
      userProfileId: $userProfileId,
      refModel: $refModel,
      refId: $refId,
      status: $status) {
      status
      message
    }
  }
`

export const deleteFlaggedContentMutation = gql`
  mutation deleteFlaggedContent(
          $userProfileId: String!,
          $refModel: String!,
          $refId: String!) {
    deleteFlaggedContent(
      userProfileId: $userProfileId,
      refModel: $refModel,
      refId: $refId) {
      status
      message
    }
  }
`
