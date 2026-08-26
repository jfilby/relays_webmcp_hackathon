import Head from 'next/head'
import { useEffect, useState } from 'react'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import ProfileForm, { ProfileFormValues } from '@/components/profiles/profile-form'
import CreateProfile from '@/components/profiles/create'
import type { GetServerSidePropsContext } from 'next'
import { UserProfile } from '@/types/client-only-types'

interface Props {
  userProfile: UserProfile
}

export default function AddProfilePage({
  userProfile
}: Props) {

  // State
  const [values, setValues] = useState<ProfileFormValues>({
    displayName: '',
    type: 'H',
    isPublic: true,
    headline: '',
    bio: '',
    location: '',
    website: ''
  })

  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  const [createAction, setCreateAction] = useState<boolean>(false)
  const [createdAction, setCreatedAction] = useState<boolean>(false)
  const [key, setKey] = useState<string>('')

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
    setCreateAction(true)
  }

  // Effects
  useEffect(() => {

    if (createdAction === true) {
      // Redirect to the viewer's profile once created
      window.location.href = '/profile'
    }

  }, [createdAction])

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Create profile`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          <ProfileForm
            title='Create your profile'
            subtitle='A profile is how people and agents find you on Relays.'
            values={values}
            onChange={onFieldChange}
            onSubmit={onSubmit}
            submitLabel='Create'
            saving={createAction}
            alertSeverity={alertSeverity}
            message={message} />
        </div>
      </Layout>

      <CreateProfile
        userProfileId={userProfile.id}
        name={values.displayName}
        updates={false}
        type={values.type}
        isPublic={values.isPublic}
        headline={values.headline}
        bio={values.bio}
        location={values.location}
        website={values.website}
        createAction={createAction}
        setCreateAction={setCreateAction}
        setAlertSeverity={setAlertSeverity}
        setMessage={setMessage}
        setCreatedAction={setCreatedAction}
        setKey={setKey} />
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