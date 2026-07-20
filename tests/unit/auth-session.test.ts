import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  AuthPersistenceError,
  AuthSessionError,
} from '@/lib/auth/errors'
import {
  createAccountSessionResolver,
  resolveActiveAccount,
} from '@/lib/server/auth/session'
import { createSupabaseAccountRepository } from '@/lib/server/auth/repository'
import { createServerSupabaseClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}))

vi.mock('@/lib/server/auth/repository', async (importOriginal) => {
  const original = await importOriginal<
    typeof import('@/lib/server/auth/repository')
  >()

  return {
    ...original,
    createSupabaseAccountRepository: vi.fn(),
  }
})

const userId = 'a4000000-0000-4000-8000-000000000001'
const record = {
  user_id: userId,
  locale: 'tr',
  timezone: 'Europe/Istanbul',
  onboarding_status: 'pending',
  account_status: 'active',
  version: 1,
} as const

function createResolver(overrides: {
  claims?: unknown
  claimsFailure?: unknown
  record?: unknown
  repositoryFailure?: unknown
} = {}) {
  const getClaims = overrides.claimsFailure
    ? vi.fn().mockRejectedValue(overrides.claimsFailure)
    : vi.fn().mockResolvedValue(
        Object.prototype.hasOwnProperty.call(overrides, 'claims')
          ? overrides.claims
          : { sub: userId },
      )
  const getMyAccount = overrides.repositoryFailure
    ? vi.fn().mockRejectedValue(overrides.repositoryFailure)
    : vi.fn().mockResolvedValue(
        Object.prototype.hasOwnProperty.call(overrides, 'record')
          ? overrides.record
          : record,
      )

  return {
    getClaims,
    getMyAccount,
    resolver: createAccountSessionResolver({
      getClaims,
      repository: { getMyAccount } as never,
    }),
  }
}

describe('account session resolver', () => {
  beforeEach(() => {
    vi.mocked(createServerSupabaseClient).mockReset()
    vi.mocked(createSupabaseAccountRepository).mockReset()
  })

  it('returns the minimal active account for matching verified claims', async () => {
    const { resolver } = createResolver()

    await expect(resolver.resolve()).resolves.toEqual({
      userId,
      locale: 'tr',
      timezone: 'Europe/Istanbul',
      onboardingStatus: 'pending',
      accountStatus: 'active',
      version: 1,
    })
  })

  it.each([
    { claims: null },
    { claims: { sub: 'not-a-uuid' } },
    { claimsFailure: new Error('unavailable') },
  ])('fails closed when claims are unavailable or invalid', async (input) => {
    const { resolver, getMyAccount } = createResolver(input)

    await expect(resolver.resolve()).resolves.toBeNull()
    expect(getMyAccount).not.toHaveBeenCalled()
  })

  it('returns null when no active application account exists', async () => {
    const { resolver } = createResolver({ record: null })

    await expect(resolver.resolve()).resolves.toBeNull()
  })

  it.each([
    [
      new AuthPersistenceError('ACCOUNT_RESPONSE_INVALID'),
      'ACCOUNT_RESPONSE_INVALID',
    ],
    [new AuthPersistenceError('ACCOUNT_READ_FAILED'), 'ACCOUNT_READ_FAILED'],
    [new Error('private detail'), 'ACCOUNT_READ_FAILED'],
  ] as const)('maps repository failures to %s', async (failure, code) => {
    const { resolver } = createResolver({ repositoryFailure: failure })

    await expect(resolver.resolve()).rejects.toEqual(
      new AuthSessionError(code),
    )
  })

  it('rejects an invalid mapped account projection', async () => {
    const { resolver } = createResolver({
      record: { ...record, timezone: '' },
    })

    await expect(resolver.resolve()).rejects.toEqual(
      new AuthSessionError('ACCOUNT_RESPONSE_INVALID'),
    )
  })

  it('rejects a confused-deputy account mismatch', async () => {
    const { resolver } = createResolver({
      record: {
        ...record,
        user_id: 'a4000000-0000-4000-8000-000000000002',
      },
    })

    await expect(resolver.resolve()).rejects.toEqual(
      new AuthSessionError('ACCOUNT_RESPONSE_INVALID'),
    )
  })

  it('composes the request-scoped Supabase client and repository', async () => {
    const client = {
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { sub: userId } },
          error: null,
        }),
      },
    }
    const repository = { getMyAccount: vi.fn().mockResolvedValue(record) }
    vi.mocked(createServerSupabaseClient).mockResolvedValue(client as never)
    vi.mocked(createSupabaseAccountRepository).mockReturnValue(repository)

    await expect(resolveActiveAccount()).resolves.toMatchObject({ userId })
    expect(createSupabaseAccountRepository).toHaveBeenCalledWith(client)
  })

  it('fails closed when Supabase rejects composed claims', async () => {
    const client = {
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'expired' },
        }),
      },
    }
    const repository = { getMyAccount: vi.fn() }
    vi.mocked(createServerSupabaseClient).mockResolvedValue(client as never)
    vi.mocked(createSupabaseAccountRepository).mockReturnValue(repository as never)

    await expect(resolveActiveAccount()).resolves.toBeNull()
    expect(repository.getMyAccount).not.toHaveBeenCalled()
  })

  it('fails closed when Supabase returns no composed claims', async () => {
    const client = {
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      },
    }
    const repository = { getMyAccount: vi.fn() }
    vi.mocked(createServerSupabaseClient).mockResolvedValue(client as never)
    vi.mocked(createSupabaseAccountRepository).mockReturnValue(repository as never)

    await expect(resolveActiveAccount()).resolves.toBeNull()
    expect(repository.getMyAccount).not.toHaveBeenCalled()
  })
})
