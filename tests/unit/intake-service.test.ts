import { describe, expect, it, vi } from 'vitest'

import { IntakePersistenceError } from '@/lib/intake/errors'
import type { IntakeRepository } from '@/lib/server/intake/repository'
import { createIntakeService } from '@/lib/server/intake/service'

const receiptId = '11111111-1111-4111-8111-111111111111'
const subjectId = '22222222-2222-4222-8222-222222222222'
const token = Buffer.alloc(32, 9).toString('base64url')
const active = Buffer.alloc(32, 1).toString('base64url')
const previous = Buffer.alloc(32, 2).toString('base64url')
const record = {
  receipt_id: receiptId,
  survey_type: 'search_benchmark',
  lifecycle_status: 'accepted',
  quality_status: 'pending',
  submitted_at: '2026-07-22T10:00:00.000Z',
  withdrawn_at: null,
  capability_rotated: false,
}

function repository(
  overrides: Partial<IntakeRepository> = {},
): IntakeRepository {
  return {
    getSubmissionReceipt: vi.fn().mockResolvedValue(record),
    resolveAuthenticatedSubject: vi.fn().mockResolvedValue(subjectId),
    ...overrides,
  }
}

function service(repo: IntakeRepository) {
  return createIntakeService({
    repository: repo,
    capabilityKeys: {
      active: { version: 2, secret: active },
      previous: { version: 1, secret: previous },
    },
  })
}

describe('intake service', () => {
  it('reads an authenticated owner receipt without a capability', async () => {
    const repo = repository()
    await expect(
      service(repo).getSubmissionReceipt({
        receiptId,
        authorization: null,
        requesterDataSubjectId: subjectId,
      }),
    ).resolves.toEqual({
      receiptId,
      surveyType: 'search_benchmark',
      lifecycleStatus: 'accepted',
      qualityStatus: 'pending',
      submittedAt: '2026-07-22T10:00:00.000Z',
      withdrawnAt: null,
    })
    expect(repo.getSubmissionReceipt).toHaveBeenCalledWith(
      expect.objectContaining({
        requesterDataSubjectId: subjectId,
        activeCapabilityHmac: null,
      }),
    )
  })

  it('derives active and previous HMACs from the capability header', async () => {
    const repo = repository()
    await service(repo).getSubmissionReceipt({
      receiptId,
      authorization: `SubmissionCapability ${token}`,
      requesterDataSubjectId: null,
    })
    expect(repo.getSubmissionReceipt).toHaveBeenCalledWith(
      expect.objectContaining({
        requesterDataSubjectId: null,
        activeCapabilityKeyVersion: 2,
        previousCapabilityKeyVersion: 1,
        activeCapabilityHmac: expect.stringMatching(/^\\x[0-9a-f]{64}$/u),
        previousCapabilityHmac: expect.stringMatching(/^\\x[0-9a-f]{64}$/u),
      }),
    )
  })

  it.each([null, 'Bearer token', 'SubmissionCapability short'])(
    'rejects missing or malformed anonymous authorization',
    async (authorization) => {
      await expect(
        service(repository()).getSubmissionReceipt({
          receiptId,
          authorization,
          requesterDataSubjectId: null,
        }),
      ).rejects.toMatchObject({ code: 'SUBMISSION_AUTHORIZATION_INVALID' })
    },
  )

  it('uses one not-found result for missing and unauthorized receipts', async () => {
    await expect(
      service(repository({ getSubmissionReceipt: vi.fn().mockResolvedValue(null) }))
        .getSubmissionReceipt({
          receiptId,
          authorization: `SubmissionCapability ${token}`,
          requesterDataSubjectId: null,
        }),
    ).rejects.toMatchObject({ code: 'SUBMISSION_RECEIPT_NOT_FOUND' })
  })

  it.each([
    ['SUBMISSION_RECEIPT_RESPONSE_INVALID', 'SUBMISSION_RECEIPT_RESPONSE_INVALID'],
    ['SUBMISSION_RECEIPT_READ_FAILED', 'SUBMISSION_RECEIPT_READ_FAILED'],
  ] as const)('maps persistence error %s', async (persistenceCode, serviceCode) => {
    const repo = repository({
      getSubmissionReceipt: vi
        .fn()
        .mockRejectedValue(new IntakePersistenceError(persistenceCode)),
    })
    await expect(
      service(repo).getSubmissionReceipt({
        receiptId,
        authorization: null,
        requesterDataSubjectId: subjectId,
      }),
    ).rejects.toMatchObject({ code: serviceCode })
  })

  it('maps unknown failures and invalid DTOs safely', async () => {
    await expect(
      service(repository({
        getSubmissionReceipt: vi.fn().mockRejectedValue(new Error('private')),
      })).getSubmissionReceipt({
        receiptId, authorization: null, requesterDataSubjectId: subjectId,
      }),
    ).rejects.toMatchObject({ code: 'SUBMISSION_RECEIPT_READ_FAILED' })

    await expect(
      service(repository({
        getSubmissionReceipt: vi.fn().mockResolvedValue({
          ...record, survey_type: 'unsupported',
        }),
      })).getSubmissionReceipt({
        receiptId, authorization: null, requesterDataSubjectId: subjectId,
      }),
    ).rejects.toMatchObject({ code: 'SUBMISSION_RECEIPT_RESPONSE_INVALID' })
  })
})
