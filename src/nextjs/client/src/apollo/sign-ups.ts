import { gql } from '@apollo/client'

export const signUpForUpdatesMutation = gql`
  mutation signUpForUpdates(
    $email: String,
    $userProfileId: String)
  {
    signUpForUpdates(
      email: $email,
      userProfileId: $userProfileId) {

      status
      message
    }
  }
`