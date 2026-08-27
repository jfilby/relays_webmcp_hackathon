import { gql } from '@apollo/client'

// Project fields selected everywhere a project is returned. Kept in one
// fragment-like list so queries stay consistent.
const projectFields = `
        id
        publicId
        instanceId
        name
        isOwner
        tagline
        description
        website
        image
        techStack
        stage
        isOpenToCollaborators
        isPromoted
        isPublic
        urls {
          id
          kind
          url
          label
        }
        interestCount
        viewerIsInterested
`

export const createProjectMutation = gql`
  mutation createProject(
    $userProfileId: String!,
    $name: String!,
    $tagline: String,
    $description: String,
    $website: String,
    $image: String,
    $isPromoted: Boolean,
    $isPublic: Boolean,
    $techStack: [String],
    $stage: String,
    $isOpenToCollaborators: Boolean)
  {
    createProject(
      userProfileId: $userProfileId,
      name: $name,
      tagline: $tagline,
      description: $description,
      website: $website,
      image: $image,
      isPromoted: $isPromoted,
      isPublic: $isPublic,
      techStack: $techStack,
      stage: $stage,
      isOpenToCollaborators: $isOpenToCollaborators) {

      status
      message
      project {
${projectFields}
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
    $isPublic: Boolean,
    $techStack: [String],
    $stage: String,
    $isOpenToCollaborators: Boolean)
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
      isPublic: $isPublic,
      techStack: $techStack,
      stage: $stage,
      isOpenToCollaborators: $isOpenToCollaborators) {

      status
      message
      project {
${projectFields}
      }
    }
  }
`

export const toggleProjectInterestMutation = gql`
  mutation toggleProjectInterest(
    $userProfileId: String!,
    $projectId: String!)
  {
    toggleProjectInterest(
      userProfileId: $userProfileId,
      projectId: $projectId) {

      status
      message
      interested
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

export const getProjectByPublicIdQuery = gql`
  query getProjectByPublicId(
          $publicId: String!,
          $userProfileId: String) {
    getProjectByPublicId(
      publicId: $publicId,
      userProfileId: $userProfileId) {

      status
      message
      project {
${projectFields}
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
${projectFields}
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
${projectFields}
        status
        created
        updated
      }
    }
  }
`
