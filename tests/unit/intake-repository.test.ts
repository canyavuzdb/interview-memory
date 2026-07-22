import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSupabaseIntakeRepository } from '@/lib/server/intake/repository'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: vi.fn(),
}))

const rpc = vi.fn()
const receiptId = '11111111-1111-4111-8111-111111111111'
const subjectId = '22222222-2222-4222-8222-222222222222'
const hash = '\\x'.concat('a'.repeat(64))
const input = {
  receiptId,
  requesterDataSubjectId: null,
  activeCapabilityHmac: hash,
  activeCapabilityKeyVersion: 2,
  previousCapabilityHmac: null,
  previousCapabilityKeyVersion: null,
}

beforeEach(() => {
  rpc.mockReset()
  vi.mocked(createAdminSupabaseClient).mockReturnValue({ rpc } as never)
})

describe('Supabase intake repository', () => {
  it('validates receipt and authenticated-subject RPC responses', async () => {
    rpc
      .mockResolvedValueOnce({
        data: [{
          receipt_id: receiptId,
          survey_type: 'search_benchmark',
          lifecycle_status: 'accepted',
          quality_status: 'pending',
          submitted_at: '2026-07-22T10:00:00.000Z',
          withdrawn_at: null,
          capability_rotated: false,
        }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{ data_subject_id: subjectId }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{ data_subject_id: subjectId, merged: true }],
        error: null,
      })
    const repo = createSupabaseIntakeRepository()

    await expect(repo.getSubmissionReceipt(input)).resolves.toMatchObject({
      receipt_id: receiptId,
    })
    await expect(repo.resolveAuthenticatedSubject(subjectId)).resolves.toBe(
      subjectId,
    )
    await expect(repo.mergeAnonymousSubject({
      authUserId: subjectId,
      activeAnonymousHmac: hash,
      previousAnonymousHmac: null,
      anonymousQuotaSubjectHmac: hash,
      authenticatedQuotaSubjectHmac: hash,
    })).resolves.toEqual({ data_subject_id: subjectId, merged: true })
    expect(rpc).toHaveBeenNthCalledWith(
      1,
      'get_submission_receipt_v1',
      expect.objectContaining({
        p_receipt_id: receiptId,
        p_active_capability_hmac: hash,
        p_previous_capability_hmac: undefined,
      }),
    )
  })

  it('returns null for non-disclosing empty RPC results', async () => {
    rpc
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: [], error: null })
    const repo = createSupabaseIntakeRepository()
    await expect(repo.getSubmissionReceipt({
      ...input,
      requesterDataSubjectId: subjectId,
      activeCapabilityHmac: null,
      activeCapabilityKeyVersion: null,
    })).resolves.toBeNull()
    await expect(repo.resolveAuthenticatedSubject(subjectId)).resolves.toBeNull()
  })

  it('rejects invalid HMACs before RPC access', async () => {
    const repo = createSupabaseIntakeRepository()
    await expect(repo.getSubmissionReceipt({
      ...input, activeCapabilityHmac: 'raw-token',
    })).rejects.toMatchObject({ code: 'SUBMISSION_RECEIPT_READ_FAILED' })
    expect(rpc).not.toHaveBeenCalled()
  })

  it('maps RPC and malformed response failures', async () => {
    rpc
      .mockResolvedValueOnce({ data: null, error: { message: 'private' } })
      .mockResolvedValueOnce({ data: [{}], error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'private' } })
      .mockResolvedValueOnce({ data: [{}], error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'private' } })
      .mockResolvedValueOnce({ data: [{}], error: null })
    const repo = createSupabaseIntakeRepository()

    await expect(repo.getSubmissionReceipt(input)).rejects.toMatchObject({
      code: 'SUBMISSION_RECEIPT_READ_FAILED',
    })
    await expect(repo.getSubmissionReceipt(input)).rejects.toMatchObject({
      code: 'SUBMISSION_RECEIPT_RESPONSE_INVALID',
    })
    await expect(repo.resolveAuthenticatedSubject(subjectId)).rejects.toMatchObject({
      code: 'SUBMISSION_RECEIPT_READ_FAILED',
    })
    await expect(repo.resolveAuthenticatedSubject(subjectId)).rejects.toMatchObject({
      code: 'SUBMISSION_RECEIPT_RESPONSE_INVALID',
    })
    const mergeInput = {
      authUserId: subjectId,
      activeAnonymousHmac: hash,
      previousAnonymousHmac: hash,
      anonymousQuotaSubjectHmac: hash,
      authenticatedQuotaSubjectHmac: hash,
    }
    await expect(repo.mergeAnonymousSubject(mergeInput)).rejects.toMatchObject({
      code: 'ANONYMOUS_SUBJECT_MERGE_FAILED',
    })
    await expect(repo.mergeAnonymousSubject(mergeInput)).rejects.toMatchObject({
      code: 'ANONYMOUS_SUBJECT_MERGE_RESPONSE_INVALID',
    })
  })

  it('rejects malformed subject-merge hashes before database access', async () => {
    await expect(createSupabaseIntakeRepository().mergeAnonymousSubject({
      authUserId: subjectId,
      activeAnonymousHmac: 'raw',
      previousAnonymousHmac: null,
      anonymousQuotaSubjectHmac: hash,
      authenticatedQuotaSubjectHmac: hash,
    })).rejects.toMatchObject({ code: 'ANONYMOUS_SUBJECT_MERGE_FAILED' })
    expect(rpc).not.toHaveBeenCalled()
  })
})
