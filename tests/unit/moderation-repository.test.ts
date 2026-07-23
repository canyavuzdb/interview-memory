import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSupabaseModerationRepository } from '@/lib/server/moderation/repository'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({ createAdminSupabaseClient: vi.fn() }))

const rpc = vi.fn()
const id = '11111111-1111-4111-8111-111111111111'
const queueRow = {
  submission_id: id,
  receipt_id: id,
  survey_type: 'company_experience',
  schema_version: 1,
  locale: 'tr',
  quality_status: 'pending',
  submitted_at: '2026-07-24T10:00:00.000Z',
  company_name: 'Example',
  applied_role: 'Engineer',
  free_note: null,
  canonical_company_id: id,
  role_id: null,
  role_level: null,
  target_region: null,
  started_month: null,
  ended_month: null,
  applications_count: null,
  human_responses_count: null,
  any_interviews_count: null,
  offers_count: null,
  quality_signals: [],
  last_reason_code: null,
}
const listInput = {
  reviewerUserId: id,
  qualityStatus: 'pending',
  surveyType: null,
  limit: 25,
  beforeSubmittedAt: null,
  beforeSubmissionId: null,
}

beforeEach(() => {
  rpc.mockReset()
  vi.mocked(createAdminSupabaseClient).mockReturnValue({ rpc } as never)
})

describe('moderation repository', () => {
  it('lists and decides through server-only RPCs', async () => {
    const companyRow = {
      company_id: id,
      slug: 'example',
      display_name: 'Example',
      country_code: 'TR',
      verification_status: 'unverified',
      publication_status: 'hidden',
    }
    rpc
      .mockResolvedValueOnce({ data: [queueRow], error: null })
      .mockResolvedValueOnce({
        data: [{
          decision_id: id,
          submission_id: id,
          quality_status: 'eligible',
          decided_at: '2026-07-24T11:00:00.000Z',
        }],
        error: null,
      })
      .mockResolvedValueOnce({ data: [companyRow], error: null })
      .mockResolvedValueOnce({ data: [companyRow], error: null })
    const repository = createSupabaseModerationRepository()
    await expect(repository.listQueue(listInput)).resolves.toEqual([queueRow])
    await expect(repository.decide({
      reviewerUserId: id,
      submissionId: id,
      decisionId: id,
      decision: 'eligible',
      reasonCode: 'quality_review_passed',
      reviewerNote: null,
      companyId: id,
    })).resolves.toMatchObject({ quality_status: 'eligible' })
    await expect(repository.listCompanies({
      reviewerUserId: id,
      query: 'Example',
      limit: 20,
    })).resolves.toEqual([companyRow])
    await expect(repository.createCompany({
      reviewerUserId: id,
      companyId: id,
      slug: 'example',
      displayName: 'Example',
      countryCode: 'TR',
    })).resolves.toEqual(companyRow)
  })

  it.each([
    ['moderator_role_required', 'MODERATION_FORBIDDEN'],
    ['moderation_self_review_forbidden', 'MODERATION_SELF_REVIEW_FORBIDDEN'],
    ['moderation_submission_not_found', 'MODERATION_NOT_FOUND'],
    ['company_resolution_required', 'MODERATION_COMPANY_RESOLUTION_REQUIRED'],
    ['company_resolution_conflict', 'MODERATION_COMPANY_RESOLUTION_CONFLICT'],
    ['moderation_decision_id_conflict', 'MODERATION_DECISION_CONFLICT'],
    ['moderation_query_invalid', 'MODERATION_QUERY_INVALID'],
    ['moderation_decision_invalid', 'MODERATION_BODY_INVALID'],
    ['private', 'MODERATION_WRITE_FAILED'],
  ])('maps write error %s', async (message, code) => {
    rpc.mockResolvedValue({ data: null, error: { message } })
    await expect(createSupabaseModerationRepository().decide({
      reviewerUserId: id,
      submissionId: id,
      decisionId: id,
      decision: 'excluded',
      reasonCode: 'spam',
      reviewerNote: null,
      companyId: null,
    })).rejects.toMatchObject({ code })
  })

  it('fails closed for malformed and private read results', async () => {
    const repository = createSupabaseModerationRepository()
    rpc
      .mockResolvedValueOnce({ data: [{}], error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'private' } })
      .mockResolvedValueOnce({ data: [{}], error: null })
    await expect(repository.listQueue(listInput)).rejects.toMatchObject({
      code: 'MODERATION_RESPONSE_INVALID',
    })
    await expect(repository.listQueue(listInput)).rejects.toMatchObject({
      code: 'MODERATION_READ_FAILED',
    })
    await expect(repository.decide({
      reviewerUserId: id,
      submissionId: id,
      decisionId: id,
      decision: 'excluded',
      reasonCode: 'spam',
      reviewerNote: null,
      companyId: null,
    })).rejects.toMatchObject({ code: 'MODERATION_RESPONSE_INVALID' })
  })
})
