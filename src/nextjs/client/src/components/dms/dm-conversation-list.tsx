// client/src/components/dms/dm-conversation-list.tsx
//
// Visual conversation list: renders DM conversations passed in as data.
import { Avatar, Box, Chip, Typography } from '@mui/material'
import type { DmConversation } from '@/types/dm-types'

interface Props {
  conversations: DmConversation[] | undefined
  loading: boolean
  error: boolean
  myProfileId: string
  onOpenThread: (peerPublicId: string) => void
}

export default function DmConversationList({
  conversations,
  loading,
  error,
  myProfileId,
  onOpenThread
}: Props) {

  // Render
  if (error) {
    return (
      <Typography
        sx={{ color: '#b91c1c', padding: '1em', fontSize: '0.9rem' }}
        variant='body2'>
        Failed to load conversations
      </Typography>
    )
  }

  if (loading || conversations == null) {
    return (
      <Typography
        sx={{ color: '#9a9a9a', padding: '1.5em', textAlign: 'center' }}
        variant='body2'>
        Loading..
      </Typography>
    )
  }

  if (conversations.length === 0) {
    return (
      <Typography
        sx={{ color: '#9a9a9a', padding: '1.5em', textAlign: 'center', fontSize: '0.9rem' }}
        variant='body2'>
        No conversations yet. Message someone from their profile.
      </Typography>
    )
  }

  return (
    <>
      {conversations.map(conversation => (
        <Box
          key={conversation.peer.id}
          onClick={() => onOpenThread(conversation.peer.publicId)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.9em',
            padding: '0.9em 1.1em',
            cursor: 'pointer',
            borderBottom: '1px solid #f0f0f0',
            borderRadius: 8,
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}>
          <Avatar
            alt={`${conversation.peer.displayName} avatar`}
            src={conversation.peer.avatar || undefined}
            sx={{
              width: '2.8em',
              height: '2.8em',
              backgroundColor: '#111111',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1.05rem'
            }}>
            {conversation.peer.displayName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
              <Typography
                sx={{
                  fontWeight: conversation.unreadCount > 0 ? 700 : 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                variant='body1'>
                {conversation.peer.displayName}
              </Typography>
              {conversation.peer.type === 'A' ?
                <Chip
                  label='Agent'
                  size='small'
                  sx={{
                    height: '1.35em',
                    fontSize: '0.65rem'
                  }} />
                :
                <></>
              }
            </Box>
            <Typography
              sx={{
                color: '#9a9a9a',
                fontSize: '0.82rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              variant='body2'>
              {conversation.lastMessage != null ?
                (conversation.lastMessage.fromProfileId === myProfileId ?
                  `You: ${conversation.lastMessage.message}` :
                  conversation.lastMessage.message) :
                ''}
            </Typography>
          </Box>
          {conversation.unreadCount > 0 ?
            <Chip
              label={conversation.unreadCount}
              size='small'
              sx={{
                height: '1.6em',
                minWidth: '1.6em',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#111111',
                color: '#ffffff'
              }} />
            :
            <></>
          }
        </Box>
      ))}
    </>
  )
}
