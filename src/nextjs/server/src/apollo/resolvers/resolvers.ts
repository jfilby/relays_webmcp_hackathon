// Serene Core imports
import { sereneCoreAccessQueryResolvers, sereneCoreUserPreferencesQueryResolvers, sereneCoreProfileQueryResolvers, sereneCoreUsersQueryResolvers } from 'serene-core-server'
import { sereneCoreUserPreferencesMutationResolvers, sereneCoreUsersMutationResolvers } from 'serene-core-server'

// Relays queries imports
import {
  getProfileByPublicId,
  getProfileByUserProfileId,
  searchProfiles,
  getNetwork,
  getSkillsByProfileId,
  getProfileLinksByProfileId,
  getEndorsementsByProfileId
} from './queries/profiles'
import {
  getProjectByPublicId,
  searchProjects,
  getProjectsByUserProfileId
} from './queries/projects'
import {
  getIncomingConnectionRequests,
  getConnectionStatus
} from './queries/connections'
import {
  getDiscussPosts,
  searchDiscussPosts,
  getDiscussPostByPublicId,
  getDiscussCommentsByPostId
} from './queries/discussion'
import {
  getModerationQueue
} from './queries/moderation'
import {
  getNotifications
} from './queries/notifications'
import {
  getCollaborationPlanById,
  searchCollaborationPlans,
  getPlanStepsByPlanId
} from './queries/collaboration'

// Relays mutations imports
import {
  sendConnectionRequest,
  respondToConnectionRequest,
  removeConnection
} from './mutations/connections'
import {
  createDiscussPost,
  deleteDiscussPost,
  createDiscussComment,
  deleteDiscussComment
} from './mutations/discussion'
import {
  flagContent,
  setModerationFlagStatus,
  deleteFlaggedContent
} from './mutations/moderation'
import {
  markNotificationAsRead
} from './mutations/notifications'
import {
  createPlan,
  updatePlan,
  setPlanStatus,
  addPlanStep,
  updatePlanStep,
  deletePlanStep
} from './mutations/collaboration'

import { loadServerStartData } from './mutations/server-data-start'
import { signUpForUpdates } from './mutations/sign-ups'
import {
  createProfile,
  updateProfile,
  deleteProfileAvatar,
  setProfileUpdates,
  addSkillToProfile,
  removeSkillFromProfile,
  addProfileLink,
  deleteProfileLink,
  endorseSkill
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
  getProfileByPublicId,
  getProfileByUserProfileId,
  searchProfiles,
  getNetwork,

  // Profile skills, links, endorsements
  getSkillsByProfileId,
  getProfileLinksByProfileId,
  getEndorsementsByProfileId,

  // Connections
  getIncomingConnectionRequests,
  getConnectionStatus,

  // Discussion
  getDiscussPosts,
  searchDiscussPosts,
  getDiscussPostByPublicId,
  getDiscussCommentsByPostId,

  // Moderation
  getModerationQueue,

  // Notifications
  getNotifications,

  // Collaboration plans
  searchCollaborationPlans,
  getCollaborationPlanById,
  getPlanStepsByPlanId,

  // Projects
  getProjectByPublicId,
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
  deleteProfileAvatar,
  setProfileUpdates,

  // Profile skills, links, endorsements
  addSkillToProfile,
  removeSkillFromProfile,
  addProfileLink,
  deleteProfileLink,
  endorseSkill,

  // Connections
  sendConnectionRequest,
  respondToConnectionRequest,

  // Discussion
  createDiscussPost,
  deleteDiscussPost,
  createDiscussComment,
  deleteDiscussComment,

  // Moderation
  flagContent,
  setModerationFlagStatus,
  deleteFlaggedContent,

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
