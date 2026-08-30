import { Typography } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

interface Props {
  open: boolean
  type: string
  name: string
  setOpen: (open: boolean) => void
  setDeleteConfirmed: (confirmed: boolean) => void
  // Optional message replacing the default confirmation text
  message?: string | null
}

// Confirmation dialog shown before a destructive delete. The caller runs the
// delete once setDeleteConfirmed receives true.
export default function DeleteDialog({
  open,
  type,
  name,
  setOpen,
  setDeleteConfirmed,
  message = null
}: Props) {

  // Functions
  const handleYes = () => {
    setDeleteConfirmed(true)
    setOpen(false)
  }

  const handleNo = () => {
    setDeleteConfirmed(false)
    setOpen(false)
  }

  // Render
  return (
    <Dialog
      open={open}
      onClose={handleNo}
      aria-labelledby='delete-entries-dialog-title'
      aria-describedby='delete-entries-dialog-description'>
      <DialogTitle id='delete-entries-dialog-title'>
        Delete {name}
      </DialogTitle>
      <DialogContent>

        <div style={{ marginBottom: '1em' }}>
          <Typography variant='body1'>
            {message != null ?
              message
              :
              <>
                Are you sure you want to delete this {type}?
                This cannot be undone.
              </>
            }
          </Typography>
        </div>

      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={handleYes} autoFocus>Yes</Button>
        <Button variant='contained' onClick={handleNo} autoFocus>No</Button>
      </DialogActions>
    </Dialog>
  )
}
