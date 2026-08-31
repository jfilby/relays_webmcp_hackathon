// client/src/components/dms/dm-thread.tsx
//
// Visual DM thread: renders messages between the signed-in user and a peer,
// plus a compose box. Pure visual + local state; data is passed in.
import { useEffect, useRef, useState } from 'react'
import { Avatar, Box, IconButton, Paper, TextField, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import SendIcon from '@mui/icons-material/Send'
import type { DmMessageItem, DmPeer } from '@/types/dm-types'

// Human-readable message time
function formatTime(value: string | undefined | null): string {

  if (value == null || value === '') {
    return ''
  }

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

interface Props {
  peer: DmPeer | undefined
  messages: DmMessageItem[] | undefined
  myProfileId: string
  sending: boolean
  onSend: (message: string) => void
}

export default function DmThread({
  peer,
  messages,
  myProfileId,
  sending,
  onSend
}: Props) {

  // State
  const [draft, setDraft] = useState('')

  // Refs
  const threadBodyRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll to the newest message
  useEffect(() => {

    const threadBody = threadBodyRef.current

    if (threadBody != null) {
      threadBody.scrollTop = threadBody.scrollHeight
    }
  }, [messages])

  // Functions
  function onSendClick() {

    const message = draft.trim()

    if (message === '' || sending) {
      return
    }

    onSend(message)
    setDraft('')
  }

  // Render
  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 0,
        border: '1px solid #e4e4e4',
        overflow: 'hidden'
      }}>
      {/* Peer header */}
      {peer != null ?
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.7em',
          padding: '0.9em 1.2em',
          borderBottom: '1px solid #e4e4e4',
          backgroundColor: '#fafafa'
        }}>
          <Avatar
            alt={`${peer.displayName} avatar`}
            src={peer.avatar || undefined}
            sx={{
              width: '2.6em',
              height: '2.6em',
              backgroundColor: '#111111',
              color: '#ffffff',
              fontWeight: 700
            }}>
            {peer.displayName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Typography
            sx={{ fontWeight: 600 }}
            variant='body1'>
            {peer.displayName}
          </Typography>
        </Box>
        :
        <></>
      }

      {/* Messages */}
      <Box
        ref={threadBodyRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.2em',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.7em'
        }}>
        {messages != null ?
          messages.length > 0 ?
            messages.map(message => (
              <Box
                key={message.id}
                sx={{
                  alignSelf: message.fromProfileId === myProfileId ?
                    'flex-end' :
                    'flex-start',
                  maxWidth: '75%'
                }}>
                <Typography
                  sx={{
                    fontSize: '0.68rem',
                    color: '#9a9a9a',
                    textAlign: message.fromProfileId === myProfileId ?
                      'right' :
                      'left',
                    marginBottom: '0.15em'
                  }}
                  variant='body2'>
                  {message.fromProfileId === myProfileId ?
                    'You' :
                    peer?.displayName ?? 'Unknown'}
                </Typography>
                <Box sx={{
                  padding: '0.6em 0.9em',
                  borderRadius: 0,
                  backgroundColor: message.fromProfileId === myProfileId ?
                    '#111111' :
                    '#efefef',
                  color: message.fromProfileId === myProfileId ?
                    '#ffffff' :
                    '#111111'
                }}>
                  <Typography
                    sx={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}
                    variant='body2'>
                    {message.message}
                  </Typography>
                </Box>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: message.fromProfileId === myProfileId ?
                    'flex-end' :
                    'flex-start',
                  gap: '0.3em',
                  marginTop: '0.15em'
                }}>
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      color: '#9a9a9a',
                      textAlign: message.fromProfileId === myProfileId ?
                        'right' :
                        'left'
                    }}
                    variant='body2'>
                    {formatTime(message.created)}
                  </Typography>
                  {message.fromProfileId === myProfileId &&
                    message.readAt != null &&
                    <CheckIcon
                      aria-label='Seen'
                      sx={{ fontSize: '0.85rem', color: '#4caf50' }} />
                  }
                </Box>
              </Box>
            ))
            :
            <Typography
              sx={{ color: '#9a9a9a', textAlign: 'center', marginTop: '3em' }}
              variant='body2'>
              No messages yet. Say hello!
            </Typography>
          :
          <Typography
            sx={{ color: '#9a9a9a', textAlign: 'center', marginTop: '3em' }}
            variant='body2'>
            Loading..
          </Typography>
        }
      </Box>

      {/* Compose */}
      <Box sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '0.6em',
        padding: '0.8em 1.2em',
        borderTop: '1px solid #e4e4e4'
      }}>
        <TextField
          fullWidth
          maxRows={4}
          multiline
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()

              const message = draft.trim()

              if (message !== '' && !sending) {
                onSend(message)
                setDraft('')
              }
            }
          }}
          placeholder='Type a message..'
          size='small'
          value={draft} />
        <IconButton
          aria-label='Send message'
          disabled={sending || draft.trim() === ''}
          onClick={() => {
            const message = draft.trim()

            if (message !== '' && !sending) {
              onSend(message)
              setDraft('')
            }
          }}
          sx={{
            backgroundColor: '#111111',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            },
            '&.Mui-disabled': {
              backgroundColor: '#e0e0e0',
              color: '#ffffff'
            }
          }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  )
}
