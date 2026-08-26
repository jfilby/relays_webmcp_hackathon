import { Typography } from '@mui/material'
import { HeaderBrowserLink } from './link'

interface Props {
  pageUser: {
    profile?: {
      id?: string
      displayName?: string
    }
  }
  pageProject?: {
    instance?: {
      key?: string
      name?: string
    }
  } | null
  highLevelLink: string
}

export function HeaderBrowserUsernameProject({
  pageUser,
  pageProject,
  highLevelLink
}: Props) {

  return (
    <div style={{
      display: 'inline-block'
    }}>
      <Typography>
        <HeaderBrowserLink
          name={pageUser.profile?.displayName}
          linkName={pageUser.profile?.id ?? ''}
          highLevelLink={highLevelLink} />
        &nbsp;
        {pageProject != null ?
          <>
            /
            &nbsp;
            <HeaderBrowserLink
              name={pageProject.instance?.name}
              linkName={`${pageUser.profile?.id}/${pageProject.instance?.key}`}
              highLevelLink={highLevelLink} />
          </>
          :
          <></>
        }
      </Typography>
    </div>
  )
}