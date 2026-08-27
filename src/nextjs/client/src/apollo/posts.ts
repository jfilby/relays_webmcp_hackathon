import { gql } from '@apollo/client'

export const createPostMutation = gql`
  mutation createPost(
    $userProfileId: String!,
    $body: String!,
    $projectId: String)
  {
    createPost(
      userProfileId: $userProfileId,
      body: $body,
      projectId: $projectId) {

      status
      message
    }
  }
`

export const deletePostMutation = gql`
  mutation deletePost(
    $userProfileId: String!,
    $id: String!)
  {
    deletePost(
      userProfileId: $userProfileId,
      id: $id) {

      status
      message
    }
  }
`

export const getPostsByProfileIdQuery = gql`
  query getPostsByProfileId(
          $profileId: String!) {
    getPostsByProfileId(
      profileId: $profileId) {

      status
      message
      posts {
        id
        authorProfileId
        authorName
        projectId
        body
        created
      }
    }
  }
`

export const getPostsByProjectIdQuery = gql`
  query getPostsByProjectId(
          $projectId: String!) {
    getPostsByProjectId(
      projectId: $projectId) {

      status
      message
      posts {
        id
        authorProfileId
        authorName
        projectId
        body
        created
      }
    }
  }
`
