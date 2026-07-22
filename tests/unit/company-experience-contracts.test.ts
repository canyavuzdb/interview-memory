import { describe, expect, it } from 'vitest'

import { companyExperienceCreateBodySchema } from '@/lib/company-experience/contracts'

export const validCompanyExperienceBody = {
  companyName: 'Example Corp', appliedRole: 'Frontend Developer', processYear: 2026,
  promisedTimeline: 'yes', promisedDays: 7, actualDays: 10,
  wasGhosted: false, ghostedAfterStage: null, interviewerPrepared: 4,
  wasAskedIrrelevant: true, irrelevantTypes: ['age'],
  rejectionShared: 'yes_detailed', feedbackUseful: 4,
  processTransparency: 3, hrProfessionalism: 4,
  wouldRecommendProcess: 'unsure', freeNote: 'Private note',
  locale: 'tr', consentGranted: true,
} as const

describe('company experience contracts', () => {
  it('accepts a coherent contribution and trims text', () => {
    expect(companyExperienceCreateBodySchema.parse({
      ...validCompanyExperienceBody, companyName: '  Example Corp  ',
    }).companyName).toBe('Example Corp')
  })

  it.each([
    { promisedTimeline: 'no', promisedDays: 7 },
    { promisedTimeline: 'yes', promisedDays: null },
    { wasGhosted: true, actualDays: 1, ghostedAfterStage: 'application' },
    { wasGhosted: false, actualDays: 1, ghostedAfterStage: 'application' },
    { wasAskedIrrelevant: true, irrelevantTypes: [] },
    { wasAskedIrrelevant: false, irrelevantTypes: ['age'] },
    { rejectionShared: 'no', feedbackUseful: 4 },
  ])('rejects incoherent conditional fields %#', (override) => {
    expect(companyExperienceCreateBodySchema.safeParse({
      ...validCompanyExperienceBody, ...override,
    }).success).toBe(false)
  })
})
