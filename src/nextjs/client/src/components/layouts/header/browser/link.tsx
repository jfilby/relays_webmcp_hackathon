import { Link } from '@mui/material'

interface Props {
  name: string | undefined
  linkName: string
  highLevelLink: string
  isBrand?: boolean
}

export function HeaderBrowserLink({
  name,
  linkName,
  highLevelLink,
  isBrand = false
}: Props) {

  // Vars
  const isActive = highLevelLink === linkName

  // Colors are inline (not sx) so they cannot be overridden by the global
  // `a` rule in styles.css.
  const style: React.CSSProperties = {
    display: 'inline-block',
    padding: isBrand ? '0' : '0.3em 0.8em',
    borderRadius: 999,
    fontSize: isBrand ? '1.05rem' : '0.95rem',
    textDecoration: 'none'
  }

  if (isBrand) {
    style.color = '#111111'
    style.fontWeight = 700

    if (isActive !== true) {
      style.marginRight = '0.6em'
    }
  } else if (isActive) {
    style.backgroundColor = '#111111'
    style.color = '#ffffff'
    style.fontWeight = 600
  } else {
    style.color = '#5a5a5a'
    style.fontWeight = 500
  }

  // Render
  return (
    <Link
      href={`/${linkName}`}
      style={style}
      underline='none'>
      {name}
    </Link>
  )
}
