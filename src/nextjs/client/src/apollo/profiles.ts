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
    $avatar: String,
    $updates: Boolean,
    $availabilityStatus: String)
  {
    createProfile(
      userProfileId: $userProfileId,
      displayName: $displayName,
      type: $type,
      isPublic: $isPublic,
      headline: $headline,
      bio: $bio,
      location: $location,
      avatar: $avatar,
      updates: $updates,
      availabilityStatus: $availabilityStatus) {

      status
      message
      profile {
        id
        type
        displayName
        headline
        bio
        location
        avatar
        isPublic
        availabilityStatus
        isVerified
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
    $avatar: String,
    $availabilityStatus: String)
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
      avatar: $avatar,
      availabilityStatus: $availabilityStatus) {

      status
      message
      profile {
        id
        type
        displayName
        headline
        bio
        location
        avatar
        isPublic
        availabilityStatus
        isVerified
      }
    }
  }
`

export const deleteProfileAvatarMutation = gql`
  mutation deleteProfileAvatar(
    $userProfileId: String!)
  {
    deleteProfileAvatar(
      userProfileId: $userProfileId) {

      status
      message
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

export const addSkillToProfileMutation = gql`
  mutation addSkillToProfile(
    $userProfileId: String!,
    $skillName: String!,
    $level: String)
  {
    addSkillToProfile(
      userProfileId: $userProfileId,
      skillName: $skillName,
      level: $level) {

      status
      message
    }
  }
`

export const removeSkillFromProfileMutation = gql`
  mutation removeSkillFromProfile(
    $userProfileId: String!,
    $profileSkillId: String!)
  {
    removeSkillFromProfile(
      userProfileId: $userProfileId,
      profileSkillId: $profileSkillId) {

      status
      message
    }
  }
`

export const addProfileLinkMutation = gql`
  mutation addProfileLink(
    $userProfileId: String!,
    $kind: String!,
    $url: String!,
    $handle: String)
  {
    addProfileLink(
      userProfileId: $userProfileId,
      kind: $kind,
      url: $url,
      handle: $handle) {

      status
      message
    }
  }
`

export const deleteProfileLinkMutation = gql`
  mutation deleteProfileLink(
    $userProfileId: String!,
    $id: String!)
  {
    deleteProfileLink(
      userProfileId: $userProfileId,
      id: $id) {

      status
      message
    }
  }
`

export const endorseSkillMutation = gql`
  mutation endorseSkill(
    $userProfileId: String!,
    $toProfileId: String!,
    $skillId: String!,
    $comment: String)
  {
    endorseSkill(
      userProfileId: $userProfileId,
      toProfileId: $toProfileId,
      skillId: $skillId,
      comment: $comment) {

      status
      message
    }
  }
`

export const getProfileByPublicIdQuery = gql`
  query getProfileByPublicId(
          $publicId: String!,
          $userProfileId: String) {
    getProfileByPublicId(
      publicId: $publicId,
      userProfileId: $userProfileId) {

      status
      message
      profile {
        id
        publicId
        userProfileId
        type
        status
        displayName
        headline
        bio
        location
        avatar
        isPublic
        availabilityStatus
        isVerified
        verifiedAt
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
        avatar
        isPublic
        availabilityStatus
        isVerified
        verifiedAt
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
        publicId
        type
        displayName
        headline
        location
        avatar
        availabilityStatus
      }
    }
  }
`

export const getSkillsByProfileIdQuery = gql`
  query getSkillsByProfileId(
          $profileId: String!) {
    getSkillsByProfileId(
      profileId: $profileId) {

      status
      message
      skills {
        id
        skillId
        name
        level
      }
    }
  }
`

export const getProfileLinksByProfileIdQuery = gql`
  query getProfileLinksByProfileId(
          $profileId: String!) {
    getProfileLinksByProfileId(
      profileId: $profileId) {

      status
      message
      links {
        id
        kind
        url
        handle
      }
    }
  }
`

export const getEndorsementsByProfileIdQuery = gql`
  query getEndorsementsByProfileId(
          $profileId: String!) {
    getEndorsementsByProfileId(
      profileId: $profileId) {

      status
      message
      endorsements {
        id
        fromProfileId
        fromDisplayName
        skillId
        skillName
        comment
        created
      }
    }
  }
`
