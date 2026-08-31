import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import {
  Avatar,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material'
import { Toaster, toast } from 'sonner'
import { useMutation } from '@apollo/client/react'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import LoadProfileByUserProfileId from '@/components/profiles/load-by-user-profile-id'
import LoadSkillsByProfileId from '@/components/profiles/load-skills'
import LoadLinksByProfileId from '@/components/profiles/load-links'
import DeleteDialog from '@/components/dialogs/delete-dialog'
import ProfileForm, { ProfileFormValues } from '@/components/profiles/profile-form'
import UpdateProfile from '@/components/profiles/update'
import {
  addProfileLinkMutation,
  addSkillToProfileMutation,
  deleteProfileLinkMutation,
  removeSkillFromProfileMutation
} from '@/apollo/profiles'
import {
  profileLinkKinds,
  profileLinkName,
  skillLevelName,
  skillLevels
} from '@/types/client-only-types'
import type { Profile, ProfileLink, ProfileSkill, UserProfile } from '@/types/client-only-types'
import { useWebMcpTools } from '@/webmcp/webmcp'
import {
  addProfileLinkTool,
  addProfileSkillTool,
  updateProfileTool
} from '@/webmcp/tools/profiles'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
}

export default function EditProfilePage({
  userProfile
}: Props) {

  // State
  const [profile, setProfile] = useState<Profile | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)

  const [values, setValues] = useState<ProfileFormValues>({
    displayName: '',
    type: 'H',
    isPublic: true,
    headline: '',
    bio: '',
    location: '',
    availabilityStatus: 'A'
  })

  const valuesRef = useRef<ProfileFormValues>(values)
  valuesRef.current = values

  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  const [updateAction, setUpdateAction] = useState<boolean>(false)
  const [updatedAction, setUpdatedAction] = useState<boolean>(false)

  const [skills, setSkills] = useState<ProfileSkill[]>([])
  const [skillsReloadToken, setSkillsReloadToken] = useState<number>(0)
  const [newSkillName, setNewSkillName] = useState<string>('')
  const [newSkillLevel, setNewSkillLevel] = useState<string>('I')
  const [skillSaving, setSkillSaving] = useState<boolean>(false)

  const [links, setLinks] = useState<ProfileLink[]>([])
  const [linksReloadToken, setLinksReloadToken] = useState<number>(0)
  const [newLinkKind, setNewLinkKind] = useState<string>('W')
  const [newLinkUrl, setNewLinkUrl] = useState<string>('')
  const [linkSaving, setLinkSaving] = useState<boolean>(false)
  const [linkError, setLinkError] = useState<string | undefined>(undefined)

  // Link deletion confirmation state
  const [linkDeleteDialogOpen, setLinkDeleteDialogOpen] = useState<boolean>(false)
  const [linkDeletePendingId, setLinkDeletePendingId] = useState<string | undefined>(undefined)
  const [linkDeleteConfirmed, setLinkDeleteConfirmed] = useState<boolean>(false)

  // GraphQL
  const [sendAddSkillToProfileMutation] =
    useMutation<{
      addSkillToProfile: {
        status: boolean
        message: string
      }
    }>(addSkillToProfileMutation, {
      fetchPolicy: 'no-cache'
    })
  const [sendRemoveSkillFromProfileMutation] =
    useMutation<{
      removeSkillFromProfile: {
        status: boolean
        message: string
      }
    }>(removeSkillFromProfileMutation, {
      fetchPolicy: 'no-cache'
    })

  const [sendAddProfileLinkMutation] =
    useMutation<{
      addProfileLink: {
        status: boolean
        message: string
      }
    }>(addProfileLinkMutation, {
      fetchPolicy: 'no-cache'
    })

  const [sendDeleteProfileLinkMutation] =
    useMutation<{
      deleteProfileLink: {
        status: boolean
        message: string
      }
    }>(deleteProfileLinkMutation, {
      fetchPolicy: 'no-cache'
    })

  // Effects
  useEffect(() => {

    // Populate the form once the profile loads
    if (profile != null) {
      setValues({
        displayName: profile.displayName,
        type: profile.type ?? 'H',
        isPublic: profile.isPublic === true,
        headline: profile.headline ?? '',
        bio: profile.bio ?? '',
        location: profile.location ?? '',
        availabilityStatus: profile.availabilityStatus ?? 'A'
      })
    }

  }, [profile])

  useEffect(() => {

    if (updatedAction === true) {
      // Redirect to the viewer's profile once updated
      window.location.href = '/profile'
    }

  }, [updatedAction])

  // Functions
  function onFieldChange(field: keyof ProfileFormValues, value: string | boolean) {

    setValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  function onSubmit(submitValues?: ProfileFormValues): { status: 'ok' | 'error'; message: string } {

    const v = submitValues ?? values

    if (submitValues != null) {
      setValues(submitValues)
    }

    if (v.displayName.trim() === '') {
      setAlertSeverity('error')
      setMessage(`Display name is required`)
      return { status: 'error', message: `Display name is required` }
    }

    setAlertSeverity(undefined)
    setMessage(undefined)
    setUpdateAction(true)

    return { status: 'ok', message: `Profile update started` }
  }

  async function onAddSkill(submitName?: string, submitLevel?: string): Promise<{ status: 'ok' | 'error'; message: string }> {

    const skillName = (submitName ?? newSkillName).trim()
    const skillLevel = submitLevel ?? newSkillLevel

    if (profile == null) {
      return { status: 'error', message: `Profile not loaded yet` }
    }

    if (skillName === '') {
      return { status: 'error', message: `Skill name is required` }
    }

    setSkillSaving(true)

    // Query
    let addedData: { status: boolean; message?: string } | undefined

    await sendAddSkillToProfileMutation({
      variables: {
        userProfileId: userProfile.id,
        skillName: skillName,
        level: skillLevel !== '' ? skillLevel : null
      }
    }).then(result => addedData = result.data?.addSkillToProfile)

    // Get results and set fields
    if (addedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to add the skill`)
      return { status: 'error', message: `Failed to add the skill` }
    } else if (addedData.status === true) {
      setAlertSeverity('success')
      setMessage(addedData.message)
      toast(`Added`)
      setNewSkillName('')
      setNewSkillLevel('I')
      setSkillsReloadToken(token => token + 1)
      return { status: 'ok', message: addedData.message ?? `Skill added` }
    } else {
      setAlertSeverity('error')
      setMessage(addedData.message)
      return { status: 'error', message: addedData.message ?? `Failed to add the skill` }
    }
  }

  async function onRemoveSkill(profileSkillId: string) {

    if (profile == null) {
      return
    }

    setSkillSaving(true)

    // Query
    let removedData: { status: boolean; message?: string } | undefined

    await sendRemoveSkillFromProfileMutation({
      variables: {
        userProfileId: userProfile.id,
        profileSkillId: profileSkillId
      }
    }).then(result => removedData = result.data?.removeSkillFromProfile)

    // Get results and set fields
    if (removedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to remove the skill`)
    } else if (removedData.status === true) {
      setAlertSeverity('success')
      setMessage(removedData.message)
      toast(`Removed`)
      setSkillsReloadToken(token => token + 1)
    } else {
      setAlertSeverity('error')
      setMessage(removedData.message)
    }

    // Done
    setSkillSaving(false)
  }

  async function onAddLink(submitKind?: string, submitUrl?: string): Promise<{ status: 'ok' | 'error'; message: string }> {

    const linkKind = submitKind ?? newLinkKind
    const linkUrl = (submitUrl ?? newLinkUrl).trim()

    if (profile == null) {
      return { status: 'error', message: `Profile not loaded yet` }
    }

    if (linkUrl === '') {
      return { status: 'error', message: `URL is required` }
    }

    setLinkError(undefined)

    // The URL must parse as an absolute http(s) URL
    let parsedUrl: URL

    try {
      parsedUrl = new URL(linkUrl)
    } catch {
      setLinkError(`URL must be a valid URL (e.g. https://example.com)`)
      return { status: 'error', message: `URL must be a valid URL (e.g. https://example.com)` }
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      setLinkError(`URL must start with http:// or https://`)
      return { status: 'error', message: `URL must start with http:// or https://` }
    }

    // The hostname must be a domain (e.g. example.com), not a bare label
    if (parsedUrl.hostname.includes('.') === false) {
      setLinkError(`URL must have a valid domain (e.g. example.com)`)
      return { status: 'error', message: `URL must have a valid domain (e.g. example.com)` }
    }

    setLinkSaving(true)

    // Query
    try {
      let addedData: { status: boolean; message?: string } | undefined

      await sendAddProfileLinkMutation({
        variables: {
          userProfileId: userProfile.id,
          kind: linkKind,
          url: linkUrl
        }
      }).then(result => addedData = result.data?.addProfileLink)

      // Get results and set fields
      if (addedData == null) {
        setLinkError(`Failed to add the link`)
        return { status: 'error', message: `Failed to add the link` }
      } else if (addedData.status === true) {
        setAlertSeverity('success')
        setMessage(addedData.message)
        setNewLinkUrl('')
        setLinksReloadToken(token => token + 1)
        return { status: 'ok', message: addedData.message ?? `Link added` }
      } else {
        setLinkError(addedData.message)
        return { status: 'error', message: addedData.message ?? `Failed to add the link` }
      }
    } catch {
      setLinkError(`Failed to add the link`)
      return { status: 'error', message: `Failed to add the link` }
    } finally {
      setLinkSaving(false)
    }
  }

  function onDeleteLink(id: string) {

    // Ask for confirmation before deleting
    setLinkDeletePendingId(id)
    setLinkDeleteDialogOpen(true)
  }

  async function onRemoveLink(id: string) {

    if (profile == null) {
      return
    }

    setLinkSaving(true)

    // Query
    let removedData: { status: boolean; message?: string } | undefined

    await sendDeleteProfileLinkMutation({
      variables: {
        userProfileId: userProfile.id,
        id: id
      }
    }).then(result => removedData = result.data?.deleteProfileLink)
    // Get results and set fields
    if (removedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to remove the link`)
    } else if (removedData.status === true) {
      setAlertSeverity('success')
      setMessage(removedData.message)
      toast(`Removed`)
      setLinksReloadToken(token => token + 1)
    } else {
      setAlertSeverity('error')
      setMessage(removedData.message)
    }

    // Done
    setLinkSaving(false)
  }

  // Run the link delete once confirmed by the dialog
  useEffect(() => {

    // Return early if not confirmed
    if (linkDeleteConfirmed !== true || linkDeletePendingId == null) {
      return
    }

    setLinkDeleteConfirmed(false)
    onRemoveLink(linkDeletePendingId)

  }, [linkDeleteConfirmed])
  // WebMCP
  useWebMcpTools(() => [
    updateProfileTool({
      getValues: () => valuesRef.current,
      onSubmit: (submitValues) => onSubmit(submitValues)
    }),
    addProfileSkillTool({
      onAddSkill: (submitName, submitLevel) => onAddSkill(submitName, submitLevel)
    }),
    addProfileLinkTool({
      getKind: () => newLinkKind,
      onAddLink: (submitKind, submitUrl) => onAddLink(submitKind, submitUrl)
    })
  ])

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Edit profile`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          {profile != null ?
            <ProfileForm
              title='Edit your profile'
              values={values}
              onChange={onFieldChange}
              onSubmit={onSubmit}
              submitLabel='Save'
              saving={updateAction}
              alertSeverity={alertSeverity}
              message={message} />
            :
            <></>
          }

          {profile != null ?
            <div style={{ marginBottom: '2em' }}>
              <Typography
                style={{ marginBottom: '0.5em' }}
                variant='h3'>
                Profile photo
              </Typography>

              <div style={{ alignItems: 'center', display: 'flex', gap: '1em' }}>
                <Avatar
                  alt={`${profile.displayName} avatar`}
                  src={profile.avatar || undefined}
                  sx={{
                    width: '3em',
                    height: '3em',
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    fontWeight: 700
                  }}>
                  {profile.displayName?.charAt(0)?.toUpperCase()}
                </Avatar>

                <Button href='/profile/photo'>
                  {profile.avatar != null && profile.avatar !== '' ?
                    `Change photo`
                    :
                    `Add photo`
                  }
                </Button>
              </div>
            </div>
            :
            <></>
          }

          {profile != null ?
            <div style={{ marginBottom: '2em' }}>
              <Typography
                style={{ marginBottom: '0.5em' }}
                variant='h3'>
                Your skills
              </Typography>

              {skills.map(skill => (
                <div
                  key={skill.id}
                  style={{ alignItems: 'center', display: 'flex', gap: '0.75em', marginBottom: '0.5em' }}>
                  <Typography variant='body1'>
                    {skill.name}
                  </Typography>

                  {skill.level != null && skill.level !== '' ?
                    <Chip
                      label={skillLevelName(skill.level)}
                      size='small' />
                    :
                    <></>
                  }

                  <Button
                    disabled={skillSaving}
                    onClick={() => onRemoveSkill(skill.id)}
                    size='small'>
                    Remove
                  </Button>
                </div>
              ))}

              {skills.length === 0 ?
                <Typography
                  style={{ marginBottom: '1em' }}
                  variant='body1'>
                  No skills yet.
                </Typography>
                :
                <></>
              }

              <div style={{ alignItems: 'flex-end', display: 'flex', gap: '0.75em', marginTop: '1em' }}>
                <FormControl style={{ width: '20em' }}>
                  <TextField
                    autoComplete='off'
                    fullWidth
                    label='Skill name'
                    onChange={(event) => setNewSkillName(event.target.value)}
                    slotProps={{
                      inputLabel: {
                        shrink: Boolean(newSkillName),
                      }
                    }}
                    value={newSkillName} />
                </FormControl>

                <FormControl style={{ width: '12em', display: 'flex' }}>
                  <InputLabel id='new-skill-level'>Level</InputLabel>
                  <Select
                    labelId='new-skill-level'
                    label='Level'
                    onChange={(event: SelectChangeEvent) => setNewSkillLevel(event.target.value as string)}
                    value={newSkillLevel}>
                    {skillLevels.map(level => (
                      <MenuItem
                        key={level.value}
                        value={level.value}>
                        {level.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  disabled={skillSaving || newSkillName.trim() === ''}
                  onClick={() => onAddSkill()}
                  variant='contained'>
                  Add
                </Button>
              </div>
            </div>
            :
            <></>
          }

          {profile != null ?
            <div style={{ marginBottom: '2em' }}>
              <Typography
                style={{ marginBottom: '0.5em' }}
                variant='h3'>
                Your links
              </Typography>

              {links.map(link => (
                <div
                  key={link.id}
                  style={{ alignItems: 'center', display: 'flex', gap: '0.75em', marginBottom: '0.5em' }}>
                  <Typography variant='body1'>
                    {profileLinkName(link.kind)}:
                    &nbsp;
                    <a
                      href={link.url}
                      rel='noopener noreferrer'
                      target='_blank'>
                      {link.url}
                    </a>
                  </Typography>

                  <Button
                    disabled={linkSaving}
                    onClick={() => onDeleteLink(link.id)}
                    size='small'>
                    Remove
                  </Button>
                </div>
              ))}

              {links.length === 0 ?
                <Typography
                  style={{ marginBottom: '1em' }}
                  variant='body1'>
                  No links yet.
                </Typography>
                :
                <></>
              }

              <div style={{ alignItems: 'flex-end', display: 'flex', gap: '0.75em', marginTop: '1em' }}>
                <FormControl style={{ width: '12em', display: 'flex' }}>
                  <InputLabel id='new-link-kind'>Kind</InputLabel>
                  <Select
                    labelId='new-link-kind'
                    label='Kind'
                    onChange={(event: SelectChangeEvent) => setNewLinkKind(event.target.value as string)}
                    value={newLinkKind}>
                    {profileLinkKinds.map(kind => (
                      <MenuItem
                        key={kind.value}
                        value={kind.value}>
                        {kind.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl style={{ width: '20em' }}>
                  <TextField
                    autoComplete='off'
                    error={linkError != null}
                    fullWidth
                    helperText={linkError}
                    label='URL'
                    onChange={(event) => {
                      setNewLinkUrl(event.target.value)
                      setLinkError(undefined)
                    }}
                    slotProps={{
                      inputLabel: {
                        shrink: Boolean(newLinkUrl),
                      }
                    }}
                    value={newLinkUrl} />
                </FormControl>
                <Button
                  disabled={linkSaving || newLinkUrl.trim() === ''}
                  onClick={() => onAddLink()}
                  variant='contained'>
                  Add
                </Button>
              </div>
            </div>
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
        <LoadSkillsByProfileId
          profileId={profile.id}
          reloadToken={skillsReloadToken}
          setSkills={setSkills} />
        :
        <></>
      }

      {profile != null ?
        <LoadLinksByProfileId
          profileId={profile.id}
          reloadToken={linksReloadToken}
          setLinks={setLinks} />
        :
        <></>
      }

      {profile != null ?
        <UpdateProfile
          id={profile.id}
          userProfileId={userProfile.id}
          displayName={values.displayName}
          type={values.type}
          isPublic={values.isPublic}
          headline={values.headline}
          bio={values.bio}
          location={values.location}
          availabilityStatus={values.availabilityStatus}
          avatar=''
          updateAction={updateAction}
          setUpdateAction={setUpdateAction}
          setAlertSeverity={setAlertSeverity}
          setMessage={setMessage}
          setUpdatedAction={setUpdatedAction} />
        :
        <></>
      }


      <DeleteDialog
        open={linkDeleteDialogOpen}
        type='link'
        name='link'
        message='Are you sure? This will permanently delete the link. This cannot be undone.'
        setOpen={setLinkDeleteDialogOpen}
        setDeleteConfirmed={setLinkDeleteConfirmed} />
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
