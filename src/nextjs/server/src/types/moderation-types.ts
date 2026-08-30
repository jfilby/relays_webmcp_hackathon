export class ModerationTypes {

  // Ref models (the kinds of content that can be flagged)
  static refModelDiscussPost = 'DiscussPost'
  static refModelDiscussComment = 'DiscussComment'

  static refModels = [
    this.refModelDiscussPost,
    this.refModelDiscussComment
  ]

  // Flag statuses
  static pendingStatus = 'P'
  static dismissedStatus = 'D'
  static resolvedStatus = 'R'
}
