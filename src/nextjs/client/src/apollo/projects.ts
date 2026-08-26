import { gql } from '@apollo/client'

export const createProjectMutation = gql`
  mutation createProject(
    $userProfileId: String!,
    $name: String!,
    $tagline: String,
    $description: String,
    $website: String,
    $image: String,
    $isPromoted: Boolean,
    $isPublic: Boolean)
  {
    createProject(
      userProfileId: $userProfileId,
      name: $name,
      tagline: $tagline,
      description: $description,
      website: $website,
      image: $image,
      isPromoted: $isPromoted,
      isPublic: $isPublic) {

      status
      message
      project {
        id
        instanceId
        name
        isOwner
        tagline
        description
        website
        image
        isPromoted
        isPublic
      }
    }
  }
`

export const updateProjectMutation = gql`
  mutation updateProject(
    $id: String!,
    $userProfileId: String!,
    $name: String,
    $tagline: String,
    $description: String,
    $website: String,
    $image: String,
    $isPromoted: Boolean,
    $isPublic: Boolean)
  {
    updateProject(
      id: $id,
      userProfileId: $userProfileId,
      name: $name,
      tagline: $tagline,
      description: $description,
      website: $website,
      image: $image,
      isPromoted: $isPromoted,
      isPublic: $isPublic) {

      status
      message
      project {
        id
        instanceId
        name
        isOwner
        tagline
        description
        website
        image
        isPromoted
        isPublic
      }
    }
  }
`

export const deleteProjectMutation = gql`
  mutation deleteProject(
    $id: String!,
    $userProfileId: String!)
  {
    deleteProject(
      id: $id,
      userProfileId: $userProfileId) {

      status
      message
    }
  }
`

export const getProjectByIdQuery = gql`
  query getProjectById(
          $id: String!,
          $userProfileId: String) {
    getProjectById(
      id: $id,
      userProfileId: $userProfileId) {

      status
      message
      project {
        id
        instanceId
        name
        isOwner
        tagline
        description
        website
        image
        isPromoted
        isPublic
        status
        created
        updated
      }
    }
  }
`

export const searchProjectsQuery = gql`
  query searchProjects(
          $search: String,
          $isPromoted: Boolean) {
    searchProjects(
      search: $search,
      isPromoted: $isPromoted) {

      status
      message
      projects {
        id
        instanceId
        name
        isOwner
        tagline
        description
        website
        image
        isPromoted
        isPublic
      }
    }
  }
`

export const getProjectsByUserProfileIdQuery = gql`
  query getProjectsByUserProfileId(
          $userProfileId: String!) {
    getProjectsByUserProfileId(
      userProfileId: $userProfileId) {

      status
      message
      projects {
        id
        instanceId
        name
        isOwner
        tagline
        description
        website
        image
        isPromoted
        isPublic
        status
        created
        updated
      }
    }
  }
`