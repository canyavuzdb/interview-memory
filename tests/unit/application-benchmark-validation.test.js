import { describe, expect, it } from 'vitest'

import {
  validateApplicationBenchmarkStep,
} from '@/lib/validation/applicationBenchmark'

const messages = {
  required: 'Required',
  nonNegativeNumber: 'Use a non-negative number',
  countOrder: 'Counts are out of order',
  endDateRequired: 'End date required',
  endDateBeforeStart: 'End date is invalid',
  consentRequired: 'Consent required',
}

const baseState = {
  role: 'frontend-developer',
  sector: 'technology',
  roleLevel: 'junior',
  experienceBand: '0-1',
  targetRegion: 'turkiye',
  isCurrentlyEmployed: false,
  searchStartedAt: '2026-01',
  searchStatus: 'ongoing',
  applicationsCount: '222',
  humanResponsesCount: '22',
  anyInterviewsCount: '5',
  hrInterviewsCount: '',
  technicalInterviewsCount: '',
  offersCount: '',
  acceptedOffersCount: '',
  employmentStartedCount: '',
  countsAreEstimated: true,
}

describe('application benchmark funnel validation', () => {
  it('requires the role, sector, and career level used for cohorting', () => {
    expect(validateApplicationBenchmarkStep(1, {
      ...baseState,
      sector: '',
    }, messages)).toEqual({ sector: 'Required' })
  })

  it('does not require optional interview and offer details', () => {
    expect(validateApplicationBenchmarkStep(2, baseState, messages)).toEqual({})
  })

  it('requires explicit zeroes for response and interview counts', () => {
    expect(validateApplicationBenchmarkStep(2, {
      ...baseState,
      humanResponsesCount: '',
      anyInterviewsCount: '',
    }, messages)).toEqual({
      humanResponsesCount: 'Use a non-negative number',
      anyInterviewsCount: 'Use a non-negative number',
    })

    expect(validateApplicationBenchmarkStep(2, {
      ...baseState,
      humanResponsesCount: '0',
      anyInterviewsCount: '0',
    }, messages)).toEqual({})
  })

  it('rejects funnel counts above the supported maximum', () => {
    expect(validateApplicationBenchmarkStep(2, {
      ...baseState,
      applicationsCount: '10001',
    }, messages)).toEqual({ applicationsCount: 'Use a non-negative number' })
  })

})
