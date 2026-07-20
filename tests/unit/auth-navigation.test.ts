import { describe, expect, it } from 'vitest'

import {
  createAbsoluteAppUrl,
  getDefaultAccountPath,
  getLoginPath,
  getResetPasswordPath,
  getSignedInPath,
  resolveAuthLocale,
  sanitizeAuthNextPath,
} from '@/lib/auth/navigation'

describe('auth navigation', () => {
  it('builds localized account, reset, and login paths', () => {
    expect(getDefaultAccountPath('tr')).toBe('/tr/account')
    expect(getResetPasswordPath('en')).toBe('/en/reset-password')
    expect(getLoginPath('tr')).toBe('/tr/login')
    expect(
      getLoginPath('en', {
        next: '/en/account',
        status: 'sessionRequired',
      }),
    ).toBe('/en/login?next=%2Fen%2Faccount&status=sessionRequired')
    expect(getLoginPath('tr', { status: 'signedOut' })).toBe(
      '/tr/login?status=signedOut',
    )
    expect(getSignedInPath('/tr/account')).toBe(
      '/tr/account?status=signedIn',
    )
    expect(getSignedInPath('/tr/account?source=login#status')).toBe(
      '/tr/account?source=login&status=signedIn#status',
    )
  })

  it.each([
    [null, '/tr/account'],
    [42, '/tr/account'],
    ['x'.repeat(201), '/tr/account'],
    ['https://evil.example/account', '/tr/account'],
    ['//evil.example/account', '/tr/account'],
    ['/en/account', '/tr/account'],
    ['/tr/account?admin=true', '/tr/account'],
    ['/tr/account', '/tr/account'],
    ['/tr/reset-password', '/tr/reset-password'],
  ])('sanitizes a post-auth destination: %s', (value, expected) => {
    expect(sanitizeAuthNextPath(value, 'tr')).toBe(expected)
  })

  it('uses only a supported locale and builds an absolute URL', () => {
    expect(resolveAuthLocale('en')).toBe('en')
    expect(resolveAuthLocale('de')).toBe('tr')
    expect(resolveAuthLocale(null)).toBe('tr')
    expect(
      createAbsoluteAppUrl('https://interview-memory.example', '/auth/confirm'),
    ).toBe('https://interview-memory.example/auth/confirm')
  })
})
