import { describe, expect, it, vi } from 'vitest'

import { PrivacyServiceError } from '@/lib/server/privacy/service'
import { SecurityServiceError } from '@/lib/security/errors'
import {
  SearchBenchmarkPersistenceError,
} from '@/lib/search-benchmark/errors'
import { createSearchBenchmarkService } from '@/lib/server/search-benchmark/service'

const subjectId = '11111111-1111-4111-8111-111111111111'
const submissionId = '22222222-2222-4222-8222-222222222222'
const receiptId = '33333333-3333-4333-8333-333333333333'
const episodeId = '44444444-4444-4444-8444-444444444444'
const noticeId = '55555555-5555-4555-8555-555555555555'
const idempotencyKey = '66666666-6666-4666-8666-666666666666'
const hash = `\\x${'ab'.repeat(32)}`
const activeSecret = Buffer.alloc(32, 1).toString('base64url')
const previousSecret = Buffer.alloc(32, 2).toString('base64url')

const body = {
  role: 'frontend_developer', sector: 'technology', roleLevel: 'senior',
  experienceBand: '5-8', targetRegion: 'turkiye', employmentType: 'full_time',
  workMode: 'hybrid', isCurrentlyEmployed: true, searchStartedAt: '2026-01',
  searchStatus: 'employment_started', searchEndedAt: '2026-06',
  applicationsCount: 20, humanResponsesCount: 10, anyInterviewsCount: 6,
  hrInterviewsCount: 5, technicalInterviewsCount: 4, offersCount: 2,
  acceptedOffersCount: 1, employmentStartedCount: 1,
  countsAreEstimated: false, locale: 'tr', consentGranted: true,
} as const

function dependencies(options: {
  claimOutcome?: 'claimed' | 'replay'
  actorKind?: 'anonymous' | 'authenticated'
  repositoryError?: SearchBenchmarkPersistenceError
} = {}) {
  const identity = {
    subjectType: 'data_subject' as const,
    subjectHmac: hash,
    operationCode: 'survey.search-benchmark.create',
    idempotencyKeyHmac: hash,
    requestFingerprint: hash,
  }
  const repository = {
    createSearchEpisode: options.repositoryError
      ? vi.fn().mockRejectedValue(options.repositoryError)
      : vi.fn().mockResolvedValue({
          submission_id: submissionId,
          receipt_id: receiptId,
          search_episode_id: episodeId,
        }),
    getCreateResult: vi.fn().mockResolvedValue({
      submission_id: submissionId,
      receipt_id: receiptId,
      search_episode_id: episodeId,
      capability_key_version: options.actorKind === 'authenticated' ? null : 2,
    }),
  }
  const security = {
    consumeQuota: vi.fn().mockResolvedValue({ allowed: true }),
    prepareQuota: vi.fn().mockReturnValue({
      scope: 'survey.single-response', subjectType: 'data_subject',
      subjectHmac: hash, windowStart: '2026-07-18T00:00:00.000Z',
      windowKind: 'accepted_period', limit: 1, counterKind: 'accepted',
      policyVersion: '2026-07-21.v1', policyHash: hash,
      expiresAt: '2026-08-17T00:00:00.000Z', retryAfterSeconds: 100,
    }),
    claimIdempotency: vi.fn().mockResolvedValue({
      identity,
      record: {
        outcome: options.claimOutcome ?? 'claimed',
        record_status: options.claimOutcome === 'replay' ? 'completed' : 'processing',
        resource_type: options.claimOutcome === 'replay' ? 'survey_submission' : null,
        resource_id: options.claimOutcome === 'replay' ? submissionId : null,
        response_code: options.claimOutcome === 'replay' ? 201 : null,
      },
    }),
    failIdempotency: vi.fn().mockResolvedValue(undefined),
  }
  const getCurrentSurveyNotice = vi.fn().mockResolvedValue({ id: noticeId })
  const service = createSearchBenchmarkService({
    repository: repository as never,
    security: security as never,
    getCurrentSurveyNotice,
    capabilityKeys: {
      active: { version: 2, secret: activeSecret },
      previous: { version: 1, secret: previousSecret },
    },
    subjectProofKeys: {
      active: { version: 3, secret: activeSecret }, previous: null,
    },
    now: () => new Date('2026-07-21T12:00:00.000Z'),
  })
  return { service, repository, security, getCurrentSurveyNotice }
}

describe('search benchmark service', () => {
  it('creates one anonymous atomic command with a reproducible capability', async () => {
    const setup = dependencies()
    const input = { actor: { kind: 'anonymous' as const, dataSubjectId: subjectId }, idempotencyKey, body }
    const first = await setup.service.create(input)
    const secondSetup = dependencies()
    const second = await secondSetup.service.create(input)

    expect(first).toEqual(second)
    expect(first).toMatchObject({ receiptId, searchEpisodeId: episodeId, replayed: false })
    expect(first.submissionCapability).toMatch(/^[A-Za-z0-9_-]{43}$/u)
    expect(setup.security.consumeQuota).toHaveBeenCalledWith(
      expect.objectContaining({ windowKind: 'attempt_10m', counter: 'attempt' }),
    )
    expect(setup.repository.createSearchEpisode).toHaveBeenCalledWith(
      expect.objectContaining({
        roleSlug: 'frontend-developer', sectorSlug: 'technology',
        noticeVersionId: noticeId, capabilityKeyVersion: 2,
        consentSubjectProofKeyVersion: 3,
      }),
    )
  })

  it('creates authenticated submissions without a capability', async () => {
    const setup = dependencies({ actorKind: 'authenticated' })
    await expect(setup.service.create({
      actor: { kind: 'authenticated', dataSubjectId: subjectId }, idempotencyKey, body,
    })).resolves.toMatchObject({ submissionCapability: null })
    expect(setup.repository.createSearchEpisode).toHaveBeenCalledWith(
      expect.objectContaining({ capabilityHmac: null, capabilityKeyVersion: null }),
    )
  })

  it('replays the stored result without creating a second snapshot', async () => {
    const setup = dependencies({ claimOutcome: 'replay' })
    await expect(setup.service.create({
      actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
    })).resolves.toMatchObject({ receiptId, replayed: true })
    expect(setup.repository.createSearchEpisode).not.toHaveBeenCalled()
    expect(setup.repository.getCreateResult).toHaveBeenCalledWith({
      submissionId, dataSubjectId: subjectId,
    })
  })

  it.each([
    ['IDEMPOTENCY_CONFLICT', 'SEARCH_BENCHMARK_IDEMPOTENCY_CONFLICT'],
    ['IDEMPOTENCY_IN_PROGRESS', 'SEARCH_BENCHMARK_IDEMPOTENCY_IN_PROGRESS'],
    ['QUOTA_EXCEEDED', 'SEARCH_BENCHMARK_QUOTA_EXCEEDED'],
  ] as const)('maps security failure %s', async (source, target) => {
    const setup = dependencies()
    if (source === 'QUOTA_EXCEEDED') {
      setup.security.consumeQuota.mockRejectedValue(new SecurityServiceError(source, 12))
    } else {
      setup.security.claimIdempotency.mockRejectedValue(new SecurityServiceError(source))
    }
    await expect(setup.service.create({
      actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
    })).rejects.toMatchObject({ code: target })
  })

  it('rejects invalid and future payloads after charging only attempt quota', async () => {
    for (const invalidBody of [{ ...body, consentGranted: false }, { ...body, searchStartedAt: '2026-08', searchEndedAt: '2026-08' }]) {
      const setup = dependencies()
      await expect(setup.service.create({
        actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body: invalidBody,
      })).rejects.toMatchObject({ code: 'SEARCH_BENCHMARK_BODY_INVALID' })
      expect(setup.security.claimIdempotency).not.toHaveBeenCalled()
    }
  })

  it('fails a claimed operation when notice or persistence fails', async () => {
    const noticeSetup = dependencies()
    const failingNotice = vi.fn().mockRejectedValue(new PrivacyServiceError('NOTICE_NOT_FOUND'))
    const noticeService = createSearchBenchmarkService({
      repository: noticeSetup.repository as never,
      security: noticeSetup.security as never,
      getCurrentSurveyNotice: failingNotice,
      capabilityKeys: { active: { version: 2, secret: activeSecret }, previous: null },
      subjectProofKeys: { active: { version: 2, secret: activeSecret }, previous: null },
      now: () => new Date('2026-07-21T12:00:00.000Z'),
    })
    await expect(noticeService.create({
      actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
    })).rejects.toMatchObject({ code: 'SEARCH_BENCHMARK_NOTICE_NOT_FOUND' })
    expect(noticeSetup.security.failIdempotency).toHaveBeenCalledWith(
      expect.objectContaining({ responseCode: 503 }),
    )

    const writeSetup = dependencies({
      repositoryError: new SearchBenchmarkPersistenceError('SEARCH_BENCHMARK_QUOTA_EXCEEDED'),
    })
    await expect(writeSetup.service.create({
      actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
    })).rejects.toMatchObject({ code: 'SEARCH_BENCHMARK_QUOTA_EXCEEDED', retryAfterSeconds: 100 })
    expect(writeSetup.security.failIdempotency).toHaveBeenCalledWith(
      expect.objectContaining({ responseCode: 429 }),
    )
  })

  it('rejects an invalid idempotency key before charging quota', async () => {
    const setup = dependencies()
    await expect(setup.service.create({
      actor: { kind: 'anonymous', dataSubjectId: subjectId },
      idempotencyKey: 'not-a-uuid', body,
    })).rejects.toMatchObject({ code: 'SEARCH_BENCHMARK_BODY_INVALID' })
    expect(setup.security.consumeQuota).not.toHaveBeenCalled()
  })

  it('fails closed for unknown quota and claim errors', async () => {
    const quotaSetup = dependencies()
    quotaSetup.security.consumeQuota.mockRejectedValue(new Error('private'))
    await expect(quotaSetup.service.create({
      actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
    })).rejects.toMatchObject({ code: 'SEARCH_BENCHMARK_WRITE_FAILED' })

    const claimSetup = dependencies()
    claimSetup.security.claimIdempotency.mockRejectedValue(new Error('private'))
    await expect(claimSetup.service.create({
      actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
    })).rejects.toMatchObject({ code: 'SEARCH_BENCHMARK_WRITE_FAILED' })

    const securitySetup = dependencies()
    securitySetup.security.consumeQuota.mockRejectedValue(new SecurityServiceError('QUOTA_POLICY_INVALID'))
    await expect(securitySetup.service.create({
      actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
    })).rejects.toMatchObject({ code: 'SEARCH_BENCHMARK_WRITE_FAILED' })
  })

  it('fails closed for invalid, missing, and failed replay records', async () => {
    const malformedClaim = dependencies({ claimOutcome: 'replay' })
    malformedClaim.security.claimIdempotency.mockResolvedValue({
      identity: malformedClaim.security.claimIdempotency.mock.results,
      record: { outcome: 'replay', resource_type: 'other', resource_id: null },
    } as never)
    await expect(malformedClaim.service.create({
      actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
    })).rejects.toMatchObject({ code: 'SEARCH_BENCHMARK_REPLAY_FAILED' })

    for (const failure of [
      new SearchBenchmarkPersistenceError('SEARCH_BENCHMARK_RESPONSE_INVALID'),
      new Error('private'),
      null,
    ]) {
      const setup = dependencies({ claimOutcome: 'replay' })
      if (failure === null) setup.repository.getCreateResult.mockResolvedValue(null)
      else setup.repository.getCreateResult.mockRejectedValue(failure)
      await expect(setup.service.create({
        actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
      })).rejects.toMatchObject({
        code: failure instanceof SearchBenchmarkPersistenceError
          ? 'SEARCH_BENCHMARK_RESPONSE_INVALID'
          : 'SEARCH_BENCHMARK_REPLAY_FAILED',
      })
    }
  })

  it('replays authenticated results and supports the previous capability key', async () => {
    const authenticated = dependencies({ claimOutcome: 'replay', actorKind: 'authenticated' })
    await expect(authenticated.service.create({
      actor: { kind: 'authenticated', dataSubjectId: subjectId }, idempotencyKey, body,
    })).resolves.toMatchObject({ submissionCapability: null })

    const previous = dependencies({ claimOutcome: 'replay' })
    previous.repository.getCreateResult.mockResolvedValue({
      submission_id: submissionId, receipt_id: receiptId,
      search_episode_id: episodeId, capability_key_version: 1,
    })
    await expect(previous.service.create({
      actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
    })).resolves.toMatchObject({ replayed: true })

    previous.repository.getCreateResult.mockResolvedValue({
      submission_id: submissionId, receipt_id: receiptId,
      search_episode_id: episodeId, capability_key_version: 99,
    })
    await expect(previous.service.create({
      actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
    })).rejects.toMatchObject({ code: 'SEARCH_BENCHMARK_REPLAY_FAILED' })

    previous.repository.getCreateResult.mockResolvedValue({
      submission_id: submissionId, receipt_id: receiptId,
      search_episode_id: episodeId, capability_key_version: null,
    })
    await expect(previous.service.create({
      actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
    })).rejects.toMatchObject({ code: 'SEARCH_BENCHMARK_REPLAY_FAILED' })
  })

  it('fails and releases a claim when quota preparation or notice reading fails', async () => {
    for (const failure of [new SecurityServiceError('QUOTA_POLICY_INVALID'), new Error('private')]) {
      const setup = dependencies()
      setup.security.prepareQuota.mockImplementation(() => { throw failure })
      await expect(setup.service.create({
        actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
      })).rejects.toMatchObject({ code: 'SEARCH_BENCHMARK_WRITE_FAILED' })
      expect(setup.security.failIdempotency).toHaveBeenCalled()
    }

    const notice = dependencies()
    notice.getCurrentSurveyNotice.mockRejectedValue(new Error('private'))
    await expect(notice.service.create({
      actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
    })).rejects.toMatchObject({ code: 'SEARCH_BENCHMARK_NOTICE_READ_FAILED' })
  })

  it.each([
    ['SEARCH_BENCHMARK_CATALOG_INVALID', 422],
    ['SEARCH_BENCHMARK_BODY_INVALID', 422],
    ['SEARCH_BENCHMARK_DUPLICATE', 409],
    ['SEARCH_BENCHMARK_NOTICE_NOT_FOUND', 503],
    ['SEARCH_BENCHMARK_WRITE_FAILED', 500],
  ] as const)('maps persistence error %s and releases the claim with %s', async (code, responseCode) => {
    const setup = dependencies({
      repositoryError: new SearchBenchmarkPersistenceError(code),
    })
    await expect(setup.service.create({
      actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
    })).rejects.toMatchObject({ code })
    expect(setup.security.failIdempotency).toHaveBeenCalledWith(
      expect.objectContaining({ responseCode }),
    )
  })

  it('maps malformed and unknown persistence responses without masking the primary error', async () => {
    const malformed = dependencies()
    malformed.repository.createSearchEpisode.mockResolvedValue({})
    malformed.security.failIdempotency.mockRejectedValue(new Error('cleanup'))
    await expect(malformed.service.create({
      actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
    })).rejects.toMatchObject({ code: 'SEARCH_BENCHMARK_RESPONSE_INVALID' })

    const unknown = dependencies()
    unknown.repository.createSearchEpisode.mockRejectedValue(new Error('private'))
    await expect(unknown.service.create({
      actor: { kind: 'anonymous', dataSubjectId: subjectId }, idempotencyKey, body,
    })).rejects.toMatchObject({ code: 'SEARCH_BENCHMARK_WRITE_FAILED' })
  })

  it('normalizes nullable optional fields and uses the system clock by default', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-21T12:00:00.000Z'))
    const setup = dependencies()
    const service = createSearchBenchmarkService({
      repository: setup.repository as never,
      security: setup.security as never,
      getCurrentSurveyNotice: setup.getCurrentSurveyNotice,
      capabilityKeys: { active: { version: 2, secret: activeSecret }, previous: null },
      subjectProofKeys: { active: { version: 3, secret: activeSecret }, previous: null },
    })
    const ongoingBody = {
      ...body, sector: null, employmentType: null, workMode: null,
      searchStatus: 'ongoing' as const, searchEndedAt: null,
      acceptedOffersCount: 0, employmentStartedCount: 0,
    }
    await service.create({
      actor: { kind: 'authenticated', dataSubjectId: subjectId },
      idempotencyKey, body: ongoingBody,
    })
    expect(setup.repository.createSearchEpisode).toHaveBeenCalledWith(
      expect.objectContaining({ sectorSlug: null, endedMonth: null, observedThrough: '2026-07-21' }),
    )
    vi.useRealTimers()
  })
})
