import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

import { GET as callback } from '@/app/auth/callback/route'
import { GET as confirm } from '@/app/auth/confirm/route'
import { createSupabaseAuthGateway } from '@/lib/server/auth/gateway'
import { reconcileAnonymousSubjectForActiveAccount } from '@/lib/server/auth/intake-bridge'
import { createAuthService } from '@/lib/server/auth/service'

vi.mock('@/lib/env/public', () => ({
  getPublicSiteUrl: () => 'https://interview-memory.example',
}))
vi.mock('@/lib/server/auth/gateway', () => ({
  createSupabaseAuthGateway: vi.fn(),
}))
vi.mock('@/lib/server/auth/service', () => ({ createAuthService: vi.fn() }))
vi.mock('@/lib/server/auth/intake-bridge', () => ({
  reconcileAnonymousSubjectForActiveAccount: vi.fn(),
}))

const exchangeCode = vi.fn()
const verifyOtp = vi.fn()

beforeEach(() => {
  vi.mocked(createSupabaseAuthGateway).mockResolvedValue({} as never)
  vi.mocked(createAuthService).mockReturnValue({ exchangeCode, verifyOtp } as never)
  vi.mocked(reconcileAnonymousSubjectForActiveAccount).mockResolvedValue(
    'merged',
  )
  exchangeCode.mockResolvedValue(undefined)
  verifyOtp.mockResolvedValue({ locale: 'en', type: 'signup' })
})

describe('auth completion routes', () => {
  it('reconciles anonymous ownership after an OAuth code exchange', async () => {
    const response = await callback(new NextRequest(
      'https://interview-memory.example/auth/callback?code=ok&locale=en&next=/en/account',
    ))
    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe(
      'https://interview-memory.example/en/account?status=signedIn',
    )
    expect(exchangeCode).toHaveBeenCalledWith('ok')
    expect(reconcileAnonymousSubjectForActiveAccount).toHaveBeenCalledOnce()
  })

  it('reconciles ownership after email OTP confirmation', async () => {
    const response = await confirm(new NextRequest(
      'https://interview-memory.example/auth/confirm?token_hash=1234567890123456&type=signup',
    ))
    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe(
      'https://interview-memory.example/en/account',
    )
    expect(reconcileAnonymousSubjectForActiveAccount).toHaveBeenCalledOnce()
  })

  it('does not reconcile when authentication completion fails', async () => {
    exchangeCode.mockRejectedValue(new Error('private'))
    const response = await callback(new NextRequest(
      'https://interview-memory.example/auth/callback?code=bad&locale=tr',
    ))
    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toContain(
      '/tr/login?status=callbackFailed',
    )
    expect(reconcileAnonymousSubjectForActiveAccount).not.toHaveBeenCalled()
  })
})
