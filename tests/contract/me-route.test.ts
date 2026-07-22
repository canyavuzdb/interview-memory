import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from '@/app/api/v1/me/route'
import { resolveActiveAccount } from '@/lib/server/auth/session'

vi.mock('@/lib/server/auth/session', () => ({ resolveActiveAccount: vi.fn() }))

const account = {
  userId: '11111111-1111-4111-8111-111111111111',
  locale: 'tr',
  timezone: 'Europe/Istanbul',
  onboardingStatus: 'pending',
  accountStatus: 'active',
  version: 1,
} as const

beforeEach(() => {
  vi.mocked(resolveActiveAccount).mockResolvedValue(account)
})

describe('GET /api/v1/me', () => {
  it('returns only the private account projection', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('no-store')
    await expect(response.json()).resolves.toEqual({ data: account })
  })

  it('returns a private 401 when there is no active session', async () => {
    vi.mocked(resolveActiveAccount).mockResolvedValue(null)
    const response = await GET()
    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      error: { code: 'AUTHENTICATION_REQUIRED' },
    })
  })

  it('fails closed without leaking account read details', async () => {
    vi.mocked(resolveActiveAccount).mockRejectedValue(new Error('private'))
    const response = await GET()
    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: { code: 'ACCOUNT_READ_FAILED' },
    })
  })
})
