import { describe, expect, it } from 'vitest'

import { createAuthRedirect } from '@/lib/server/auth/response'

describe('auth redirect response', () => {
  it('creates a 303 response that cannot be shared or cached', () => {
    const response = createAuthRedirect('https://app.example/tr/account')

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe(
      'https://app.example/tr/account',
    )
    expect(response.headers.get('cache-control')).toBe(
      'private, no-cache, no-store, must-revalidate, max-age=0',
    )
    expect(response.headers.get('expires')).toBe('0')
    expect(response.headers.get('pragma')).toBe('no-cache')
  })
})
