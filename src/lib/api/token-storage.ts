/**
 * Single source of truth for auth tokens. Swap the implementation here
 * (e.g. to httpOnly-cookie based auth) without touching call sites.
 */
const ACCESS_TOKEN_KEY = 'auth.accessToken'
const REFRESH_TOKEN_KEY = 'auth.refreshToken'

export const tokenStorage = {
  getAccess: () =>
    sessionStorage.getItem(ACCESS_TOKEN_KEY) ?? localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () =>
    sessionStorage.getItem(REFRESH_TOKEN_KEY) ?? localStorage.getItem(REFRESH_TOKEN_KEY),
  set: (access: string, refresh?: string, persistent?: boolean) => {
    const usePersistentStorage =
      persistent ??
      Boolean(
        localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY),
      )
    const storage = usePersistentStorage ? localStorage : sessionStorage
    const otherStorage = usePersistentStorage ? sessionStorage : localStorage
    otherStorage.removeItem(ACCESS_TOKEN_KEY)
    otherStorage.removeItem(REFRESH_TOKEN_KEY)
    storage.setItem(ACCESS_TOKEN_KEY, access)
    if (refresh) storage.setItem(REFRESH_TOKEN_KEY, refresh)
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}
