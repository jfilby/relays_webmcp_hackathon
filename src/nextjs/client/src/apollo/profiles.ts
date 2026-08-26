import { gql } from '@apollo/client'

export const createProfileMutation = gql`
  mutation createProfile(
    $userProfileId: String!,
    $displayName: String!,
    $type: String,
    $isPublic: Boolean,
    $headline: String,
    $bio: String,
    $location: String,
    $website: String,
    $avatar: String,
    $updates: Boolean)
  {
    createProfile(
      userProfileId: $userProfileId,
      displayName: $displayName,
      type: $type,
      isPublic: $isPublic,
      headline: $headline,
      bio: $bio,
      location: $location,
      website: $website,
      avatar: $avatar,
      updates: $updates) {

      status
      message
      profile {
        id
        type
        displayName
        headline
        bio
        location
        website
        avatar
        isPublic
      }
    }
  }
`

export const updateProfileMutation = gql`
  mutation updateProfile(
    $id: String!,
    $userProfileId: String!,
    $displayName: String,
    $type: String,
    $isPublic: Boolean,
    $headline: String,
    $bio: String,
    $location: String,
    $website: String,
    $avatar: String)
  {
    updateProfile(
      id: $id,
      userProfileId: $userProfileId,
      displayName: $displayName,
      type: $type,
      isPublic: $isPublic,
      headline: $headline,
      bio: $bio,
      location: $location,
      website: $website,
      avatar: $avatar) {

      status
      message
      profile {
        id
        type
        displayName
        headline
        bio
        location
        website
        avatar
        isPublic
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

export const getProfileByIdQuery = gql`
  query getProfileById(
          $id: String!,
          $userProfileId: String) {
    getProfileById(
      id: $id,
      userProfileId: $userProfileId) {

      status
      message
      profile {
        id
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

export const getProfileByUserProfileIdQuery = gql`
  query getProfileByUserProfileId(
          $userProfileId: String!) {
    getProfileByUserProfileId(
      userProfileId: $userProfileId) {

      status
      message
      profile {
        id
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

export const searchProfilesQuery = gql`
  query searchProfiles(
          $search: String,
          $type: String) {
    searchProfiles(
      search: $search,
      type: $type) {

      status
      message
      profiles {
        id
        type
        displayName
        headline
        location
        website
        avatar
      }
    }
  }
`