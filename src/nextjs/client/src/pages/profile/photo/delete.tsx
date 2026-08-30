import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Alert, Avatar, Button, Typography } from '@mui/material'
import { Toaster } from 'sonner'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadProfileByUserProfileId from '@/components/profiles/load-by-user-profile-id'
import DeleteAvatar from '@/components/profiles/delete-avatar'
import DeleteDialog from '@/components/dialogs/delete-dialog'
import type { Profile, UserProfile } from '@/types/client-only-types'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

export default function DeleteProfilePhotoPage({
  userProfile
}: Props) {

  // State
  const [profile, setProfile] = useState<Profile | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [deleteConfirmed, setDeleteConfirmed] = useState<boolean>(false)
  const [deletedAction, setDeletedAction] = useState<boolean>(false)

  // Effects
  useEffect(() => {

    if (deletedAction === true) {
      // Redirect back to the profile once deleted
      window.location.href = '/profile'
    }

  }, [deletedAction])


  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Delete profile photo`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          {alertSeverity != null && message != null ?
            <Alert
              severity={alertSeverity}
              style={{ marginBottom: '1.5em' }}>
              {message}
            </Alert>
            :
            <></>
          }

          {profile != null ?
            <>
              <Typography
                style={{ marginBottom: '1em' }}
                variant='h3'>
                Delete profile photo
              </Typography>

              {profile.avatar != null && profile.avatar !== '' ?
                <>
                  <div style={{ marginBottom: '1em' }}>
                    <Avatar
                      alt={`${profile.displayName} avatar`}
                      src={profile.avatar}
                      sx={{
                        width: '8em',
                        height: '8em',
                        backgroundColor: '#111111',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '2.5rem'
                      }}>
                      {profile.displayName?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  </div>

                  <Typography
                    style={{ marginBottom: '1em' }}
                    variant='body1'>
                    Your profile will fall back to showing the initial of your display name.
                  </Typography>

                  <Button
                    onClick={() => setDeleteDialogOpen(true)}
                    variant='contained'>
                    Delete photo
                  </Button>
                </>
                :
                <Typography variant='body1'>
                  You don&apos;t have a profile photo to delete.
                </Typography>
              }
            </>
            :
            <></>
          }

          {notFound === true ?
            <Typography variant='body1'>
              You don&apos;t have a profile yet.
            </Typography>
            :
            <></>
          }

          {profile == null && notFound === false ?
            <Typography variant='body1'>
              Loading..
            </Typography>
            :
            <></>
          }
        </div>
      </Layout>

      <LoadProfileByUserProfileId
        userProfileId={userProfile.id}
        setProfile={setProfile}
        setNotFound={setNotFound}
        setAlertSeverity={setAlertSeverity}
        setMessage={setMessage} />

      {profile != null ?
        <DeleteAvatar
          userProfileId={userProfile.id}
          deleteAction={deleteConfirmed}
          setDeleteAction={setDeleteConfirmed}
          setAlertSeverity={setAlertSeverity}
          setMessage={setMessage}
          setDeletedAction={setDeletedAction} />
        :
        <></>
      }

      <DeleteDialog
        open={deleteDialogOpen}
        type='photo'
        name='photo'
        message='Are you sure? This will permanently delete your profile photo. This cannot be undone.'
        setOpen={setDeleteDialogOpen}
        setDeleteConfirmed={setDeleteConfirmed} />

      <Toaster />
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  return loadServerPage(
    context,
    {
      verifyLoggedInUsersOnly: true
    })
}
