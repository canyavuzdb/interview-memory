import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SecurityPersistenceError } from '@/lib/security/errors'
import { createSupabaseSecurityRepository } from '@/lib/server/security/repository'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: vi.fn(),
}))

const rpc = vi.fn()
const hash = '\\x'.concat('a'.repeat(64))
const id = '11111111-1111-4111-8111-111111111111'
const identity = {
  subjectType: 'data_subject' as const,
  subjectHmac: hash,
  operationCode: 'experience.submit',
  idempotencyKeyHmac: hash,
  requestFingerprint: hash,
}

beforeEach(() => {
  rpc.mockReset()
  vi.mocked(createAdminSupabaseClient).mockReturnValue({ rpc } as never)
})

describe('Supabase security repository', () => {
  it('calls the narrow security RPC contracts', async () => {
    rpc
      .mockResolvedValueOnce({
        data: [{ data_subject_id: id, created: true, key_rotated: false }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{ allowed: true, current_count: 1, remaining: 2 }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{
          outcome: 'claimed', record_status: 'processing',
          resource_type: null, resource_id: null, response_code: null,
        }],
        error: null,
      })
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: true, error: null })
    const repository = createSupabaseSecurityRepository()

    await expect(repository.resolveAnonymousSubject({
      activeHmac: hash, activeKeyVersion: 2,
      previousHmac: null, previousKeyVersion: null,
    })).resolves.toMatchObject({ data_subject_id: id, created: true })
    await expect(repository.consumeQuota({
      scope: 'experience.repeatable', subjectType: 'data_subject',
      subjectHmac: hash, windowStart: '2026-07-21T00:00:00.000Z',
      windowKind: 'accepted_24h', limit: 3, counterKind: 'accepted',
      policyVersion: '2026-07-21.v1', policyHash: hash,
      expiresAt: '2026-07-22T00:00:00.000Z',
    })).resolves.toEqual({ allowed: true, current_count: 1, remaining: 2 })
    await expect(repository.claimIdempotency({
      ...identity, expiresAt: '2026-07-22T00:00:00.000Z',
    })).resolves.toMatchObject({ outcome: 'claimed' })
    await expect(repository.completeIdempotency({
      ...identity, resourceType: 'experience', resourceId: id, responseCode: 201,
    })).resolves.toBeUndefined()
    await expect(repository.failIdempotency({
      ...identity, responseCode: 500,
    })).resolves.toBeUndefined()
    expect(rpc).toHaveBeenCalledTimes(5)
  })

  it('rejects malformed hashes before database access', async () => {
    const repository = createSupabaseSecurityRepository()
    await expect(repository.resolveAnonymousSubject({
      activeHmac: 'raw-value', activeKeyVersion: 1,
      previousHmac: null, previousKeyVersion: null,
    })).rejects.toEqual(new SecurityPersistenceError('SECURITY_WRITE_FAILED'))
    expect(rpc).not.toHaveBeenCalled()
  })

  it('maps RPC and response failures to stable persistence errors', async () => {
    rpc
      .mockResolvedValueOnce({ data: null, error: { message: 'private' } })
      .mockResolvedValueOnce({ data: [{}], error: null })
      .mockResolvedValueOnce({ data: false, error: null })
      .mockResolvedValueOnce({ data: true, error: { message: 'private' } })
    const repository = createSupabaseSecurityRepository()

    await expect(repository.resolveAnonymousSubject({
      activeHmac: hash, activeKeyVersion: 1,
      previousHmac: hash, previousKeyVersion: 0,
    })).rejects.toMatchObject({ code: 'ANONYMOUS_SUBJECT_RESOLUTION_FAILED' })
    await expect(repository.consumeQuota({
      scope: 'experience.repeatable', subjectType: 'data_subject',
      subjectHmac: hash, windowStart: '2026-07-21T00:00:00.000Z',
      windowKind: 'accepted_24h', limit: 3, counterKind: 'accepted',
      policyVersion: 'v1', policyHash: hash,
      expiresAt: '2026-07-22T00:00:00.000Z',
    })).rejects.toMatchObject({ code: 'SECURITY_RESPONSE_INVALID' })
    await expect(repository.completeIdempotency({
      ...identity, resourceType: 'experience', resourceId: id, responseCode: 201,
    })).rejects.toMatchObject({ code: 'IDEMPOTENCY_STATE_INVALID' })
    await expect(repository.failIdempotency({
      ...identity, responseCode: 500,
    })).rejects.toMatchObject({ code: 'IDEMPOTENCY_STATE_INVALID' })
  })

  it('covers invalid and failed quota and idempotency responses', async () => {
    rpc
      .mockResolvedValueOnce({ data: [{}], error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'private' } })
      .mockResolvedValueOnce({ data: null, error: { message: 'private' } })
      .mockResolvedValueOnce({ data: [{}], error: null })
    const repository = createSupabaseSecurityRepository()

    await expect(repository.resolveAnonymousSubject({
      activeHmac: hash, activeKeyVersion: 1,
      previousHmac: null, previousKeyVersion: null,
    })).rejects.toMatchObject({ code: 'SECURITY_RESPONSE_INVALID' })
    const quota = {
      scope: 'experience.repeatable', subjectType: 'data_subject' as const,
      subjectHmac: hash, windowStart: '2026-07-21T00:00:00.000Z',
      windowKind: 'accepted_24h', limit: 3, counterKind: 'accepted' as const,
      policyVersion: 'v1', policyHash: hash,
      expiresAt: '2026-07-22T00:00:00.000Z',
    }
    await expect(repository.consumeQuota(quota)).rejects.toMatchObject({
      code: 'SECURITY_WRITE_FAILED',
    })
    await expect(repository.claimIdempotency({
      ...identity, expiresAt: '2026-07-22T00:00:00.000Z',
    })).rejects.toMatchObject({ code: 'SECURITY_WRITE_FAILED' })
    await expect(repository.claimIdempotency({
      ...identity, expiresAt: '2026-07-22T00:00:00.000Z',
    })).rejects.toMatchObject({ code: 'SECURITY_RESPONSE_INVALID' })
  })
})
