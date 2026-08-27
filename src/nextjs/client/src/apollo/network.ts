import { gql } from '@apollo/client'

export const getNetworkQuery = gql`
  query getNetwork(
          $userProfileId: String!) {
    getNetwork(
      userProfileId: $userProfileId) {

      status
      message
      profiles {
        id
        publicId
        userProfileId
        type
        status
        displayName
        headline
        bio
        location
        website
        avatar
        isPublic
        created
        updated
      }
    }
  }
`
