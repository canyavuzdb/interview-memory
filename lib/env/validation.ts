function environmentError(message: string, name: string): Error {
  return new Error(`${message}: ${name}`)
}

const SUPABASE_PUBLISHABLE_KEY_PREFIX = 'sb_publishable_'
const SUPABASE_SECRET_KEY_PREFIX = 'sb_secret_'
const LOCAL_SUPABASE_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '[::1]',
])

export function requireEnvironmentValue(
  value: string | undefined,
  name: string,
): string {
  const normalizedValue = value?.trim()

  if (!normalizedValue) {
    throw environmentError('Missing environment variable', name)
  }

  return normalizedValue
}

function requireSupabaseKey(
  value: string | undefined,
  name: string,
  prefix: string,
  keyType: string,
): string {
  const normalizedValue = requireEnvironmentValue(value, name)

  if (
    !normalizedValue.startsWith(prefix) ||
    normalizedValue.length === prefix.length
  ) {
    throw environmentError(
      `Invalid Supabase ${keyType} key in environment variable`,
      name,
    )
  }

  return normalizedValue
}

export function requireSupabasePublishableKey(
  value: string | undefined,
  name: string,
): string {
  return requireSupabaseKey(
    value,
    name,
    SUPABASE_PUBLISHABLE_KEY_PREFIX,
    'publishable',
  )
}

export function requireSupabaseSecretKey(
  value: string | undefined,
  name: string,
): string {
  return requireSupabaseKey(
    value,
    name,
    SUPABASE_SECRET_KEY_PREFIX,
    'secret',
  )
}

export function requireSupabaseUrl(
  value: string | undefined,
  name: string,
): string {
  const normalizedValue = requireEnvironmentValue(value, name)
  let parsedUrl: URL

  try {
    parsedUrl = new URL(normalizedValue)
  } catch {
    throw environmentError('Invalid Supabase URL in environment variable', name)
  }

  const isSecure = parsedUrl.protocol === 'https:'
  const isLocalDevelopmentUrl =
    parsedUrl.protocol === 'http:' &&
    LOCAL_SUPABASE_HOSTNAMES.has(parsedUrl.hostname)
  const hasCredentials =
    parsedUrl.username.length > 0 || parsedUrl.password.length > 0
  const hasUnexpectedComponents =
    parsedUrl.pathname !== '/' ||
    parsedUrl.search.length > 0 ||
    parsedUrl.hash.length > 0

  if (
    (!isSecure && !isLocalDevelopmentUrl) ||
    hasCredentials ||
    hasUnexpectedComponents
  ) {
    throw environmentError(
      'Invalid Supabase URL in environment variable',
      name,
    )
  }

  return parsedUrl.origin
}
