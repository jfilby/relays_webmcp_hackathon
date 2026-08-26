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

  type Project {
    id: String!
    instanceId: String!
    name: String!
    isOwner: Boolean!
    tagline: String
    description: String
    website: String
    image: String
    isPromoted: Boolean!
    isPublic: Boolean!
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
    getProfileById(
      id: String!,
      userProfileId: String): ProfileResults!

    getProfileByUserProfileId(
      userProfileId: String!): ProfileResults!

    searchProfiles(
      search: String,
      type: String): ProfilesResults!

    getNetwork(
      userProfileId: String!): ProfilesResults!

    # Projects
    getProjectById(
      id: String!,
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
      updates: Boolean): ProfileResults!

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
      avatar: String): ProfileResults!

    setProfileUpdates(
      userProfileId: String!,
      updates: Boolean!): StatusAndMessage!

    # Projects
    createProject(
      userProfileId: String!,
      name: String!,
      tagline: String,
      description: String,
      website: String,
      image: String,
      isPromoted: Boolean,
      isPublic: Boolean): ProjectResults!

    updateProject(
      id: String!,
      userProfileId: String!,
      name: String,
      tagline: String,
      description: String,
      website: String,
      image: String,
      isPromoted: Boolean,
      isPublic: Boolean): ProjectResults!

    deleteProject(
      id: String!,
      userProfileId: String!): DeleteProjectResults!
  }
`
