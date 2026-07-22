import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSupabaseCompanyExperienceRepository } from '@/lib/server/company-experience/repository'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({ createAdminSupabaseClient: vi.fn() }))

const rpc = vi.fn()
const id = '11111111-1111-4111-8111-111111111111'
const hash = `\\x${'ab'.repeat(32)}`
const input = {
  dataSubjectId: id, schemaVersion: 1, locale: 'tr' as const,
  noticeVersionId: id, payloadHash: hash, commandFingerprint: hash,
  supersedesSubmissionId: null, capabilityHmac: hash, capabilityKeyVersion: 1,
  capabilityExpiresAt: '2026-08-20T00:00:00.000Z',
  consentSubjectProofHmac: hash, consentSubjectProofKeyVersion: 1,
  consentIdempotencyKey: id, idempotencySubjectHmac: hash,
  idempotencyKeyHmac: hash, idempotencyRequestFingerprint: hash,
  quotaSubjectHmac: hash, quota24hWindowStart: '2026-07-20T00:00:00.000Z',
  quota24hLimit: 3, quota24hExpiresAt: '2026-07-21T00:00:00.000Z',
  quota30dWindowStart: '2026-07-01T00:00:00.000Z', quota30dLimit: 10,
  quota30dExpiresAt: '2026-07-31T00:00:00.000Z',
  quotaPolicyVersion: 'v1', quotaPolicyHash: hash,
  companyName: 'Example', appliedRole: 'Engineer', processYear: 2026,
  promisedTimeline: 'yes', promisedDays: 7, actualDays: 9,
  wasGhosted: false, ghostedAfterStage: null, interviewerPrepared: 4,
  wasAskedIrrelevant: true, irrelevantTypes: ['age'],
  rejectionShared: 'yes_detailed', feedbackUseful: 4,
  processTransparency: 3, hrProfessionalism: 4,
  wouldRecommendProcess: 'yes', freeNote: null,
}

beforeEach(() => {
  rpc.mockReset()
  vi.mocked(createAdminSupabaseClient).mockReturnValue({ rpc } as never)
})

describe('company experience repository', () => {
  it('writes and replays through narrow RPCs', async () => {
    const row = { submission_id: id, receipt_id: id, company_experience_id: id }
    rpc
      .mockResolvedValueOnce({ data: [row], error: null })
      .mockResolvedValueOnce({ data: [{ ...row, capability_key_version: 1 }], error: null })
    const repository = createSupabaseCompanyExperienceRepository()
    await expect(repository.createCompanyExperience(input)).resolves.toEqual(row)
    await expect(repository.getCreateResult({ submissionId: id, dataSubjectId: id }))
      .resolves.toMatchObject({ capability_key_version: 1 })
    expect(rpc).toHaveBeenNthCalledWith(1, 'create_company_experience_v1',
      expect.objectContaining({ p_company_name: 'Example', p_quota_30d_limit: 10 }))
  })

  it('supports authenticated nullable fields and missing replays', async () => {
    const row = { submission_id: id, receipt_id: id, company_experience_id: id }
    rpc
      .mockResolvedValueOnce({ data: [row], error: null })
      .mockResolvedValueOnce({ data: [], error: null })
    const repository = createSupabaseCompanyExperienceRepository()
    await expect(repository.createCompanyExperience({
      ...input, capabilityHmac: null, capabilityKeyVersion: null,
      capabilityExpiresAt: null, promisedDays: null, actualDays: null,
      ghostedAfterStage: 'final', interviewerPrepared: null,
      feedbackUseful: null, freeNote: null,
    })).resolves.toEqual(row)
    await expect(repository.getCreateResult({ submissionId: id, dataSubjectId: id }))
      .resolves.toBeNull()
  })

  it.each([
    ['accepted_quota_exceeded', 'COMPANY_EXPERIENCE_QUOTA_EXCEEDED'],
    ['survey_notice_not_effective', 'COMPANY_EXPERIENCE_NOTICE_NOT_FOUND'],
    ['survey_submissions_command_unique', 'COMPANY_EXPERIENCE_DUPLICATE'],
    ['company_experiences_year_check', 'COMPANY_EXPERIENCE_BODY_INVALID'],
    ['private failure', 'COMPANY_EXPERIENCE_WRITE_FAILED'],
    [undefined, 'COMPANY_EXPERIENCE_WRITE_FAILED'],
  ])('maps %s safely', async (message, code) => {
    rpc.mockResolvedValue({ data: null, error: { message } })
    await expect(createSupabaseCompanyExperienceRepository().createCompanyExperience(input))
      .rejects.toMatchObject({ code })
  })

  it('rejects malformed responses, replay failures, and hashes', async () => {
    const repository = createSupabaseCompanyExperienceRepository()
    rpc
      .mockResolvedValueOnce({ data: [{}], error: null })
      .mockResolvedValueOnce({ data: [{}], error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'private' } })
    await expect(repository.createCompanyExperience(input)).rejects.toMatchObject({
      code: 'COMPANY_EXPERIENCE_RESPONSE_INVALID',
    })
    await expect(repository.getCreateResult({ submissionId: id, dataSubjectId: id }))
      .rejects.toMatchObject({ code: 'COMPANY_EXPERIENCE_RESPONSE_INVALID' })
    await expect(repository.getCreateResult({ submissionId: id, dataSubjectId: id }))
      .rejects.toMatchObject({ code: 'COMPANY_EXPERIENCE_REPLAY_FAILED' })
    await expect(repository.createCompanyExperience({ ...input, payloadHash: 'raw' }))
      .rejects.toMatchObject({ code: 'COMPANY_EXPERIENCE_WRITE_FAILED' })
  })
})
