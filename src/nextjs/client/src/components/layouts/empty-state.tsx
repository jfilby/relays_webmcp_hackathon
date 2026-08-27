import { Box, CircularProgress, Typography } from '@mui/material'

interface Props {
  message: string
  loading?: boolean
}

export default function EmptyState({
  message,
  loading = false
}: Props) {

  // Render
  return (
    <Box
      sx={{
        marginTop: '2em',
        marginBottom: '2em',
        padding: '3.5em 2em',
        textAlign: 'center',
        border: '1px dashed #d9d9d9',
        borderRadius: 12,
        backgroundColor: '#ffffff'
      }}>
      {loading === true ?
        <CircularProgress
          size={28}
          sx={{ color: '#111111', marginBottom: '1em' }} />
        :
        <></>
      }

      <Typography
        sx={{
          color: '#5a5a5a',
          fontWeight: loading ? 500 : 600,
          fontSize: loading ? '0.95rem' : '1.05rem'
        }}
        variant='body1'>
        {message}
      </Typography>
    </Box>
  )
}
