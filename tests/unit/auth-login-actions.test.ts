import { beforeEach, describe, expect, it, vi } from 'vitest'
import { redirect } from 'next/navigation'

import {
  signInAction,
  signUpAction,
} from '@/app/[locale]/login/actions'
import { createSupabaseAuthGateway } from '@/lib/server/auth/gateway'
import { reconcileAnonymousSubjectForActiveAccount } from '@/lib/server/auth/intake-bridge'
import { createAuthService } from '@/lib/server/auth/service'

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
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

const signIn = vi.fn()
const signUp = vi.fn()

function form(fields: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}

beforeEach(() => {
  vi.mocked(createSupabaseAuthGateway).mockResolvedValue({} as never)
  vi.mocked(createAuthService).mockReturnValue({ signIn, signUp } as never)
  vi.mocked(reconcileAnonymousSubjectForActiveAccount).mockResolvedValue(
    'merged',
  )
  signIn.mockResolvedValue(undefined)
  signUp.mockResolvedValue({ outcome: 'session_created' })
})

describe('password auth actions', () => {
  it('reconciles anonymous ownership after password sign-in', async () => {
    await signInAction({ status: 'idle' } as never, form({
      locale: 'tr',
      email: 'member@example.com',
      password: 'private-password',
      next: '/tr/account',
    }))
    expect(reconcileAnonymousSubjectForActiveAccount).toHaveBeenCalledOnce()
    expect(redirect).toHaveBeenCalledWith('/tr/account?status=signedIn')
  })

  it('reconciles an immediate signup session', async () => {
    await signUpAction({ status: 'idle' } as never, form({
      locale: 'en',
      email: 'member@example.com',
      password: 'private-password',
    }))
    expect(reconcileAnonymousSubjectForActiveAccount).toHaveBeenCalledOnce()
    expect(redirect).toHaveBeenCalledWith('/en/account?status=signedIn')
  })

  it.each([
    ['existing_account', 'accountAlreadyExists'],
    ['session_missing', 'signUpSessionMissing'],
  ] as const)('reports %s without claiming that a confirmation email was sent', async (outcome, code) => {
    signUp.mockResolvedValue({ outcome })
    await expect(signUpAction({ status: 'idle' } as never, form({
      locale: 'tr',
      email: 'member@example.com',
      password: 'private-password',
    }))).resolves.toEqual({ status: 'error', code })
    expect(reconcileAnonymousSubjectForActiveAccount).not.toHaveBeenCalled()
  })
})
