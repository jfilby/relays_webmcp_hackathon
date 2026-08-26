export function loadClientPage(
  userProfile: object | undefined = undefined,
  setProfileUser?: (value: unknown) => void) {

  // Loader handling
  if (typeof window !== 'undefined') {
    const loader = document.getElementById('globalLoader')
    if (loader)
      loader.remove()
  }

  // Set userProfileId
  if (userProfile &&
    setProfileUser) {
    setProfileUser(userProfile)
  }
}