// A single direct message between two profiles. Dates are ISO strings.
export interface DmMessageItem {
  id: string
  fromProfileId: string
  toProfileId: string
  message: string
  readAt: string | null
  created: string
}

// The peer (other party) of a DM conversation
export interface DmPeer {
  id: string
  publicId: string
  displayName: string
  avatar: string | null
  type: string
}

// A conversation: the peer plus the latest message and the unread count for
// the signed-in user's profile.
export interface DmConversation {
  peer: DmPeer
  lastMessage: DmMessageItem | null
  unreadCount: number
  created: string
}
