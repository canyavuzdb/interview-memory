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

export function requirePositiveInteger(
  value: string | undefined,
  name: string,
): number {
  const normalizedValue = requireEnvironmentValue(value, name)

  if (!/^[1-9][0-9]*$/u.test(normalizedValue)) {
    throw environmentError('Invalid positive integer environment variable', name)
  }

  const parsedValue = Number(normalizedValue)

  if (!Number.isSafeInteger(parsedValue)) {
    throw environmentError('Invalid positive integer environment variable', name)
  }

  return parsedValue
}

export function requireBase64UrlSecret(
  value: string | undefined,
  name: string,
): string {
  const normalizedValue = requireEnvironmentValue(value, name)

  if (!/^[A-Za-z0-9_-]{43}$/u.test(normalizedValue)) {
    throw environmentError('Invalid 32-byte base64url secret', name)
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
  return requirePublicOrigin(value, name, 'Supabase URL')
}

export function requireSiteUrl(
  value: string | undefined,
  name: string,
): string {
  return requirePublicOrigin(value, name, 'site URL')
}

function requirePublicOrigin(
  value: string | undefined,
  name: string,
  valueType: string,
): string {
  const normalizedValue = requireEnvironmentValue(value, name)
  let parsedUrl: URL

  try {
    parsedUrl = new URL(normalizedValue)
  } catch {
    throw environmentError(
      `Invalid ${valueType} in environment variable`,
      name,
    )
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
      `Invalid ${valueType} in environment variable`,
      name,
    )
  }

  return parsedUrl.origin
}
