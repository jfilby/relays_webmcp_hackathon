import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SearchIcon from '@mui/icons-material/Search'
import LoadProfilesByFilter from '@/components/profiles/load-by-filter'
import LoadProjectsByFilter from '@/components/projects/load-by-filter'
import LoadDiscussPostsBySearch from '@/components/discussion/search-discuss-posts'
import { projectStageName, profileTypeName } from '@/types/client-only-types'
import type { DiscussPostItem, Profile, Project } from '@/types/client-only-types'

// Number of results shown per group before the user expands it
const previewCount = 3

// Only search once the query is at least this long
const minimumSearchLength = 2

// Delay before a keystroke triggers a search (debounce)
const searchDebounceMilliseconds = 300

export default function SearchOmnibar() {

  // Router
  const router = useRouter()

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const latestSearchRef = useRef<string>('')
  const searchTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // State
  const [searchText, setSearchText] = useState<string>('')
  const [committedSearch, setCommittedSearch] = useState<string>('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [posts, setPosts] = useState<DiscussPostItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [open, setOpen] = useState<boolean>(false)

  // Consts
  const hasQuery = committedSearch.length >= minimumSearchLength

  // Functions

  // Debounce keystrokes into the committed search text. The loaders are
  // keyed on the committed search so they remount and fetch once per
  // committed query.
  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {

    const value = event.target.value
    setSearchText(value)
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {

      const committed = value.trim()
      latestSearchRef.current = committed
      setCommittedSearch(committed)
      setProfiles([])
      setPosts([])
      setProjects([])
      setMessage(undefined)
      setLoading(committed.length >= minimumSearchLength)
    }, searchDebounceMilliseconds)
  }

  // Close the dropdown when clicking outside of it
  useEffect(() => {

    function handlePointerDown(event: MouseEvent) {

      if (containerRef.current != null &&
        containerRef.current.contains(event.target as Node) === false) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  // Functions

  function handleKeyDown(event: React.KeyboardEvent) {

    if (event.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  function renderProfileRow(profile: Profile, key: string) {

    return (
      <Link
        key={key}
        href={`/profiles/${profile.publicId}`}
        onClick={() => setOpen(false)}
        underline='none'
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75em',
          padding: '0.5em 0.75em',
          borderRadius: '0.4em',
          color: 'inherit',
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
        }}>
        <Avatar
          src={profile.avatar ?? undefined}
          sx={{ width: 32, height: 32 }}>
          {profile.displayName.charAt(0)}
        </Avatar>
        <Box sx={{ minWidth: 0, textAlign: 'left' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
            <Typography
              variant='body2'
              sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.displayName}
            </Typography>
            <Chip
              label={profileTypeName(profile.type)}
              size='small'
              sx={{ height: 18, fontSize: '0.65rem' }} />
          </Box>
          {profile.headline != null && profile.headline !== '' ?
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.headline}
            </Typography>
            :
            <></>
          }
        </Box>
      </Link>
    )
  }

  function renderPostRow(post: DiscussPostItem, key: string) {

    return (
      <Link
        key={key}
        href={`/discuss/${post.publicId}`}
        onClick={() => setOpen(false)}
        underline='none'
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75em',
          padding: '0.5em 0.75em',
          borderRadius: '0.4em',
          color: 'inherit',
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
        }}>
        <Box sx={{ minWidth: 0, textAlign: 'left' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
            <Typography
              variant='body2'
              sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {post.title}
            </Typography>
            <Chip
              label={`${post.commentCount} comments`}
              size='small'
              sx={{ height: 18, fontSize: '0.65rem' }} />
          </Box>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.body}
          </Typography>
        </Box>
      </Link>
    )
  }

  function renderProjectRow(project: Project, key: string) {

    return (
      <Link
        key={key}
        href={`/projects/${project.publicId}`}
        onClick={() => setOpen(false)}
        underline='none'
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75em',
          padding: '0.5em 0.75em',
          borderRadius: '0.4em',
          color: 'inherit',
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
        }}>
        <Box sx={{ minWidth: 0, textAlign: 'left' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
            <Typography
              variant='body2'
              sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project.name}
            </Typography>
            {project.stage != null && project.stage !== '' ?
              <Chip
                label={projectStageName(project.stage)}
                size='small'
                sx={{ height: 18, fontSize: '0.65rem' }} />
              :
              <></>
            }
          </Box>
          {project.tagline != null && project.tagline !== '' ?
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project.tagline}
            </Typography>
            :
            <></>
          }
        </Box>
      </Link>
    )
  }

  function renderGroupHeader(
    name: string,
    count: number,
    breakoutLabel: string,
    breakoutLink: string) {

    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.4em 0.75em 0.2em 0.75em'
      }}>
        <Typography variant='overline' color='text.secondary'>
          {name} ({count})
        </Typography>
        <Button
          size='small'
          onClick={() => {
            setOpen(false)
            router.push(breakoutLink)
          }}
          sx={{ textTransform: 'none', padding: '0 0.5em', minWidth: 0 }}>
          {breakoutLabel}
        </Button>
      </Box>
    )
  }

  function renderGroup(
    name: string,
    count: number,
    items: React.ReactNode[],
    breakoutLabel: string,
    breakoutLink: string) {

    if (count === 0) {
      return null
    }

    return (
      <Box>
        {renderGroupHeader(name, count, breakoutLabel, breakoutLink)}
        {items.slice(0, previewCount)}
      </Box>
    )
  }


  // Render
  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        flex: 1,
        maxWidth: '34em',
        marginX: '1em'
      }}>
      <TextField
        autoComplete='off'
        inputRef={inputRef}
        size='small'
        fullWidth
        placeholder={`Search`}
        value={searchText}
        onChange={handleSearchChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        slotProps={{
          input: {
            startAdornment:
              <InputAdornment position='start'>
                <SearchIcon fontSize='small' />
              </InputAdornment>,
            endAdornment:
              loading === true ?
                <InputAdornment position='end'>
                  <CircularProgress size={16} />
                </InputAdornment>
                :
                undefined,
            sx: { borderRadius: 999, backgroundColor: 'rgba(0, 0, 0, 0.03)' }
          }
        }} />

      {open === true && hasQuery === true ?
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: 'calc(100% + 0.5em)',
            left: 0,
            right: 0,
            zIndex: 1100,
            maxHeight: '28em',
            overflowY: 'auto',
            padding: '0.5em'
          }}>

          {loading === true ?
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ padding: '0.75em' }}>
              Searching…
            </Typography>
            :
            <>
              {message != null && message !== '' ?
                <Typography
                  variant='body2'
                  color='error'
                  sx={{ padding: '0.75em' }}>
                  {message}
                </Typography>
                :
                <></>
              }

              {profiles.length === 0 && projects.length === 0 && posts.length === 0 ?
                <Box sx={{ padding: '0.75em' }}>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ marginBottom: '0.5em' }}>
                    No profiles, projects or posts match `{committedSearch}`
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '0.5em' }}>
                    <Button
                      onClick={() => {
                        setOpen(false)
                        router.push(`/profiles?search=${encodeURIComponent(committedSearch)}`)
                      }}
                      size='small'
                      variant='outlined'>
                      Search profiles
                    </Button>
                    <Button
                      onClick={() => {
                        setOpen(false)
                        router.push(`/projects?search=${encodeURIComponent(committedSearch)}`)
                      }}
                      size='small'
                      variant='outlined'>
                      Search projects
                    </Button>
                    <Button
                      onClick={() => {
                        setOpen(false)
                        router.push(`/discuss?search=${encodeURIComponent(committedSearch)}`)
                      }}
                      size='small'
                      variant='outlined'>
                      Search posts
                    </Button>
                  </Box>
                </Box>
                :
                <>
                  {renderGroup(
                    'Profiles',
                    profiles.length,
                    profiles.map((profile) => renderProfileRow(profile, profile.id)),
                    `All profiles`,
                    `/profiles?search=${encodeURIComponent(committedSearch)}`)}

                  {profiles.length > 0 && (projects.length > 0 || posts.length > 0) ?
                    <Box sx={{ borderBottom: '1px solid #eeeeee', marginY: '0.4em' }} />
                    :
                    <></>
                  }

                  {renderGroup(
                    'Projects',
                    projects.length,
                    projects.map((project) => renderProjectRow(project, project.id)),
                    `All projects`,
                    `/projects?search=${encodeURIComponent(committedSearch)}`)}

                  {projects.length > 0 && posts.length > 0 ?
                    <Box sx={{ borderBottom: '1px solid #eeeeee', marginY: '0.4em' }} />
                    :
                    <></>
                  }

                  {renderGroup(
                    'Posts',
                    posts.length,
                    posts.map((post) => renderPostRow(post, post.id)),
                    `All posts`,
                    `/discuss?search=${encodeURIComponent(committedSearch)}`)}
                </>
              }
            </>
          }
        </Paper>
        :
        <></>
      }

      {/* Data loading (no UI). Remounted per committed search so each
          query fetches exactly once, and stale responses are dropped. */}
      <LoadProfilesByFilter
        key={`profiles-${committedSearch}`}
        search={committedSearch}
        type={undefined}
        setProfiles={(loaded) => {
          if (latestSearchRef.current === committedSearch) {
            setProfiles(loaded)
            setLoading(false)
          }
        }}
        setAlertSeverity={() => {}}
        setMessage={(errorMessage) => {
          if (latestSearchRef.current === committedSearch) {
            setMessage(errorMessage)
            setLoading(false)
          }
        }}
        loadAction={hasQuery}
        setLoadAction={() => {}} />
      <LoadProjectsByFilter
        key={`projects-${committedSearch}`}
        search={committedSearch}
        isPromoted={undefined}
        setProjects={(loaded) => {
          if (latestSearchRef.current === committedSearch) {
            setProjects(loaded)
            setLoading(false)
          }
        }}
        setAlertSeverity={() => {}}
        setMessage={(errorMessage) => {
          if (latestSearchRef.current === committedSearch) {
            setMessage(errorMessage)
            setLoading(false)
          }
        }}
        loadAction={hasQuery}
        setLoadAction={() => {}} />
      <LoadDiscussPostsBySearch
        key={`posts-${committedSearch}`}
        search={committedSearch}
        setPosts={(loaded) => {
          if (latestSearchRef.current === committedSearch) {
            setPosts(loaded ?? [])
            setLoading(false)
          }
        }}
        setAlertSeverity={() => {}}
        setMessage={(errorMessage) => {
          if (latestSearchRef.current === committedSearch) {
            setMessage(errorMessage)
            setLoading(false)
          }
        }}
        loadAction={hasQuery}
        setLoadAction={() => {}} />
    </Box>
  )
}
