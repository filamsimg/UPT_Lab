// Helper avatar inisial: generate warna dan huruf dari nama
const DEFAULT_BG = '#1e88e5'
const DEFAULT_TEXT = '#ffffff'
const NAME_FALLBACK = 'KI'

const expandShortHex = (value) => {
  if (!value || value.length !== 4 || value[0] !== '#') return value
  const [, r, g, b] = value
  return `#${r}${r}${g}${g}${b}${b}`
}

const sanitizeHexColor = (value, fallback) => {
  if (typeof value !== 'string') return fallback
  const hex = value.trim().toLowerCase()
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(hex)) return fallback
  return hex.length === 4 ? expandShortHex(hex) : hex
}

const extractInitials = (name = '', maxLetters = 2) => {
  if (typeof name !== 'string' || !name.trim()) return ''
  const tokens = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!tokens.length) return ''
  const letters = tokens
    .map((token) => token[0])
    .filter(Boolean)
    .slice(0, maxLetters)
    .join('')
  return letters.toUpperCase()
}

export const buildInitialAvatar = (name, options = {}) => {
  const size = Number.isFinite(options.size) ? Math.max(24, options.size) : 128
  const fontSize = Number.isFinite(options.fontSize)
    ? Math.min(60, Math.max(28, options.fontSize))
    : 50
  const fontWeight = options.fontWeight || 400
  const fontFamily = options.fontFamily || 'Arial, sans-serif'
  const background = sanitizeHexColor(options.backgroundColor || options.background, DEFAULT_BG)
  const textColor = sanitizeHexColor(options.textColor || options.color, DEFAULT_TEXT)
  const initials = extractInitials(name) || NAME_FALLBACK

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
      <rect fill="${background}" width="100" height="100" x="0" y="0" />
      <text x="50%" y="50%" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${textColor}" text-anchor="middle" dy="17.8">${initials}</text>
    </svg>
  `.trim()

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const getInitials = (name) => extractInitials(name)
