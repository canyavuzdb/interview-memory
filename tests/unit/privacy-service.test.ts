import { describe, expect, it, vi } from 'vitest'

import {
  createPrivacyService,
  PrivacyServiceError,
  type PrivacyRepository,
} from '@/lib/server/privacy/service'
import { PrivacyPersistenceError } from '@/lib/privacy/errors'

const timestamp = '2026-07-18T12:00:00.000Z'
const userId = '11111111-1111-4111-8111-111111111111'
const noticeId = '22222222-2222-4222-8222-222222222222'
const eventId = '33333333-3333-4333-8333-333333333333'
const idempotencyKey = '44444444-4444-4444-8444-444444444444'
const sha256Bytea = `\\x${'ab'.repeat(32)}`
const trustedActor = {
  authUserId: userId,
  eventSource: 'survey',
  subjectProofHmac: sha256Bytea,
  subjectProofKeyVersion: 1,
} as const

function createRepository(
  overrides: Partial<PrivacyRepository> = {},
): PrivacyRepository {
  return {
    getCurrentNotice: vi.fn().mockResolvedValue({
      id: noticeId,
      document_type: 'survey_notice',
      locale: 'tr',
      version: '2026-07-18',
      content_sha256: sha256Bytea,
      content_uri: '/privacy/survey/2026-07-18.tr.md',
      effective_from: timestamp,
      internalValueThatMustNotLeak: 'ignored',
    }),
    recordAuthenticatedConsent: vi.fn().mockResolvedValue({
      event_id: eventId,
      event_created_at: timestamp,
      replayed: false,
    }),
    ...overrides,
  }
}

function createService(
  repository: PrivacyRepository,
  actor: unknown = trustedActor,
) {
  return createPrivacyService({
    repository,
    resolveTrustedConsentActor: vi.fn().mockResolvedValue(actor),
  })
}

describe('privacy service', () => {
  it('maps a persistence notice to the minimum public DTO', async () => {
    const repository = createRepository()
    const service = createService(repository)

    await expect(
      service.getCurrentNotice({
        documentType: 'survey_notice',
        locale: 'tr',
      }),
    ).resolves.toEqual({
      id: noticeId,
      documentType: 'survey_notice',
      locale: 'tr',
      version: '2026-07-18',
      contentSha256: sha256Bytea,
      contentUri: '/privacy/survey/2026-07-18.tr.md',
      effectiveFrom: timestamp,
    })
  })

  it('returns a stable not-found error without persistence details', async () => {
    const repository = createRepository({
      getCurrentNotice: vi.fn().mockResolvedValue(null),
    })
    const service = createService(repository)

    await expect(
      service.getCurrentNotice({
        documentType: 'account_notice',
        locale: 'en',
      }),
    ).rejects.toEqual(new PrivacyServiceError('NOTICE_NOT_FOUND'))
  })

  it.each([
    [
      new PrivacyPersistenceError('NOTICE_RESPONSE_INVALID'),
      'NOTICE_RESPONSE_INVALID',
    ],
    [new PrivacyPersistenceError('NOTICE_READ_FAILED'), 'NOTICE_READ_FAILED'],
    [new Error('raw database detail'), 'NOTICE_READ_FAILED'],
  ] as const)(
    'maps a notice persistence failure to %s',
    async (failure, expectedCode) => {
      const repository = createRepository({
        getCurrentNotice: vi.fn().mockRejectedValue(failure),
      })

      await expect(
        createService(repository).getCurrentNotice({
          documentType: 'survey_notice',
          locale: 'tr',
        }),
      ).rejects.toEqual(new PrivacyServiceError(expectedCode))
    },
  )

  it('rejects an invalid notice response before it reaches the caller', async () => {
    const repository = createRepository({
      getCurrentNotice: vi.fn().mockResolvedValue({
        id: noticeId,
        document_type: 'unknown_notice',
        locale: 'tr',
        version: '2026-07-18',
        content_sha256: sha256Bytea,
        content_uri: '/privacy/unknown',
        effective_from: timestamp,
      }),
    })

    await expect(
      createService(repository).getCurrentNotice({
        documentType: 'survey_notice',
        locale: 'tr',
      }),
    ).rejects.toEqual(new PrivacyServiceError('NOTICE_RESPONSE_INVALID'))
  })

  it('uses only the trusted actor for server-owned consent fields', async () => {
    const repository = createRepository()
    const service = createService(repository)

    await expect(
      service.recordConsent(
        {
          noticeVersionId: noticeId,
          purposeCode: 'survey_contribution',
          decision: 'granted',
          idempotencyKey,
        },
      ),
    ).resolves.toEqual({
      eventId,
      createdAt: timestamp,
      replayed: false,
    })

    expect(repository.recordAuthenticatedConsent).toHaveBeenCalledWith({
      authUserId: userId,
      noticeVersionId: noticeId,
      purposeCode: 'survey_contribution',
      decision: 'granted',
      eventSource: 'survey',
      subjectProofHmac: sha256Bytea,
      subjectProofKeyVersion: 1,
      idempotencyKey,
    })
  })

  it('rejects actor fields injected into the public command', async () => {
    const repository = createRepository()
    const service = createService(repository)

    await expect(
      service.recordConsent(
        {
          noticeVersionId: noticeId,
          purposeCode: 'survey_contribution',
          decision: 'granted',
          idempotencyKey,
          authUserId: userId,
        },
      ),
    ).rejects.toThrow()

    expect(repository.recordAuthenticatedConsent).not.toHaveBeenCalled()
  })

  it.each([
    null,
    {
      ...trustedActor,
      authUserId: 'not-a-uuid',
    },
  ])('rejects an unresolved trusted actor: %o', async (actor) => {
    const repository = createRepository()

    await expect(
      createService(repository, actor).recordConsent({
        noticeVersionId: noticeId,
        purposeCode: 'survey_contribution',
        decision: 'granted',
        idempotencyKey,
      }),
    ).rejects.toEqual(
      new PrivacyServiceError('CONSENT_ACTOR_RESOLUTION_FAILED'),
    )
    expect(repository.recordAuthenticatedConsent).not.toHaveBeenCalled()
  })

  it('maps a trusted actor resolver failure without leaking its details', async () => {
    const repository = createRepository()
    const service = createPrivacyService({
      repository,
      resolveTrustedConsentActor: vi
        .fn()
        .mockRejectedValue(new Error('session detail')),
    })

    await expect(
      service.recordConsent({
        noticeVersionId: noticeId,
        purposeCode: 'survey_contribution',
        decision: 'granted',
        idempotencyKey,
      }),
    ).rejects.toEqual(
      new PrivacyServiceError('CONSENT_ACTOR_RESOLUTION_FAILED'),
    )
  })

  it.each([
    ['CONSENT_SUBJECT_NOT_FOUND', 'CONSENT_SUBJECT_NOT_FOUND'],
    ['CONSENT_NOTICE_NOT_EFFECTIVE', 'CONSENT_NOTICE_NOT_EFFECTIVE'],
    [
      'CONSENT_NOTICE_PURPOSE_MISMATCH',
      'CONSENT_NOTICE_PURPOSE_MISMATCH',
    ],
    ['CONSENT_IDEMPOTENCY_CONFLICT', 'CONSENT_IDEMPOTENCY_CONFLICT'],
    ['CONSENT_RESPONSE_INVALID', 'CONSENT_RESPONSE_INVALID'],
    ['CONSENT_WRITE_FAILED', 'CONSENT_WRITE_FAILED'],
  ] as const)(
    'maps a consent persistence failure to %s',
    async (persistenceCode, serviceCode) => {
      const repository = createRepository({
        recordAuthenticatedConsent: vi
          .fn()
          .mockRejectedValue(new PrivacyPersistenceError(persistenceCode)),
      })

      await expect(
        createService(repository).recordConsent({
          noticeVersionId: noticeId,
          purposeCode: 'survey_contribution',
          decision: 'granted',
          idempotencyKey,
        }),
      ).rejects.toEqual(new PrivacyServiceError(serviceCode))
    },
  )

  it('maps an unknown consent persistence failure to a stable error', async () => {
    const repository = createRepository({
      recordAuthenticatedConsent: vi
        .fn()
        .mockRejectedValue(new Error('raw database detail')),
    })

    await expect(
      createService(repository).recordConsent({
        noticeVersionId: noticeId,
        purposeCode: 'survey_contribution',
        decision: 'granted',
        idempotencyKey,
      }),
    ).rejects.toEqual(new PrivacyServiceError('CONSENT_WRITE_FAILED'))
  })

  it('rejects an invalid repository receipt before it reaches the caller', async () => {
    const repository = createRepository({
      recordAuthenticatedConsent: vi.fn().mockResolvedValue({
        event_id: 'not-a-uuid',
        event_created_at: timestamp,
        replayed: false,
      }),
    })
    const service = createService(repository)

    await expect(
      service.recordConsent(
        {
          noticeVersionId: noticeId,
          purposeCode: 'survey_contribution',
          decision: 'granted',
          idempotencyKey,
        },
      ),
    ).rejects.toEqual(new PrivacyServiceError('CONSENT_RESPONSE_INVALID'))
  })
})
