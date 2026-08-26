import { Typography } from '@mui/material'
import { HeaderBrowserLink } from './link'

interface Props {
  pageUser?: {
    profile?: { id?: string }
  }
  pageProject?: {
    instance?: {
      key?: string
      name?: string
    }
  }
  highLevelLink: string
}

export function HeaderBrowserProjectMenu({
  pageUser,
  pageProject,
  highLevelLink
}: Props) {

  return (
    <>
      <Typography>
        <HeaderBrowserLink
          name='Plan'
          linkName={`${pageUser?.profile?.id}/${pageProject?.instance?.key}/plan`}
          highLevelLink={highLevelLink} />
        &nbsp;
        &nbsp;
        &nbsp;
        <HeaderBrowserLink
          name='Chat'
          linkName={`${pageUser?.profile?.id}/${pageProject?.instance?.key}/chat`}
          highLevelLink={highLevelLink} />
        &nbsp;
        &nbsp;
        &nbsp;
        <HeaderBrowserLink
          name='Settings'
          linkName={`${pageUser?.profile?.id}/${pageProject?.instance?.key}/settings`}
          highLevelLink={highLevelLink} />
      </Typography>
    </>
  )
}