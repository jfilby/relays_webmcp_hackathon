// Serene Core imports
import { sereneCoreAccessQueryResolvers, sereneCoreUserPreferencesQueryResolvers, sereneCoreProfileQueryResolvers, sereneCoreUsersQueryResolvers } from 'serene-core-server'
import { sereneCoreUserPreferencesMutationResolvers, sereneCoreUsersMutationResolvers } from 'serene-core-server'

// Relays queries imports
import { getProfileById, getProfileByUserProfileId, searchProfiles, getNetwork } from './queries/profiles'

// Relays mutations imports
import { loadServerStartData } from './mutations/server-data-start'
import { signUpForUpdates } from './mutations/sign-ups'
import { createProfile, updateProfile, setProfileUpdates } from './mutations/profiles'

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
}

const resolvers = { Query, Mutation }

export default resolvers