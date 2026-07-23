import { describe, expect, it } from 'vitest'

import {
  moderationDecisionBodySchema,
  moderationQueueQuerySchema,
} from '@/lib/moderation/contracts'

describe('moderation contracts', () => {
  it('applies bounded queue defaults', () => {
    expect(
      moderationQueueQuerySchema.parse({
        surveyType: null,
        beforeSubmittedAt: null,
        beforeSubmissionId: null,
      }),
    ).toMatchObject({ qualityStatus: 'pending', limit: 25 })
  })

  it('requires complete cursor pairs', () => {
    expect(
      moderationQueueQuerySchema.safeParse({
        surveyType: null,
        beforeSubmittedAt: '2026-07-24T10:00:00.000Z',
        beforeSubmissionId: null,
      }).success,
    ).toBe(false)
  })

  it.each([
    {
      decision: 'eligible',
      reasonCode: 'quality_review_passed',
      reviewerNote: null,
      companyId: null,
    },
    {
      decision: 'excluded',
      reasonCode: 'spam',
      reviewerNote: 'Repeated promotional content',
      companyId: null,
    },
  ])('accepts coherent decision %#', (body) => {
    expect(moderationDecisionBodySchema.safeParse(body).success).toBe(true)
  })

  it('rejects a mismatched decision reason', () => {
    expect(
      moderationDecisionBodySchema.safeParse({
        decision: 'eligible',
        reasonCode: 'spam',
        reviewerNote: null,
        companyId: null,
      }).success,
    ).toBe(false)
  })
})
