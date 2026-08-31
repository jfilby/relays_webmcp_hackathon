import { gql } from '@apollo/client'

export const getLatestActivityQuery = gql`
  query getLatestActivity(
    $userProfileId: String,
    $take: Int) {
    getLatestActivity(
      userProfileId: $userProfileId,
      take: $take) {

      status
      message
      projects {
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
        ownerName
        ownerProfilePublicId
        ownerProfileIsPublic
        urls {
          id
          kind
          url
          label
        }
        interestCount
        viewerIsInterested
      }
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
      comments {
        id
        publicId
        postId
        postPublicId
        postTitle
        parentCommentId
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
