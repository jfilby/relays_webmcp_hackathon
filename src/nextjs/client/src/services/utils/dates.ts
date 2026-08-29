// Formats a timestamp as a relative "since" string, e.g. `3 hours ago`.
// Falls back to `just now` for timestamps in the very recent past.
export function formatSince(value: string | undefined | null): string {

  if (value == null || value === '') {
    return ''
  }

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return ''
  }

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 1) {
    return `just now`
  }

  const minutes = Math.floor(seconds / 60)

  if (minutes < 1) {
    return `${seconds} second${seconds === 1 ? '' : 's'} ago`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 1) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  }

  const days = Math.floor(hours / 24)

  if (days < 1) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }

  const weeks = Math.floor(days / 7)

  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`
  }

  if (days < 30) {
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  }

  const months = Math.floor(days / 30)

  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} ago`
  }

  const years = Math.floor(days / 365)

  return `${years} year${years === 1 ? '' : 's'} ago`
}
