import { gql } from '@apollo/client'

export const createProfileMutation = gql`
  mutation createProfile(
    $userProfileId: String!,
    $displayName: String!,
    $updates: Boolean)
  {
    createProfile(
      userProfileId: $userProfileId,
      displayName: $displayName,
      updates: $updates) {

      status
      message
      profile {
        id
        displayName
      }
    }
  }
`

export const setProfileUpdatesMutation = gql`
  mutation setProfileUpdates(
    $userProfileId: String!,
    $updates: Boolean!)
  {
    setProfileUpdates(
      userProfileId: $userProfileId,
      updates: $updates) {

      status
      message
    }
  }
`