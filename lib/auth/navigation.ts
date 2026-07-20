import {
  authLocaleSchema,
  type AuthLocale,
} from '@/lib/auth/contracts'

export function getDefaultAccountPath(locale: AuthLocale): string {
  return `/${locale}/account`
}

export function getResetPasswordPath(locale: AuthLocale): string {
  return `/${locale}/reset-password`
}

export function getLoginPath(
  locale: AuthLocale,
  options: { next?: string | null; status?: string | null } = {},
): string {
  const parameters = new URLSearchParams()

  if (options.next) parameters.set('next', options.next)
  if (options.status) parameters.set('status', options.status)

  const query = parameters.toString()

  return `/${locale}/login${query ? `?${query}` : ''}`
}

export function getSignedInPath(path: string): string {
  const url = new URL(path, 'https://interview-memory.invalid')

  url.searchParams.set('status', 'signedIn')

  return `${url.pathname}${url.search}${url.hash}`
}

export function sanitizeAuthNextPath(
  value: unknown,
  locale: AuthLocale,
): string {
  const fallback = getDefaultAccountPath(locale)

  if (typeof value !== 'string' || value.length > 200) return fallback

  const allowedPaths = new Set([
    fallback,
    getResetPasswordPath(locale),
  ])

  return allowedPaths.has(value) ? value : fallback
}

export function resolveAuthLocale(value: unknown): AuthLocale {
  const result = authLocaleSchema.safeParse(value)

  return result.success ? result.data : 'tr'
}

export function createAbsoluteAppUrl(siteUrl: string, path: string): string {
  return new URL(path, `${siteUrl}/`).toString()
}
