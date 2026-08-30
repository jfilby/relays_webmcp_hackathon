import { gql } from '@apollo/client'

export const getDiscussPostsQuery = gql`
  query getDiscussPosts(
          $profileId: String,
          $projectId: String) {
    getDiscussPosts(
      profileId: $profileId,
      projectId: $projectId) {

      status
      message
      posts {
        id
        publicId
        authorProfileId
        authorName
        projectId
        title
        body
        commentCount
        created
      }
    }
  }
`

export const searchDiscussPostsQuery = gql`
  query searchDiscussPosts(
          $search: String) {
    searchDiscussPosts(
      search: $search) {

      status
      message
      posts {
        id
        publicId
        authorProfileId
        authorName
        projectId
        title
        body
        commentCount
        created
      }
    }
  }
`

export const getDiscussPostByPublicIdQuery = gql`
  query getDiscussPostByPublicId(
          $publicId: String!) {
    getDiscussPostByPublicId(
      publicId: $publicId) {

      status
      message
      post {
        id
        publicId
        authorProfileId
        authorName
        authorProfilePublicId
        authorProfileIsPublic
        projectId
        title
        body
        commentCount
        created
      }
    }
  }
`

export const getDiscussCommentsByPostIdQuery = gql`
  query getDiscussCommentsByPostId(
          $postId: String!) {
    getDiscussCommentsByPostId(
      postId: $postId) {

      status
      message
      comments {
        id
        publicId
        postId
        authorProfileId
        authorName
        authorProfilePublicId
        authorProfileIsPublic
        body
        created
        deleted
      }
    }
  }
`

export const createDiscussPostMutation = gql`
  mutation createDiscussPost(
    $userProfileId: String!,
    $title: String!,
    $body: String!,
    $projectId: String)
  {
    createDiscussPost(
      userProfileId: $userProfileId,
      title: $title,
      body: $body,
      projectId: $projectId) {
      status
      message

      post {
        id
        publicId
      }
    }
  }
`

export const deleteDiscussPostMutation = gql`
  mutation deleteDiscussPost(
    $userProfileId: String!,
    $id: String!)
  {
    deleteDiscussPost(
      userProfileId: $userProfileId,
      id: $id) {

      status
      message
    }
  }
`

export const createDiscussCommentMutation = gql`
  mutation createDiscussComment(
    $userProfileId: String!,
    $postId: String!,
    $body: String!,
    $parentCommentId: String)
  {
    createDiscussComment(
      userProfileId: $userProfileId,
      postId: $postId,
      body: $body,
      parentCommentId: $parentCommentId) {

      status
      message
    }
  }
`

export const deleteDiscussCommentMutation = gql`
  mutation deleteDiscussComment(
    $userProfileId: String!,
    $id: String!)
  {
    deleteDiscussComment(
      userProfileId: $userProfileId,
      id: $id) {

      status
      message
    }
  }
`
