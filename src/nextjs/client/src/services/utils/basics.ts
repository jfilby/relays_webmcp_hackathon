export function getEnumKey<T extends Record<string, string | number>>(
  enumObj: T,
  value: T[keyof T]
): keyof T | undefined {
  return Object.entries(enumObj).find(([, v]) => v === value)?.[0] as keyof T | undefined
}

// Guess a viable display name from an email address: take the local part
// (leaving out the domain), keep only usable characters, and join any
// separators (dots, plus, spaces, etc) with a hyphen.
export function guessUsernameFromEmail(
  email?: string | null): string {

  if (email == null) {
    return ''
  }

  // Local part only (before the '@'), domain dropped
  const localPart = email.split('@')[0] ?? ''

  // Keep only alphanumerics, replacing every other run of characters with a
  // single hyphen (e.g. "john.doe+tag" -> "john-doe-tag")
  const hyphenated = localPart.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  // A username can't start or end with a hyphen
  const trimmed = hyphenated.replace(/^-+|-+$/g, '')

  return trimmed
}