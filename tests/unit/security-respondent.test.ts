import { beforeEach, describe, expect, it, vi } from 'vitest'

import { cookies as nextCookies } from 'next/headers'

import { getServerSecurityEnvironment } from '@/lib/env/server'
import {
  RESPONDENT_COOKIE_NAME,
  resolveAnonymousRespondent,
} from '@/lib/server/security/respondent'
import type { SecurityRepository } from '@/lib/server/security/repository'
import { createSupabaseSecurityRepository } from '@/lib/server/security/repository'

vi.mock('next/headers', () => ({ cookies: vi.fn() }))

vi.mock('@/lib/env/server', () => ({
  getServerSecurityEnvironment: vi.fn(),
}))

vi.mock('@/lib/server/security/repository', () => ({
  createSupabaseSecurityRepository: vi.fn(),
}))

const dataSubjectId = '11111111-1111-4111-8111-111111111111'
const activeSecret = Buffer.alloc(32, 1).toString('base64url')
const previousSecret = Buffer.alloc(32, 2).toString('base64url')

function cookieStore(value?: string) {
  return {
    get: vi.fn().mockReturnValue(value ? { value } : undefined),
    set: vi.fn(),
  }
}

function repository(record = {
  data_subject_id: dataSubjectId,
  created: false,
  key_rotated: false,
}): SecurityRepository {
  return {
    resolveAnonymousSubject: vi.fn().mockResolvedValue(record),
    consumeQuota: vi.fn(),
    claimIdempotency: vi.fn(),
    completeIdempotency: vi.fn(),
    failIdempotency: vi.fn(),
  }
}

beforeEach(() => {
  vi.mocked(getServerSecurityEnvironment).mockReturnValue({
    respondentKeys: {
      active: { version: 2, secret: activeSecret },
      previous: { version: 1, secret: previousSecret },
    },
    quotaSubjectKey: activeSecret,
    idempotencyKey: previousSecret,
  })
})

describe('anonymous respondent resolution', () => {
  it('issues a hardened 256-bit cookie for a new respondent', async () => {
    const cookies = cookieStore()
    const repo = repository({
      data_subject_id: dataSubjectId,
      created: true,
      key_rotated: false,
    })

    await expect(
      resolveAnonymousRespondent({
        cookieStore: cookies,
        repository: repo,
        production: true,
      }),
    ).resolves.toEqual({
      dataSubjectId,
      created: true,
      keyRotated: false,
    })
    expect(cookies.set).toHaveBeenCalledWith(
      RESPONDENT_COOKIE_NAME,
      expect.stringMatching(/^[A-Za-z0-9_-]{43}$/u),
      {
        httpOnly: true,
        maxAge: 15_552_000,
        path: '/',
        sameSite: 'lax',
        secure: true,
      },
    )
    expect(repo.resolveAnonymousSubject).toHaveBeenCalledWith(
      expect.objectContaining({ activeKeyVersion: 2, previousKeyVersion: 1 }),
    )
  })

  it('keeps a valid current cookie and reissues it after key rotation', async () => {
    const token = Buffer.alloc(32, 9).toString('base64url')
    const stableCookies = cookieStore(token)
    await resolveAnonymousRespondent({
      cookieStore: stableCookies,
      repository: repository(),
      production: false,
    })
    expect(stableCookies.set).not.toHaveBeenCalled()

    const rotatedCookies = cookieStore(token)
    await resolveAnonymousRespondent({
      cookieStore: rotatedCookies,
      repository: repository({
        data_subject_id: dataSubjectId,
        created: false,
        key_rotated: true,
      }),
      production: false,
    })
    expect(rotatedCookies.set).toHaveBeenCalledWith(
      RESPONDENT_COOKIE_NAME,
      token,
      expect.objectContaining({ secure: false }),
    )
  })

  it('uses the default server dependencies and production environment', async () => {
    const cookies = cookieStore()
    const repo = repository()
    vi.mocked(nextCookies).mockResolvedValue(cookies as never)
    vi.mocked(createSupabaseSecurityRepository).mockReturnValue(repo)
    vi.mocked(getServerSecurityEnvironment).mockReturnValue({
      respondentKeys: {
        active: { version: 2, secret: activeSecret },
        previous: null,
      },
      quotaSubjectKey: activeSecret,
      idempotencyKey: previousSecret,
    })
    vi.stubEnv('NODE_ENV', 'production')

    await resolveAnonymousRespondent()

    expect(createSupabaseSecurityRepository).toHaveBeenCalledOnce()
    expect(cookies.set).toHaveBeenCalledWith(
      RESPONDENT_COOKIE_NAME,
      expect.any(String),
      expect.objectContaining({ secure: true }),
    )
    expect(repo.resolveAnonymousSubject).toHaveBeenCalledWith(
      expect.objectContaining({
        previousHmac: null,
        previousKeyVersion: null,
      }),
    )
    vi.unstubAllEnvs()
  })

  it('reissues a valid cookie when the persisted identity was newly created', async () => {
    const token = Buffer.alloc(32, 8).toString('base64url')
    const cookies = cookieStore(token)

    await resolveAnonymousRespondent({
      cookieStore: cookies,
      repository: repository({
        data_subject_id: dataSubjectId,
        created: true,
        key_rotated: false,
      }),
      production: false,
    })

    expect(cookies.set).toHaveBeenCalled()
  })

  it('replaces malformed cookies and hides persistence errors', async () => {
    const malformedCookies = cookieStore('not-a-valid-token')
    await resolveAnonymousRespondent({
      cookieStore: malformedCookies,
      repository: repository(),
      production: false,
    })
    expect(malformedCookies.set).toHaveBeenCalled()

    const failing = repository()
    vi.mocked(failing.resolveAnonymousSubject).mockRejectedValue(new Error('db'))
    await expect(
      resolveAnonymousRespondent({
        cookieStore: cookieStore(),
        repository: failing,
      }),
    ).rejects.toMatchObject({ code: 'ANONYMOUS_SUBJECT_RESOLUTION_FAILED' })
  })
})
