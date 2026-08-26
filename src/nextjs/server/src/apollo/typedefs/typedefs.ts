export const typeDefs = /* GraphQL */ `

  # Serene Core (types)
  # ---

  type ChatMessage {
    id: String!
    name: String!
    message: String!
    created: String!
    updated: String
  }

  type ChatMessageResults {
    status: Boolean!
    message: String
    chatMessages: [ChatMessage]
  }

  type ChatParticipant {
    id: String!
    userProfileId: String!
    name: String
  }

  type ChatParticipantResults {
    status: Boolean!
    message: String
    chatParticipants: [ChatParticipant]
  }

  type ChatSession {
    id: String!
    status: String!
    updated: String!
    chatParticipants: [ChatParticipant]
  }

  type ChatSessionResults {
    status: Boolean!
    message: String
    chatSession: ChatSession

    chatSpeakPreference: Boolean
  }

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

  type ProjectResults {
    status: Boolean!
    message: String
    deletedCount: Int
    instances: [Instance]
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
    chatSession: ChatSession
    authCode: String
    username: Username
    redirectUrl: String

    pageUser: PageUser
    pageProject: PageProject
  }

  # Queries
  # ---

  type Query {

    # Serene Core
    # ---

    # Chats
    getChatMessages(
      chatSessionId: String,
      userProfileId: String!,
      lastMessageId: String): ChatMessageResults!

    getChatParticipants(
      chatSessionId: String,
      userProfileId: String!): ChatParticipantResults!

    getChatSession(
      chatSessionId: String,
      userProfileId: String!): ChatSessionResults!

    getChatSessions(
      status: String,
      userProfileId: String!): [ChatSession]

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

    # API keys
    getApiKeys(
      userProfileId: String!,
      instanceId: String): ApiKeyResults!

    # Environments
    getEnvInstances(
      userProfileId: String!,
      projectId: String!): EnvInstancesResults!

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
      pageUsername: String,
      pageProjectKey: String,
      serverAction: String,
      loadChatSession: Boolean,
      chatSessionId: String,
      chatSettingsName: String): ServerStartData!

    # Sign-ups
    signUpForUpdates(
      email: String,
      userProfileId: String): StatusAndMessage!

    # Email updates
    setUsernameUpdates(
      userProfileId: String!,
      updates: Boolean!): StatusAndMessage!
  }
`
