export const typeDefs = /* GraphQL */ `

  # Serene Core (types)
  # ---

  type ExistsResults {
    status: Boolean!
    message: String
    exists: Boolean
  }

  type Instance {
    id: String!
    publicId: String!
    userProfile: UserProfile!
    parentId: String
    instanceType: String
    projectType: String
    status: String!
    key: String!
    name: String!

    parent: Instance
  }

  type StatusAndMessage {
    status: Boolean!
    message: String
  }

  type StatusAndMessageAndKey {
    status: Boolean!
    message: String
    key: String
  }

  type Tip {
    id: String!
    name: String!
    tags: [String]
  }

  type TipsResults {
    status: Boolean!
    message: String
    tips: [Tip]
  }

  type User {
    id: String!
    name: String
  }

  type UserPreference {
    category: String!
    key: String!
    value: String
    values: [String]
  }

  type UserProfile {
    id: String!
    userId: String
    user: User
    isAdmin: Boolean!
  }

  # Relays (types)
  # ---

  type ServerStartData {
    status: Boolean!
    message: String
    instance: Instance
    profile: Profile
    authCode: String
    redirectUrl: String
  }

  type Profile {
    id: String!
    publicId: String!
    userProfileId: String!
    type: String!
    status: String!
    displayName: String!
    headline: String
    bio: String
    location: String
    website: String
    avatar: String
    isPublic: Boolean!
    availabilityStatus: String
    isVerified: Boolean
    isDemoData: Boolean
    verifiedAt: String
    created: String!
    updated: String
  }

  type ProfileResults {
    status: Boolean!
    message: String
    profile: Profile
  }

  type ProfilesResults {
    status: Boolean!
    message: String
    profiles: [Profile]
  }

  # Skills

  type ProfileSkillItem {
    id: String!
    skillId: String!
    name: String
    level: String
  }

  type ProfileSkillsResults {
    status: Boolean!
    message: String
    skills: [ProfileSkillItem]
  }

  # Profile links

  type ProfileLinkItem {
    id: String!
    kind: String!
    url: String!
    handle: String
  }

  type ProfileLinksResults {
    status: Boolean!
    message: String
    links: [ProfileLinkItem]
  }

  # Endorsements

  type EndorsementItem {
    id: String!
    fromProfileId: String!
    fromDisplayName: String
    skillId: String!
    skillName: String
    comment: String
    created: String!
  }

  type EndorsementsResults {
    status: Boolean!
    message: String
    endorsements: [EndorsementItem]
  }

  # Discussion

  type DiscussPostItem {
    id: String!
    publicId: String!
    authorProfileId: String!
    authorName: String
    authorProfilePublicId: String
    authorProfileIsPublic: Boolean
    projectId: String
    title: String!
    body: String!
    commentCount: Int!
    created: String!
  }

  type DiscussPostResults {
    status: Boolean!
    message: String
    post: DiscussPostItem
  }

  type DiscussPostsResults {
    status: Boolean!
    message: String
    posts: [DiscussPostItem]
  }

  type DiscussCommentItem {
    id: String!
    publicId: String!
    postId: String!
    parentCommentId: String
    authorProfileId: String!
    authorName: String
    authorProfilePublicId: String
    authorProfileIsPublic: Boolean
    body: String!
    created: String!
    deleted: String
  }

  type DiscussCommentsResults {
    status: Boolean!
    message: String
    comments: [DiscussCommentItem]
  }

  # Connections

  type IncomingConnectionRequest {
    id: String!
    fromProfileId: String!
    fromDisplayName: String!
    fromAvatar: String
    fromType: String
    message: String
    created: String!
  }

  type IncomingConnectionRequestsResults {
    status: Boolean!
    message: String
    requests: [IncomingConnectionRequest]
  }

  # Notifications

  type NotificationItem {
    id: String!
    type: String!
    refModel: String
    refId: String
    readAt: String
    created: String!
  }

  type NotificationsResults {
    status: Boolean!
    message: String
    notifications: [NotificationItem]
  }

  # Projects

  type ProjectUrl {
    id: String!
    kind: String!
    url: String!
    label: String
  }

  type Project {
    id: String!
    publicId: String!
    instanceId: String!
    name: String!
    isOwner: Boolean!
    tagline: String
    description: String
    website: String
    image: String
    techStack: [String]
    stage: String
    isOpenToCollaborators: Boolean
    isPromoted: Boolean!
    isDemoData: Boolean
    isPublic: Boolean!
    urls: [ProjectUrl]
    interestCount: Int
    viewerIsInterested: Boolean
    status: String!
    created: String!
    updated: String
  }

  type ProjectResults {
    status: Boolean!
    message: String
    project: Project
  }

  type ProjectsResults {
    status: Boolean!
    message: String
    projects: [Project]
  }

  type DeleteProjectResults {
    status: Boolean!
    message: String
  }

  type InterestToggleResult {
    status: Boolean!
    message: String
    interested: Boolean
  }

  # Collaboration plans

  type CollaborationPlan {
    id: String!
    projectId: String!
    projectName: String
    createdByProfileId: String!
    createdByName: String
    targetProfileId: String
    targetName: String
    status: String!
    title: String!
    description: String
    rolesNeeded: [String]
    commitmentLevel: String
    compensation: String
    deliverables: String
    startBy: String
    completedAt: String
    created: String!
    updated: String
  }

  type PlansResults {
    status: Boolean!
    message: String
    plans: [CollaborationPlan]
  }

  type PlanResults {
    status: Boolean!
    message: String
    plan: CollaborationPlan
  }

  type PlanStep {
    id: String!
    planId: String!
    seq: Int!
    title: String!
    description: String
    status: String!
  }

  type PlanStepsResults {
    status: Boolean!
    message: String
    steps: [PlanStep]
  }

  # Queries
  # ---

  type Query {

    # Serene Core
    # ---

    # Profile
    validateProfileCompleted(
      forAction: String!,
      userProfileId: String!): StatusAndMessage!

    # Tips
    getTipsByUserProfileIdAndTags(
      userProfileId: String!,
      tags: [String]): TipsResults!

    tipGotItExists(
      name: String!,
      userProfileId: String!): ExistsResults!

    # Users
    isAdminUser(userProfileId: String!): StatusAndMessage!
    userById(userProfileId: String!): UserProfile
    verifySignedInUserProfileId(userProfileId: String!): Boolean

    # User preferences
    getUserPreferences(
      userProfileId: String!,
      category: String!,
      keys: [String]): [UserPreference]

    # Relays
    # ---

    # Instances
    filterInstances(
      instanceType: String,
      projectType: String,
      parentId: String,
      status: String,
      userProfileId: String!): [Instance]

    filterProjectInstances(
      parentId: String,
      userProfileId: String!
      instanceType: String,
      projectType: String,
      status: String): [Instance]

    instanceById(
      id: String!,
      userProfileId: String!,
      includeParent: Boolean,
      includeInstanceRefs: Boolean,
      includeStats: Boolean): Instance

    # Profiles
    getProfileByPublicId(
      publicId: String!,
      userProfileId: String): ProfileResults!

    getProfileByUserProfileId(
      userProfileId: String!): ProfileResults!

    searchProfiles(
      search: String,
      type: String): ProfilesResults!

    getNetwork(
      userProfileId: String!): ProfilesResults!

    # Profile skills, links, endorsements
    getSkillsByProfileId(
      profileId: String!): ProfileSkillsResults!

    getProfileLinksByProfileId(
      profileId: String!): ProfileLinksResults!

    getEndorsementsByProfileId(
      profileId: String!): EndorsementsResults!

    # Connections
    getIncomingConnectionRequests(
      userProfileId: String!): IncomingConnectionRequestsResults!

    # Notifications
    getNotifications(
      userProfileId: String!,
      unreadOnly: Boolean): NotificationsResults!

    # Discussion
    getDiscussPosts(
      profileId: String,
      projectId: String): DiscussPostsResults!

    searchDiscussPosts(
      search: String): DiscussPostsResults!

    getDiscussPostByPublicId(
      publicId: String!): DiscussPostResults!

    getDiscussCommentsByPostId(
      postId: String!): DiscussCommentsResults!

    # Collaboration plans
    searchCollaborationPlans(
      projectId: String,
      userProfileId: String): PlansResults!

    getCollaborationPlanById(
      id: String!): PlanResults!

    getPlanStepsByPlanId(
      planId: String!): PlanStepsResults!

    # Projects
    getProjectByPublicId(
      publicId: String!,
      userProfileId: String): ProjectResults!

    searchProjects(
      search: String,
      isPromoted: Boolean): ProjectsResults!

    getProjectsByUserProfileId(
      userProfileId: String!): ProjectsResults!
  }

  type Mutation {

    # Serene Core
    # ---

    # Users
    createBlankUser: UserProfile!
    createUserByEmail(email: String!): UserProfile!
    deactivateUserProfileCurrentIFile(id: String!): Boolean
    getOrCreateSignedOutUser(
      signedOutId: String,
      defaultUserPreferences: String): UserProfile!
    getOrCreateUserByEmail(
      email: String!,
      defaultUserPreferences: String): UserProfile!

    # Tips
    deleteTipGotIt(
      name: String,
      userProfileId: String!): StatusAndMessage!

    upsertTipGotIt(
      name: String!,
      userProfileId: String!): StatusAndMessage!

    # User preferences
    upsertUserPreference(
      userProfileId: String!,
      category: String!,
      key: String!,
      value: String,
      values: [String]): Boolean

    # Relays
    # ---

    # Start
    loadServerStartData(
      userProfileId: String!,
      instanceId: String,
      serverAction: String): ServerStartData!

    # Sign-ups
    signUpForUpdates(
      email: String,
      userProfileId: String): StatusAndMessage!

    # Profiles
    createProfile(
      userProfileId: String!,
      displayName: String!,
      type: String,
      isPublic: Boolean,
      headline: String,
      bio: String,
      location: String,
      website: String,
      avatar: String,
      updates: Boolean,
      availabilityStatus: String): ProfileResults!

    updateProfile(
      id: String!,
      userProfileId: String!,
      displayName: String,
      type: String,
      isPublic: Boolean,
      headline: String,
      bio: String,
      location: String,
      website: String,
      avatar: String,
      availabilityStatus: String): ProfileResults!

    setProfileUpdates(
      userProfileId: String!,
      updates: Boolean!): StatusAndMessage!

    # Profile skills
    addSkillToProfile(
      userProfileId: String!,
      skillName: String!,
      level: String): StatusAndMessage!

    removeSkillFromProfile(
      userProfileId: String!,
      profileSkillId: String!): StatusAndMessage!

    # Profile links
    addProfileLink(
      userProfileId: String!,
      kind: String!,
      url: String!,
      handle: String): StatusAndMessage!

    deleteProfileLink(
      userProfileId: String!,
      id: String!): StatusAndMessage!

    # Endorsements
    endorseSkill(
      userProfileId: String!,
      toProfileId: String!,
      skillId: String!,
      comment: String): StatusAndMessage!

    # Connections
    sendConnectionRequest(
      userProfileId: String!,
      toProfileId: String!,
      message: String): StatusAndMessage!

    respondToConnectionRequest(
      userProfileId: String!,
      connectionId: String!,
      response: String!): StatusAndMessage!

    removeConnection(
      userProfileId: String!,
      peerProfileId: String!): StatusAndMessage!

    # Discussion
    createDiscussPost(
      userProfileId: String!,
      title: String!,
      body: String!,
      projectId: String): StatusAndMessageAndPost!

    deleteDiscussPost(
      userProfileId: String!,
      id: String!): StatusAndMessage!

    createDiscussComment(
      userProfileId: String!,
      postId: String!,
      body: String!,
      parentCommentId: String): StatusAndMessageAndComment!

    deleteDiscussComment(
      userProfileId: String!,
      id: String!): StatusAndMessage!

    # Notifications
    markNotificationAsRead(
      userProfileId: String!,
      id: String!): StatusAndMessage!

    # Collaboration plans
    createPlan(
      userProfileId: String!,
      projectId: String!,
      title: String!,
      description: String,
      targetProfileId: String,
      rolesNeeded: [String],
      commitmentLevel: String,
      compensation: String,
      deliverables: String,
      startBy: String): StatusAndMessage!

    updatePlan(
      id: String!,
      userProfileId: String!,
      title: String,
      description: String,
      rolesNeeded: [String],
      commitmentLevel: String,
      compensation: String,
      deliverables: String,
      startBy: String): StatusAndMessage!

    setPlanStatus(
      id: String!,
      userProfileId: String!,
      status: String!): StatusAndMessage!

    addPlanStep(
      userProfileId: String!,
      planId: String!,
      title: String!,
      description: String): StatusAndMessage!

    updatePlanStep(
      id: String!,
      userProfileId: String!,
      title: String,
      description: String,
      status: String): StatusAndMessage!

    deletePlanStep(
      id: String!,
      userProfileId: String!): StatusAndMessage!

    # Projects
    createProject(
      userProfileId: String!,
      name: String!,
      tagline: String,
      description: String,
      website: String,
      image: String,
      isPromoted: Boolean,
      isPublic: Boolean,
      techStack: [String],
      stage: String,
      isOpenToCollaborators: Boolean): ProjectResults!

    updateProject(
      id: String!,
      userProfileId: String!,
      name: String,
      tagline: String,
      description: String,
      website: String,
      image: String,
      isPromoted: Boolean,
      isPublic: Boolean,
      techStack: [String],
      stage: String,
      isOpenToCollaborators: Boolean): ProjectResults!

    toggleProjectInterest(
      userProfileId: String!,
      projectId: String!): InterestToggleResult!

    deleteProject(
      id: String!,
      userProfileId: String!): DeleteProjectResults!
  }

  type StatusAndMessageAndPost {
    status: Boolean!
    message: String
    post: DiscussPostItem
  }

  type StatusAndMessageAndComment {
    status: Boolean!
    message: String
    comment: DiscussCommentItem
  }
`
