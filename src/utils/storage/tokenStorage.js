// Helper penyimpanan token ke cookie/localStorage
const TOKEN_COOKIE = 'uptlab_access_token'
const DEFAULT_MAX_AGE = 60 * 60 * 24 // 1 hari

const isBrowser = () => typeof document !== 'undefined'

const isHttps = () =>
  typeof window !== 'undefined' && window.location?.protocol === 'https:'

const serializeCookie = (value, { maxAge = DEFAULT_MAX_AGE } = {}) => {
  const segments = [
    `${TOKEN_COOKIE}=${encodeURIComponent(value)}`,
    `Path=/`,
    `SameSite=Strict`,
  ]
  if (maxAge) segments.push(`Max-Age=${maxAge}`)
  if (isHttps()) {
    segments.push('Secure')
  }
  return segments.join('; ')
}

export const tokenStorage = {
  set(token, options = {}) {
    if (!isBrowser()) return
    if (!token) {
      this.clear()
      return
    }
    document.cookie = serializeCookie(token, options)
    this._memoryCache = token
  },

  get() {
    if (!isBrowser()) return this._memoryCache || null
    if (this._memoryCache) return this._memoryCache
    const cookieString = document.cookie || ''
    const target = cookieString
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${TOKEN_COOKIE}=`))
    if (!target) return null
    const value = decodeURIComponent(target.split('=').slice(1).join('='))
    this._memoryCache = value
    return value
  },

  clear() {
    if (!isBrowser()) {
      this._memoryCache = null
      return
    }
    document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Strict`
    this._memoryCache = null
  },
}
