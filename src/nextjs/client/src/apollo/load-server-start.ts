import { gql } from '@apollo/client'

export const loadServerStartDataMutation = gql`
  mutation loadServerStartData(
             $userProfileId: String!,
             $instanceId: String,
             $pageUsername: String,
             $pageProjectKey: String,
             $serverAction: String,
             $loadChatSession: Boolean,
             $chatSessionId: String,
             $chatSettingsName: String) {
    loadServerStartData(
      userProfileId: $userProfileId,
      instanceId: $instanceId,
      pageUsername: $pageUsername,
      pageProjectKey: $pageProjectKey,
      serverAction: $serverAction,
      loadChatSession: $loadChatSession,
      chatSessionId: $chatSessionId,
      chatSettingsName: $chatSettingsName) {

      status
      message
      chatSession {
        id
        status
        chatParticipants {
          id
          userProfileId
        }
      }
      authCode
      username {
        key
        name
        getEmailUpdates
      }
      redirectUrl
      pageProject {
        instance {
          id
          publicId
          parentId
          status
          key
          name
          parent {
            id
            parentId
            status
            name
          }
        }
        isViewersProject
      }
      pageUser {
        username {
          publicId
          key
          name
          getEmailUpdates
        }
        isViewer
      }
    }
  }
`
