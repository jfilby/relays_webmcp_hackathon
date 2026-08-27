import { gql } from '@apollo/client'

export const getDiscussPostsQuery = gql`
  query getDiscussPosts {
    getDiscussPosts {

      status
      message
      posts {
        id
        authorProfileId
        authorName
        title
        body
        commentCount
        created
      }
    }
  }
`

export const getDiscussPostByIdQuery = gql`
  query getDiscussPostById(
          $id: String!) {
    getDiscussPostById(
      id: $id) {

      status
      message
      post {
        id
        authorProfileId
        authorName
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
        postId
        authorProfileId
        authorName
        body
        created
      }
    }
  }
`

export const createDiscussPostMutation = gql`
  mutation createDiscussPost(
    $userProfileId: String!,
    $title: String!,
    $body: String!)
  {
    createDiscussPost(
      userProfileId: $userProfileId,
      title: $title,
      body: $body) {

      status
      message
      post {
        id
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
    $body: String!)
  {
    createDiscussComment(
      userProfileId: $userProfileId,
      postId: $postId,
      body: $body) {

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
