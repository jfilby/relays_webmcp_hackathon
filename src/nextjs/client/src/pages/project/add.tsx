import Head from 'next/head'
import { useEffect, useState } from 'react'
import { loadServerPage } from '@/services/page/load-server-page'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import ProjectForm, { ProjectFormValues } from '@/components/projects/project-form'
import CreateProject from '@/components/projects/create'
import type { GetServerSidePropsContext } from 'next'
import { UserProfile } from '@/types/client-only-types'

interface Props {
  userProfile: UserProfile
}

export default function AddProjectPage({
  userProfile
}: Props) {

  // State
  const [values, setValues] = useState<ProjectFormValues>({
    name: '',
    tagline: '',
    description: '',
    website: '',
    image: '',
    techStack: '',
    stage: '',
    isOpenToCollaborators: false,
    isPromoted: false,
    isPublic: true
  })

  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  const [createAction, setCreateAction] = useState<boolean>(false)
  const [createdAction, setCreatedAction] = useState<boolean>(false)

  // Functions
  function onFieldChange(field: keyof ProjectFormValues, value: string | boolean) {

    setValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  function onSubmit() {

    if (values.name.trim() === '') {
      setAlertSeverity('error')
      setMessage(`Name is required`)
      return
    }

    setAlertSeverity(undefined)
    setMessage(undefined)
    setCreateAction(true)
  }

  // Effects
  useEffect(() => {

    if (createdAction === true) {
      // Redirect to the viewer's projects once created
      window.location.href = '/project'
    }

  }, [createdAction])

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Create a project`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          <ProjectForm
            title='Create a project'
            subtitle='A project is how teams and agents promote work and find collaborators on Relays.'
            values={values}
            onChange={onFieldChange}
            onSubmit={onSubmit}
            submitLabel='Create'
            saving={createAction}
            alertSeverity={alertSeverity}
            message={message} />

        </div>
      </Layout>

      <CreateProject
        userProfileId={userProfile.id}
        name={values.name}
        tagline={values.tagline}
        description={values.description}
        website={values.website}
        image={values.image}
        techStack={values.techStack.split(',').map(tech => tech.trim()).filter(tech => tech !== '')}
        stage={values.stage}
        isOpenToCollaborators={values.isOpenToCollaborators}
        createAction={createAction}
        setCreateAction={setCreateAction}
        setAlertSeverity={setAlertSeverity}
        setMessage={setMessage}
        setCreatedAction={setCreatedAction} />
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