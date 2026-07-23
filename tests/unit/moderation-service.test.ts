import { describe, expect, it, vi } from 'vitest'

import { ModerationPersistenceError } from '@/lib/moderation/errors'
import { createModerationService } from '@/lib/server/moderation/service'

const id = '11111111-1111-4111-8111-111111111111'
const secondId = '22222222-2222-4222-8222-222222222222'
const submittedAt = '2026-07-24T10:00:00.000Z'
const queueRecord = {
  submission_id: id,
  receipt_id: id,
  survey_type: 'company_experience',
  schema_version: 1,
  locale: 'tr',
  quality_status: 'pending',
  submitted_at: submittedAt,
  company_name: 'Example',
  applied_role: 'Engineer',
  free_note: null,
  canonical_company_id: secondId,
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

function setup(records = [queueRecord]) {
  const repository = {
    listQueue: vi.fn().mockResolvedValue(records),
    decide: vi.fn().mockResolvedValue({
      decision_id: secondId,
      submission_id: id,
      quality_status: 'eligible',
      decided_at: '2026-07-24T11:00:00.000Z',
    }),
    listCompanies: vi.fn().mockResolvedValue([{
      company_id: secondId,
      slug: 'example',
      display_name: 'Example',
      country_code: 'TR',
      verification_status: 'unverified',
      publication_status: 'hidden',
    }]),
    createCompany: vi.fn().mockResolvedValue({
      company_id: secondId,
      slug: 'example',
      display_name: 'Example',
      country_code: 'TR',
      verification_status: 'unverified',
      publication_status: 'hidden',
    }),
  }
  return { repository, service: createModerationService(repository) }
}

const actor = { userId: id }

describe('moderation service', () => {
  it('maps a full page and creates the keyset cursor', async () => {
    const value = setup()
    await expect(value.service.list({
      actor,
      query: {
        qualityStatus: 'pending',
        surveyType: null,
        limit: 1,
        beforeSubmittedAt: null,
        beforeSubmissionId: null,
      },
    })).resolves.toMatchObject({
      items: [{ submissionId: id, companyName: 'Example' }],
      nextCursor: { beforeSubmittedAt: submittedAt, beforeSubmissionId: id },
    })
  })

  it('returns no cursor for a partial page', async () => {
    await expect(setup([]).service.list({
      actor,
      query: {
        qualityStatus: 'pending',
        surveyType: null,
        limit: 25,
        beforeSubmittedAt: null,
        beforeSubmissionId: null,
      },
    })).resolves.toEqual({ items: [], nextCursor: null })
  })

  it('validates and maps an idempotent decision', async () => {
    const value = setup()
    await expect(value.service.decide({
      actor,
      submissionId: id,
      decisionId: secondId,
      body: {
        decision: 'eligible',
        reasonCode: 'quality_review_passed',
        reviewerNote: null,
        companyId: secondId,
      },
    })).resolves.toMatchObject({
      decisionId: secondId,
      qualityStatus: 'eligible',
    })
    expect(value.repository.decide).toHaveBeenCalledWith(
      expect.objectContaining({ reviewerUserId: id, companyId: secondId }),
    )
  })

  it('searches and creates canonical companies', async () => {
    const value = setup()
    await expect(value.service.listCompanies({
      actor,
      query: { query: 'Example', limit: 20 },
    })).resolves.toMatchObject({
      items: [{ companyId: secondId, displayName: 'Example' }],
    })
    await expect(value.service.createCompany({
      actor,
      companyId: secondId,
      body: { slug: 'example', displayName: 'Example', countryCode: 'tr' },
    })).resolves.toMatchObject({
      companyId: secondId,
      countryCode: 'TR',
    })
  })

  it.each([
    { kind: 'query', value: { qualityStatus: 'private' } },
    {
      kind: 'decision',
      value: {
        decision: 'eligible',
        reasonCode: 'spam',
        reviewerNote: null,
        companyId: null,
      },
    },
  ])('rejects invalid $kind input', async ({ kind, value }) => {
    const setupValue = setup()
    if (kind === 'query') {
      await expect(setupValue.service.list({ actor, query: value }))
        .rejects.toMatchObject({ code: 'MODERATION_QUERY_INVALID' })
    } else {
      await expect(setupValue.service.decide({
        actor,
        submissionId: id,
        decisionId: secondId,
        body: value,
      })).rejects.toMatchObject({ code: 'MODERATION_BODY_INVALID' })
    }
  })

  it('maps known and unknown persistence failures', async () => {
    const known = setup()
    known.repository.listQueue.mockRejectedValue(
      new ModerationPersistenceError('MODERATION_FORBIDDEN'),
    )
    await expect(known.service.list({
      actor,
      query: {
        qualityStatus: 'pending',
        surveyType: null,
        limit: 25,
        beforeSubmittedAt: null,
        beforeSubmissionId: null,
      },
    })).rejects.toMatchObject({ code: 'MODERATION_FORBIDDEN' })

    const unknown = setup()
    unknown.repository.decide.mockRejectedValue(new Error('private'))
    await expect(unknown.service.decide({
      actor,
      submissionId: id,
      decisionId: secondId,
      body: {
        decision: 'excluded',
        reasonCode: 'spam',
        reviewerNote: null,
        companyId: null,
      },
    })).rejects.toMatchObject({ code: 'MODERATION_WRITE_FAILED' })
  })
})
