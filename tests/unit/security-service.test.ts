import { describe, expect, it, vi } from 'vitest'

import {
  SecurityPersistenceError,
  SecurityServiceError,
} from '@/lib/security/errors'
import { createSecurityService } from '@/lib/server/security/service'
import type { SecurityRepository } from '@/lib/server/security/repository'

const subjectId = '11111111-1111-4111-8111-111111111111'
const resourceId = '22222222-2222-4222-8222-222222222222'
const secret = Buffer.alloc(32, 3).toString('base64url')

function repository(overrides: Partial<SecurityRepository> = {}): SecurityRepository {
  return {
    resolveAnonymousSubject: vi.fn(),
    consumeQuota: vi.fn().mockResolvedValue({
      allowed: true,
      current_count: 1,
      remaining: 2,
    }),
    claimIdempotency: vi.fn().mockResolvedValue({
      outcome: 'claimed',
      record_status: 'processing',
      resource_type: null,
      resource_id: null,
      response_code: null,
    }),
    completeIdempotency: vi.fn().mockResolvedValue(undefined),
    failIdempotency: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

function service(repo: SecurityRepository) {
  return createSecurityService({
    repository: repo,
    quotaSubjectKey: secret,
    idempotencyKey: secret,
  })
}

describe('security service', () => {
  it('uses the versioned quota policy and deterministic UTC window', async () => {
    const repo = repository()
    await expect(
      service(repo).consumeQuota({
        policy: 'repeatableExperience',
        windowKind: 'accepted_24h',
        counter: 'accepted',
        subjectId,
        now: new Date('2026-07-21T12:34:56.000Z'),
      }),
    ).resolves.toEqual({ allowed: true, current_count: 1, remaining: 2 })

    expect(repo.consumeQuota).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: 'experience.repeatable',
        limit: 3,
        policyVersion: '2026-07-21.v1',
        windowStart: '2026-07-21T00:00:00.000Z',
        expiresAt: '2026-07-22T00:00:00.000Z',
      }),
    )
  })

  it('returns a bounded Retry-After when quota is exhausted', async () => {
    const repo = repository({
      consumeQuota: vi.fn().mockResolvedValue({
        allowed: false,
        current_count: 3,
        remaining: 0,
      }),
    })

    await expect(
      service(repo).consumeQuota({
        policy: 'repeatableExperience',
        windowKind: 'accepted_24h',
        counter: 'accepted',
        subjectId,
        now: new Date('2026-07-21T23:59:59.500Z'),
      }),
    ).rejects.toMatchObject({
      code: 'QUOTA_EXCEEDED',
      retryAfterSeconds: 1,
    })
  })

  it('rejects unknown policy windows and maps persistence failures', async () => {
    await expect(
      service(repository()).consumeQuota({
        policy: 'missing',
        windowKind: 'accepted_24h',
        counter: 'accepted',
        subjectId,
      }),
    ).rejects.toMatchObject({ code: 'QUOTA_POLICY_INVALID' })

    for (const failure of [
      new SecurityPersistenceError('IDEMPOTENCY_STATE_INVALID'),
      new Error('database unavailable'),
    ]) {
      await expect(
        service(
          repository({ consumeQuota: vi.fn().mockRejectedValue(failure) }),
        ).consumeQuota({
          policy: 'repeatableExperience',
          windowKind: 'accepted_24h',
          counter: 'accepted',
          subjectId,
        }),
      ).rejects.toMatchObject({
        code:
          failure instanceof SecurityPersistenceError
            ? 'IDEMPOTENCY_STATE_INVALID'
            : 'SECURITY_WRITE_FAILED',
      })
    }
  })

  it('claims, completes and fails an idempotent operation', async () => {
    const repo = repository()
    const security = service(repo)
    const claimed = await security.claimIdempotency({
      subjectType: 'data_subject',
      subjectId,
      operationCode: 'experience.submit',
      idempotencyKey: '0123456789abcdef',
      requestBody: { z: 2, a: 1 },
      ttlSeconds: 3600,
      now: new Date('2026-07-21T10:00:00.000Z'),
    })

    expect(claimed.identity.requestFingerprint).toMatch(/^\\x[0-9a-f]{64}$/u)
    expect(repo.claimIdempotency).toHaveBeenCalledWith(
      expect.objectContaining({ expiresAt: '2026-07-21T11:00:00.000Z' }),
    )
    await security.completeIdempotency({
      claim: claimed.identity,
      resourceType: 'experience',
      resourceId,
      responseCode: 201,
    })
    await security.failIdempotency({ claim: claimed.identity, responseCode: 500 })
    expect(repo.completeIdempotency).toHaveBeenCalledOnce()
    expect(repo.failIdempotency).toHaveBeenCalledOnce()
  })

  it.each([
    ['conflict', 'IDEMPOTENCY_CONFLICT'],
    ['in_progress', 'IDEMPOTENCY_IN_PROGRESS'],
  ] as const)('maps the %s claim outcome', async (outcome, code) => {
    const repo = repository({
      claimIdempotency: vi.fn().mockResolvedValue({
        outcome,
        record_status: 'processing',
        resource_type: null,
        resource_id: null,
        response_code: null,
      }),
    })

    await expect(
      service(repo).claimIdempotency({
        subjectType: 'data_subject',
        subjectId,
        operationCode: 'experience.submit',
        idempotencyKey: '0123456789abcdef',
        requestBody: {},
        ttlSeconds: 60,
      }),
    ).rejects.toEqual(new SecurityServiceError(code))
  })

  it('maps idempotency write failures', async () => {
    const failure = new SecurityPersistenceError('IDEMPOTENCY_STATE_INVALID')
    const repo = repository({
      claimIdempotency: vi.fn().mockRejectedValue(new Error('down')),
      completeIdempotency: vi.fn().mockRejectedValue(failure),
      failIdempotency: vi.fn().mockRejectedValue(failure),
    })
    const security = service(repo)
    const claim = {
      subjectType: 'data_subject' as const,
      subjectHmac: '\\x'.concat('1'.repeat(64)),
      operationCode: 'experience.submit',
      idempotencyKeyHmac: '\\x'.concat('2'.repeat(64)),
      requestFingerprint: '\\x'.concat('3'.repeat(64)),
    }

    await expect(
      security.claimIdempotency({
        subjectType: 'data_subject', subjectId,
        operationCode: 'experience.submit', idempotencyKey: '0123456789abcdef',
        requestBody: {}, ttlSeconds: 60,
      }),
    ).rejects.toMatchObject({ code: 'SECURITY_WRITE_FAILED' })
    await expect(
      security.completeIdempotency({
        claim, resourceType: 'experience', resourceId, responseCode: 201,
      }),
    ).rejects.toMatchObject({ code: 'IDEMPOTENCY_STATE_INVALID' })
    await expect(
      security.failIdempotency({ claim, responseCode: 500 }),
    ).rejects.toMatchObject({ code: 'IDEMPOTENCY_STATE_INVALID' })
  })
})
