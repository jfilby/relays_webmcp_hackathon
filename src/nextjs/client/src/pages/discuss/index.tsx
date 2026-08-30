import Head from 'next/head'
import { useRef, useState, type FormEvent } from 'react'
import {
  Button,
  FormControl,
  Paper,
  TextField,
  Typography
} from '@mui/material'
import Layout, { pageBodyWidth } from '@/components/layouts/layout'
import { loadServerPage } from '@/services/page/load-server-page'
import DiscussPostListItem from '@/components/discussion/discuss-post-list-item'
import LoadDiscussPosts from '@/components/discussion/load-discuss-posts'
import SearchDiscussPosts from '@/components/discussion/search-discuss-posts'
import SaveDiscussPost from '@/components/discussion/save-discuss-post'
import EmptyState from '@/components/layouts/empty-state'
import type { DiscussPostItem, UserProfile } from '@/types/client-only-types'
import { useWebMcpTools } from '@/webmcp/webmcp'
import type { GetServerSidePropsContext } from 'next'

interface Props {
  userProfile: UserProfile
  search?: string | string[]
}

export default function DiscussPage({
  userProfile,
  search: initialSearch
}: Props) {

  // Consts
  const startingSearch =
    typeof initialSearch === 'string' ?
      initialSearch
      :
      ''

  // State
  const [search, setSearch] = useState<string>(startingSearch)
  const [appliedInitialSearch, setAppliedInitialSearch] = useState<string>(startingSearch)
  const [loadAction, setLoadAction] = useState<boolean>(startingSearch !== '')
  const [searched, setSearched] = useState<boolean>(startingSearch !== '')

  // Re-run the search when the page is navigated to again with a different
  // query (e.g. breaking out of the header omnibar while already here).
  if (appliedInitialSearch !== startingSearch) {
    setAppliedInitialSearch(startingSearch)
    setSearch(startingSearch)
    setSearched(startingSearch !== '')
    setLoadAction(true)
  }

  // State
  const [posts, setPosts] = useState<DiscussPostItem[] | undefined>(undefined)
  const [notFound, setNotFound] = useState<boolean>(false)

  const [newPostTitle, setNewPostTitle] = useState<string>('')
  const [newPostBody, setNewPostBody] = useState<string>('')
  const [createAction, setCreateAction] = useState<boolean>(false)

  // Latest form values for the WebMCP create-post tool
  const newPostValuesRef = useRef({ title: newPostTitle, body: newPostBody })
  newPostValuesRef.current = { title: newPostTitle, body: newPostBody }

  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  // Vars
  const signedIn = userProfile.id != null && userProfile.id !== ''
  // Functions
  function onSubmit(submitValues?: { title: string; body: string }): { status: 'ok' | 'error'; message: string } {

    const values = submitValues ?? { title: newPostTitle, body: newPostBody }

    if (values.title.trim() === '') {
      setAlertSeverity('error')
      setMessage(`Title is required`)
      return { status: 'error', message: `Title is required` }
    }

    if (values.body.trim() === '') {
      setAlertSeverity('error')
      setMessage(`Post body is required`)
      return { status: 'error', message: `Post body is required` }
    }

    if (submitValues != null) {
      setNewPostTitle(submitValues.title)
      setNewPostBody(submitValues.body)
    }

    setAlertSeverity(undefined)
    setMessage(undefined)
    setCreateAction(true)

    return { status: 'ok', message: `Posting your discussion "${values.title.trim()}"` }
  }

  function submitSearch(event: FormEvent) {

    event.preventDefault()
    setSearched(true)
    setLoadAction(true)
  }

  // WebMCP
  useWebMcpTools([
    {
      name: 'search_discuss_posts',
      title: 'Search discussion posts',
      description: `Search the Relays discussion forum for posts matching text. Results replace the list of posts shown on the page.`,
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: `Text to match against discussion posts and comments. Empty to list all posts.`
          }
        }
      },
      execute: (args) => {

        const query = typeof args.query === 'string' ? args.query : ''

        setSearch(query)
        setSearched(true)
        setLoadAction(true)

        return `Searching discussion posts${query.trim() !== '' ? ` matching "${query.trim()}"` : ''}`
      }
    },
    {
      name: 'create_discuss_post',
      title: 'Create discussion post',
      description: `Publish a new discussion post to the Relays forum with the given title and body. The post appears in the list once saved.`,
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: `Title of the discussion post.`
          },
          body: {
            type: 'string',
            description: `Body text of the discussion post.`
          }
        },
        required: ['title', 'body']
      },
      execute: (args) => {

        if (!signedIn) {
          throw new Error(`Sign in to start a discussion`)
        }

        const title = typeof args.title === 'string' ? args.title : ''
        const body = typeof args.body === 'string' ? args.body : ''

        const result = onSubmit({ ...newPostValuesRef.current, title, body })

        if (result.status === 'error') {
          throw new Error(result.message)
        }

        return result.message
      }
    }
  ])

  // Render
  return (
    <>
      <Head><title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Discuss`}</title></Head>

      <Layout>

        <div style={{ margin: '0 auto', width: pageBodyWidth, textAlign: 'left', verticalAlign: 'textTop' }}>

          <div style={{ marginBottom: '2em' }}>
            <Typography
              style={{ marginBottom: '0.5em' }}
              variant='h3'>
              Discuss
            </Typography>
            <Typography variant='body1'>
              Open discussions for the Relays community. Post a topic,
              comment on others, and collaborate in the open.
            </Typography>
          </div>

          <form style={{ marginBottom: '2em', display: 'flex', gap: '1em', flexWrap: 'wrap', alignItems: 'center' }} onSubmit={submitSearch}>
            <FormControl style={{ width: '20em' }}>
              <TextField
                autoComplete='off'
                fullWidth
                label='Search posts and comments'
                onChange={(event) => setSearch(event.target.value)}
                slotProps={{
                  inputLabel: {
                    shrink: Boolean(search),
                  }
                }}
                value={search} />
            </FormControl>

            <Button
              type='submit'
              variant='contained'>
              Search
            </Button>
          </form>

          {searched === false ?
            <>
              {signedIn ?
                <Paper
                  sx={{ marginBottom: '2em', padding: '1.25em 1.5em' }}>
                  <Typography
                    style={{ marginBottom: '0.75em' }}
                    variant='h6'>
                    Start a discussion
                  </Typography>

                  {alertSeverity === 'error' && message ?
                    <Typography
                      style={{ color: '#b91c1c', marginBottom: '1em' }}
                      variant='body1'>
                      {message}
                    </Typography>
                    :
                    <></>
                  }

                  <TextField
                    fullWidth
                    label='Title'
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    size='small'
                    style={{ marginBottom: '1em' }}
                    value={newPostTitle} />

                  <TextField
                    fullWidth
                    label='What would you like to discuss?'
                    maxRows={6}
                    multiline
                    onChange={(e) => setNewPostBody(e.target.value)}
                    size='small'
                    style={{ marginBottom: '1em' }}
                    value={newPostBody} />

                  <Button
                    disabled={createAction}
                    onClick={() => onSubmit()}
                    variant='contained'>
                    {createAction ? 'Posting..' : 'Post'}
                  </Button>
                </Paper>
                :
                <Typography
                  style={{ marginBottom: '2em' }}
                  variant='body1'>
                  Sign in to start a discussion or comment on posts.
                </Typography>
              }
            </>
            :
            <></>
          }

          {notFound === true ?
            <EmptyState message="Couldn't load the discussions." />
            :
            <>
              {posts != null ?
                <>
                  {posts.length > 0 ?
                    posts.map(post => (
                      <DiscussPostListItem
                        clampBody={true}
                        key={post.id}
                        post={post}
                        userProfileId={signedIn ? userProfile.id : undefined} />
                    ))
                    :
                    <EmptyState message={searched === true ?
                      'No posts found. Try a different search.'
                      :
                      'No discussions yet. Start the first one.'
                    } />
                  }
                </>
                :
                <EmptyState
                  loading={true}
                  message='Loading discussions..' />
              }
            </>
          }
        </div>
      </Layout>

      {searched === true ?
        <SearchDiscussPosts
          search={search}
          setPosts={setPosts}
          setAlertSeverity={setAlertSeverity}
          setMessage={setMessage}
          loadAction={loadAction}
          setLoadAction={setLoadAction} />
        :
        <LoadDiscussPosts
          setAlertSeverity={setAlertSeverity}
          setMessage={setMessage}
          setNotFound={setNotFound}
          setPosts={setPosts} />
      }

      {signedIn ?
        <SaveDiscussPost
          body={newPostBody}
          saveAction={createAction}
          setAlertSeverity={setAlertSeverity}
          setSaveAction={setCreateAction}
          setMessage={setMessage}
          title={newPostTitle}
          userProfileId={userProfile.id ?? ''} />
        :
        <></>
      }
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  return loadServerPage(
    context,
    {})
}
