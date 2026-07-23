import { describe, expect, it, vi } from 'vitest'

import {
  CompanyExperiencePersistenceError,
} from '@/lib/company-experience/errors'
import { createCompanyExperienceService } from '@/lib/server/company-experience/service'
import { PrivacyServiceError } from '@/lib/server/privacy/service'
import { SecurityServiceError } from '@/lib/security/errors'

const subjectId = '11111111-1111-4111-8111-111111111111'
const submissionId = '22222222-2222-4222-8222-222222222222'
const receiptId = '33333333-3333-4333-8333-333333333333'
const experienceId = '44444444-4444-4444-8444-444444444444'
const applicationId = '77777777-7777-4777-8777-777777777777'
const noticeId = '55555555-5555-4555-8555-555555555555'
const idempotencyKey = '66666666-6666-4666-8666-666666666666'
const hash = `\\x${'ab'.repeat(32)}`
const activeSecret = Buffer.alloc(32, 1).toString('base64url')
const previousSecret = Buffer.alloc(32, 2).toString('base64url')

const body = {
  companyName: 'Example Corp', appliedRole: 'Frontend Developer', processYear: 2026,
  promisedTimeline: 'yes', promisedDays: 7, actualDays: 10,
  wasGhosted: false, ghostedAfterStage: null, interviewerPrepared: 4,
  wasAskedIrrelevant: true, irrelevantTypes: ['age', 'age'],
  rejectionShared: 'yes_detailed', feedbackUseful: 4,
  processTransparency: 3, hrProfessionalism: 4,
  wouldRecommendProcess: 'unsure', freeNote: '', locale: 'tr',
  consentGranted: true,
  applicationMonth: '2026-07', applicationChannel: 'linkedin',
  hadReferral: false, lastStage: 'technical', currentOutcome: 'interviewing',
  outcomeMonth: null, plannedStartMonth: null,
} as const

function dependencies(options: {
  claimOutcome?: 'claimed' | 'replay'
  actorKind?: 'anonymous' | 'authenticated'
  repositoryError?: CompanyExperiencePersistenceError | Error
} = {}) {
  const identity = {
    subjectType: 'data_subject' as const, subjectHmac: hash,
    operationCode: 'survey.company-experience.create',
    idempotencyKeyHmac: hash, requestFingerprint: hash,
  }
  const repository = {
    createCompanyExperience: options.repositoryError
      ? vi.fn().mockRejectedValue(options.repositoryError)
      : vi.fn().mockResolvedValue({
          submission_id: submissionId, receipt_id: receiptId,
          company_experience_id: experienceId,
          job_application_id: applicationId,
        }),
    getCreateResult: vi.fn().mockResolvedValue({
      submission_id: submissionId, receipt_id: receiptId,
      company_experience_id: experienceId,
      job_application_id: applicationId,
      capability_key_version: options.actorKind === 'authenticated' ? null : 2,
    }),
  }
  const quota = (windowKind: string) => ({
    scope: 'experience.repeatable', subjectType: 'data_subject', subjectHmac: hash,
    windowStart: windowKind === 'accepted_24h'
      ? '2026-07-21T00:00:00.000Z' : '2026-07-01T00:00:00.000Z',
    windowKind, limit: windowKind === 'accepted_24h' ? 3 : 10,
    counterKind: 'accepted', policyVersion: '2026-07-21.v1', policyHash: hash,
    expiresAt: windowKind === 'accepted_24h'
      ? '2026-07-22T00:00:00.000Z' : '2026-07-31T00:00:00.000Z',
    retryAfterSeconds: windowKind === 'accepted_24h' ? 100 : 1000,
  })
  const security = {
    prepareQuota: vi.fn(({ windowKind }) => quota(windowKind)),
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
  const service = createCompanyExperienceService({
    repository: repository as never,
    security: security as never,
    getCurrentSurveyNotice,
    capabilityKeys: {
      active: { version: 2, secret: activeSecret },
      previous: { version: 1, secret: previousSecret },
    },
    subjectProofKeys: { active: { version: 3, secret: activeSecret }, previous: null },
    now: () => new Date('2026-07-21T12:00:00.000Z'),
  })
  return { service, repository, security, getCurrentSurveyNotice }
}

const anonymousInput = {
  actor: { kind: 'anonymous' as const, dataSubjectId: subjectId },
  idempotencyKey, body,
}

describe('company experience service', () => {
  it('creates one anonymous atomic command with both quotas and capability', async () => {
    const setup = dependencies()
    const first = await setup.service.create(anonymousInput)
    const second = await dependencies().service.create(anonymousInput)
    expect(first).toEqual(second)
    expect(first).toMatchObject({
      receiptId, companyExperienceId: experienceId,
      jobApplicationId: applicationId, replayed: false,
    })
    expect(first.submissionCapability).toMatch(/^[A-Za-z0-9_-]{43}$/u)
    expect(setup.security.prepareQuota).toHaveBeenCalledTimes(2)
    expect(setup.repository.createCompanyExperience).toHaveBeenCalledWith(
      expect.objectContaining({
        quota24hLimit: 3, quota30dLimit: 10, capabilityKeyVersion: 2,
        consentSubjectProofKeyVersion: 3, irrelevantTypes: ['age'], freeNote: null,
      }),
    )
  })

  it('creates authenticated contributions without a capability', async () => {
    const setup = dependencies({ actorKind: 'authenticated' })
    await expect(setup.service.create({
      ...anonymousInput, actor: { kind: 'authenticated', dataSubjectId: subjectId },
    })).resolves.toMatchObject({ submissionCapability: null })
    expect(setup.repository.createCompanyExperience).toHaveBeenCalledWith(
      expect.objectContaining({ capabilityHmac: null, capabilityKeyVersion: null }),
    )
  })

  it('replays anonymous, authenticated, and previous-key results', async () => {
    const anonymous = dependencies({ claimOutcome: 'replay' })
    await expect(anonymous.service.create(anonymousInput)).resolves.toMatchObject({ replayed: true })
    expect(anonymous.repository.createCompanyExperience).not.toHaveBeenCalled()

    const authenticated = dependencies({ claimOutcome: 'replay', actorKind: 'authenticated' })
    await expect(authenticated.service.create({
      ...anonymousInput, actor: { kind: 'authenticated', dataSubjectId: subjectId },
    })).resolves.toMatchObject({ submissionCapability: null })

    const previous = dependencies({ claimOutcome: 'replay' })
    previous.repository.getCreateResult.mockResolvedValue({
      submission_id: submissionId, receipt_id: receiptId,
      company_experience_id: experienceId, capability_key_version: 1,
      job_application_id: applicationId,
    })
    await expect(previous.service.create(anonymousInput)).resolves.toMatchObject({ replayed: true })
  })

  it('rejects malformed idempotency, payloads, and future years before claiming', async () => {
    for (const input of [
      { ...anonymousInput, idempotencyKey: 'bad' },
      { ...anonymousInput, body: { ...body, consentGranted: false } },
      { ...anonymousInput, body: { ...body, processYear: 2027 } },
    ]) {
      const setup = dependencies()
      await expect(setup.service.create(input)).rejects.toMatchObject({
        code: 'COMPANY_EXPERIENCE_BODY_INVALID',
      })
      expect(setup.security.claimIdempotency).not.toHaveBeenCalled()
    }
  })

  it.each([
    ['IDEMPOTENCY_CONFLICT', 'COMPANY_EXPERIENCE_IDEMPOTENCY_CONFLICT'],
    ['IDEMPOTENCY_IN_PROGRESS', 'COMPANY_EXPERIENCE_IDEMPOTENCY_IN_PROGRESS'],
    ['QUOTA_POLICY_INVALID', 'COMPANY_EXPERIENCE_WRITE_FAILED'],
  ] as const)('maps security failure %s', async (source, target) => {
    const setup = dependencies()
    setup.security.claimIdempotency.mockRejectedValue(new SecurityServiceError(source))
    await expect(setup.service.create(anonymousInput)).rejects.toMatchObject({ code: target })
  })

  it('fails closed for unknown claims and quota preparation', async () => {
    const claim = dependencies()
    claim.security.claimIdempotency.mockRejectedValue(new Error('private'))
    await expect(claim.service.create(anonymousInput)).rejects.toMatchObject({
      code: 'COMPANY_EXPERIENCE_WRITE_FAILED',
    })

    for (const failure of [new SecurityServiceError('QUOTA_POLICY_INVALID'), new Error('private')]) {
      const setup = dependencies()
      setup.security.prepareQuota.mockImplementation(() => { throw failure })
      await expect(setup.service.create(anonymousInput)).rejects.toMatchObject({
        code: 'COMPANY_EXPERIENCE_WRITE_FAILED',
      })
      expect(setup.security.failIdempotency).toHaveBeenCalled()
    }
  })

  it('maps missing and failed notices while releasing the claim', async () => {
    const missing = dependencies()
    missing.getCurrentSurveyNotice.mockRejectedValue(new PrivacyServiceError('NOTICE_NOT_FOUND'))
    await expect(missing.service.create(anonymousInput)).rejects.toMatchObject({
      code: 'COMPANY_EXPERIENCE_NOTICE_NOT_FOUND',
    })
    const failed = dependencies()
    failed.getCurrentSurveyNotice.mockRejectedValue(new Error('private'))
    await expect(failed.service.create(anonymousInput)).rejects.toMatchObject({
      code: 'COMPANY_EXPERIENCE_NOTICE_READ_FAILED',
    })
  })

  it('fails closed for malformed, missing, failed, and invalid-key replays', async () => {
    const malformedClaim = dependencies({ claimOutcome: 'replay' })
    malformedClaim.security.claimIdempotency.mockResolvedValue({
      identity: {}, record: { outcome: 'replay', resource_type: 'other', resource_id: null },
    } as never)
    await expect(malformedClaim.service.create(anonymousInput)).rejects.toMatchObject({
      code: 'COMPANY_EXPERIENCE_REPLAY_FAILED',
    })

    for (const failure of [
      new CompanyExperiencePersistenceError('COMPANY_EXPERIENCE_RESPONSE_INVALID'),
      new Error('private'), null,
    ]) {
      const setup = dependencies({ claimOutcome: 'replay' })
      if (failure === null) setup.repository.getCreateResult.mockResolvedValue(null)
      else setup.repository.getCreateResult.mockRejectedValue(failure)
      await expect(setup.service.create(anonymousInput)).rejects.toMatchObject({
        code: failure instanceof CompanyExperiencePersistenceError
          ? 'COMPANY_EXPERIENCE_RESPONSE_INVALID' : 'COMPANY_EXPERIENCE_REPLAY_FAILED',
      })
    }

    for (const capability_key_version of [99, null]) {
      const setup = dependencies({ claimOutcome: 'replay' })
      setup.repository.getCreateResult.mockResolvedValue({
        submission_id: submissionId, receipt_id: receiptId,
        company_experience_id: experienceId, capability_key_version,
      })
      await expect(setup.service.create(anonymousInput)).rejects.toMatchObject({
        code: 'COMPANY_EXPERIENCE_REPLAY_FAILED',
      })
    }
  })

  it.each([
    ['COMPANY_EXPERIENCE_BODY_INVALID', 422],
    ['COMPANY_EXPERIENCE_DUPLICATE', 409],
    ['COMPANY_EXPERIENCE_NOTICE_NOT_FOUND', 503],
    ['COMPANY_EXPERIENCE_WRITE_FAILED', 500],
  ] as const)('maps persistence %s and releases the claim', async (code, responseCode) => {
    const setup = dependencies({
      repositoryError: new CompanyExperiencePersistenceError(code),
    })
    await expect(setup.service.create(anonymousInput)).rejects.toMatchObject({ code })
    expect(setup.security.failIdempotency).toHaveBeenCalledWith(
      expect.objectContaining({ responseCode }),
    )
  })

  it('maps quota, malformed response, unknown write, and cleanup failure', async () => {
    const quota = dependencies({
      repositoryError: new CompanyExperiencePersistenceError('COMPANY_EXPERIENCE_QUOTA_EXCEEDED'),
    })
    await expect(quota.service.create(anonymousInput)).rejects.toMatchObject({
      code: 'COMPANY_EXPERIENCE_QUOTA_EXCEEDED', retryAfterSeconds: 1000,
    })

    const malformed = dependencies()
    malformed.repository.createCompanyExperience.mockResolvedValue({})
    malformed.security.failIdempotency.mockRejectedValue(new Error('cleanup'))
    await expect(malformed.service.create(anonymousInput)).rejects.toMatchObject({
      code: 'COMPANY_EXPERIENCE_RESPONSE_INVALID',
    })

    const unknown = dependencies({ repositoryError: new Error('private') })
    await expect(unknown.service.create(anonymousInput)).rejects.toMatchObject({
      code: 'COMPANY_EXPERIENCE_WRITE_FAILED',
    })
  })

  it('uses the system clock by default', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-21T12:00:00.000Z'))
    const setup = dependencies({ actorKind: 'authenticated' })
    const service = createCompanyExperienceService({
      repository: setup.repository as never, security: setup.security as never,
      getCurrentSurveyNotice: setup.getCurrentSurveyNotice,
      capabilityKeys: { active: { version: 2, secret: activeSecret }, previous: null },
      subjectProofKeys: { active: { version: 3, secret: activeSecret }, previous: null },
    })
    await service.create({
      ...anonymousInput, actor: { kind: 'authenticated', dataSubjectId: subjectId },
    })
    expect(setup.repository.createCompanyExperience).toHaveBeenCalled()
    vi.useRealTimers()
  })
})
