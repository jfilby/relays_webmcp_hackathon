import Head from 'next/head'
import { useEffect, useState } from 'react'
import {
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
import ProfileForm, { ProfileFormValues } from '@/components/profiles/profile-form'
import UpdateProfile from '@/components/profiles/update'
import { addSkillToProfileMutation, removeSkillFromProfileMutation } from '@/apollo/profiles'
import { skillLevelName, skillLevels } from '@/types/client-only-types'
import type { Profile, ProfileSkill, UserProfile } from '@/types/client-only-types'
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
    website: '',
    availabilityStatus: 'A'
  })

  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  const [updateAction, setUpdateAction] = useState<boolean>(false)
  const [updatedAction, setUpdatedAction] = useState<boolean>(false)

  const [skills, setSkills] = useState<ProfileSkill[]>([])
  const [skillsReloadToken, setSkillsReloadToken] = useState<number>(0)
  const [newSkillName, setNewSkillName] = useState<string>('')
  const [newSkillLevel, setNewSkillLevel] = useState<string>('I')
  const [skillSaving, setSkillSaving] = useState<boolean>(false)

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
        website: profile.website ?? '',
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

  function onSubmit() {

    if (values.displayName.trim() === '') {
      setAlertSeverity('error')
      setMessage(`Display name is required`)
      return
    }

    setAlertSeverity(undefined)
    setMessage(undefined)
    setUpdateAction(true)
  }

  async function onAddSkill() {

    if (profile == null || newSkillName.trim() === '') {
      return
    }

    setSkillSaving(true)

    // Query
    let addedData: { status: boolean; message?: string } | undefined

    await sendAddSkillToProfileMutation({
      variables: {
        userProfileId: userProfile.id,
        skillName: newSkillName.trim(),
        level: newSkillLevel !== '' ? newSkillLevel : null
      }
    }).then(result => addedData = result.data?.addSkillToProfile)

    // Get results and set fields
    if (addedData == null) {
      setAlertSeverity('error')
      setMessage(`Failed to add the skill`)
    } else if (addedData.status === true) {
      setAlertSeverity('success')
      setMessage(addedData.message)
      toast(`Added`)
      setNewSkillName('')
      setNewSkillLevel('I')
      setSkillsReloadToken(token => token + 1)
    } else {
      setAlertSeverity('error')
      setMessage(addedData.message)
    }

    // Done
    setSkillSaving(false)
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
                  onClick={onAddSkill}
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
        <UpdateProfile
          id={profile.id}
          userProfileId={userProfile.id}
          displayName={values.displayName}
          type={values.type}
          isPublic={values.isPublic}
          headline={values.headline}
          bio={values.bio}
          location={values.location}
          website={values.website}
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
