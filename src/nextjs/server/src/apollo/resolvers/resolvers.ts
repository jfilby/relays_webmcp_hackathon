// Serene Core imports
import { sereneCoreAccessQueryResolvers, sereneCoreUserPreferencesQueryResolvers, sereneCoreProfileQueryResolvers, sereneCoreUsersQueryResolvers } from 'serene-core-server'
import { sereneCoreUserPreferencesMutationResolvers, sereneCoreUsersMutationResolvers } from 'serene-core-server'

// Relays queries imports
import {
  getProfileById,
  getProfileByUserProfileId,
  searchProfiles,
  getNetwork,
  getSkillsByProfileId,
  getProfileLinksByProfileId,
  getEndorsementsByProfileId,
  getPostsByProfileId
} from './queries/profiles'
import {
  getProjectById,
  searchProjects,
  getProjectsByUserProfileId,
  getPostsByProjectId
} from './queries/projects'
import {
  getIncomingConnectionRequests,
  sendConnectionRequest,
  respondToConnectionRequest,
  removeConnection
} from './connections'
import {
  getNotifications,
  markNotificationAsRead
} from './notifications'
import {
  getCollaborationPlanById,
  searchCollaborationPlans,
  getPlanStepsByPlanId,
  createPlan,
  updatePlan,
  setPlanStatus,
  addPlanStep,
  updatePlanStep,
  deletePlanStep
} from './collaboration'

// Relays mutations imports
import { loadServerStartData } from './mutations/server-data-start'
import { signUpForUpdates } from './mutations/sign-ups'
import {
  createProfile,
  updateProfile,
  setProfileUpdates,
  addSkillToProfile,
  removeSkillFromProfile,
  addProfileLink,
  deleteProfileLink,
  endorseSkill,
  createPost,
  deletePost
} from './mutations/profiles'
import {
  createProject,
  updateProject,
  toggleProjectInterest,
  deleteProject
} from './mutations/projects'

// Code
const Query = {

  // Serene Core
  // ---

  // Chats
  // getChatMessages,
  // getChatParticipants,
  // getChatSession,

  // Profile
  ...sereneCoreProfileQueryResolvers().Query,

  // Quotas
  // getResourceQuotaUsage,

  // Tech
  // getTechs,

  // Tips
  // getTipsByUserProfileIdAndTags,
  // tipGotItExists,

  // Users
  ...sereneCoreAccessQueryResolvers().Query,
  ...sereneCoreUsersQueryResolvers().Query,

  // User preferences
  ...sereneCoreUserPreferencesQueryResolvers().Query,

  // Relays
  // ---

  // Profiles
  getProfileById,
  getProfileByUserProfileId,
  searchProfiles,
  getNetwork,

  // Profile skills, links, endorsements, posts
  getSkillsByProfileId,
  getProfileLinksByProfileId,
  getEndorsementsByProfileId,
  getPostsByProfileId,
  getPostsByProjectId,

  // Connections
  getIncomingConnectionRequests,

  // Notifications
  getNotifications,

  // Collaboration plans
  searchCollaborationPlans,
  getCollaborationPlanById,
  getPlanStepsByPlanId,

  // Projects
  getProjectById,
  searchProjects,
  getProjectsByUserProfileId,
}

const Mutation = {

  // Serene Core
  // ---

  // Chats
  // getOrCreateChatSession,

  // Tips
  // deleteTipGotIt,
  // upsertTipGotIt,

  // Users
  ...sereneCoreUsersMutationResolvers().Mutation,

  // User preferences
  ...sereneCoreUserPreferencesMutationResolvers().Mutation,

  // Relays
  // ---

  // Start
  loadServerStartData,

  // Sign-ups
  signUpForUpdates,

  // Profiles
  createProfile,
  updateProfile,
  setProfileUpdates,

  // Profile skills, links, endorsements, posts
  addSkillToProfile,
  removeSkillFromProfile,
  addProfileLink,
  deleteProfileLink,
  endorseSkill,
  createPost,
  deletePost,

  // Connections
  sendConnectionRequest,
  respondToConnectionRequest,
  removeConnection,

  // Notifications
  markNotificationAsRead,

  // Collaboration plans
  createPlan,
  updatePlan,
  setPlanStatus,
  addPlanStep,
  updatePlanStep,
  deletePlanStep,

  // Projects
  createProject,
  updateProject,
  toggleProjectInterest,
  deleteProject,
}

const resolvers = { Query, Mutation }

export default resolvers
