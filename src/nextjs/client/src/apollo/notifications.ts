import { gql } from '@apollo/client'

export const getNotificationsQuery = gql`
  query getNotifications(
          $userProfileId: String!,
          $unreadOnly: Boolean) {
    getNotifications(
      userProfileId: $userProfileId,
      unreadOnly: $unreadOnly) {

      status
      message
      notifications {
        id
        type
        refModel
        refId
        readAt
        created
      }
    }
  }
`

export const markNotificationAsReadMutation = gql`
  mutation markNotificationAsRead(
    $userProfileId: String!,
    $id: String!)
  {
    markNotificationAsRead(
      userProfileId: $userProfileId,
      id: $id) {

      status
      message
    }
  }
`
