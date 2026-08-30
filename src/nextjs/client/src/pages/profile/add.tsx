import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import ProfileForm, { ProfileFormValues } from '@/components/profiles/profile-form'
import CreateProfile from '@/components/profiles/create'
import type { GetServerSidePropsContext } from 'next'
import { UserProfile } from '@/types/client-only-types'
import { useWebMcpTools } from '@/webmcp/webmcp'

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
    availabilityStatus: 'A'
  })

  const valuesRef = useRef<ProfileFormValues>(values)
  valuesRef.current = values

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
    setCreateAction(true)

    return { status: 'ok', message: `Profile creation started` }
  }

  // WebMCP
  useWebMcpTools([
    {
      name: 'create_profile',
      title: 'Create profile',
      description: `Create the signed-in user's Relays profile from the create-profile form on this page. The page redirects to the profile once creation succeeds.`,
      inputSchema: {
        type: 'object',
        properties: {
          displayName: {
            type: 'string',
            description: `Display name shown on the profile. Required.`
          },
          type: {
            type: 'string',
            enum: ['H', 'A'],
            description: `Profile type: H for Human, A for Agent. Defaults to Human.`
          },
          availabilityStatus: {
            type: 'string',
            enum: ['A', 'B', 'U'],
            description: `Availability status: A for Available, B for Busy, U for Unavailable.`
          },
          headline: {
            type: 'string',
            description: `Short headline shown on the profile.`
          },
          bio: {
            type: 'string',
            description: `Longer bio shown on the profile.`
          },
          location: {
            type: 'string',
            description: `Location shown on the profile.`
          },
          isPublic: {
            type: 'boolean',
            description: `Whether the profile is publicly visible. Defaults to public.`
          }
        },
        required: ['displayName']
      },
      execute: (args) => {

        const current = valuesRef.current

        const submitValues: ProfileFormValues = {
          displayName: typeof args.displayName === 'string' ? args.displayName : current.displayName,
          type: typeof args.type === 'string' && (args.type === 'H' || args.type === 'A') ? args.type : current.type,
          isPublic: typeof args.isPublic === 'boolean' ? args.isPublic : current.isPublic,
          headline: typeof args.headline === 'string' ? args.headline : current.headline,
          bio: typeof args.bio === 'string' ? args.bio : current.bio,
          location: typeof args.location === 'string' ? args.location : current.location,
          availabilityStatus: typeof args.availabilityStatus === 'string' && (args.availabilityStatus === 'A' || args.availabilityStatus === 'B' || args.availabilityStatus === 'U') ? args.availabilityStatus : current.availabilityStatus
        }

        const result = onSubmit(submitValues)

        if (result.status === 'error') {
          throw new Error(result.message)
        }

        return `Creating your profile "${submitValues.displayName}"`
      }
    }
  ])

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
        availabilityStatus={values.availabilityStatus}
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