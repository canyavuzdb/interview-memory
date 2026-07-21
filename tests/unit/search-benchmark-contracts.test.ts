import { describe, expect, it } from 'vitest'

import {
  searchBenchmarkCreateBodySchema,
  searchBenchmarkCreateResultSchema,
} from '@/lib/search-benchmark/contracts'

const validBody = {
  role: 'frontend_developer',
  sector: 'technology',
  roleLevel: 'senior',
  experienceBand: '5-8',
  targetRegion: 'turkiye',
  employmentType: 'full_time',
  workMode: 'hybrid',
  isCurrentlyEmployed: true,
  searchStartedAt: '2026-01',
  searchStatus: 'employment_started',
  searchEndedAt: '2026-06',
  applicationsCount: 20,
  humanResponsesCount: 10,
  anyInterviewsCount: 6,
  hrInterviewsCount: 5,
  technicalInterviewsCount: 4,
  offersCount: 2,
  acceptedOffersCount: 1,
  employmentStartedCount: 1,
  countsAreEstimated: false,
  locale: 'tr',
  consentGranted: true,
} as const

describe('search benchmark contracts', () => {
  it('accepts the complete versioned write payload and result', () => {
    expect(searchBenchmarkCreateBodySchema.parse(validBody)).toEqual(validBody)
    expect(searchBenchmarkCreateResultSchema.parse({
      receiptId: '11111111-1111-4111-8111-111111111111',
      searchEpisodeId: '22222222-2222-4222-8222-222222222222',
      submissionCapability: null,
      replayed: false,
    })).toMatchObject({ replayed: false })
  })

  it.each([
    { searchStatus: 'ongoing', searchEndedAt: '2026-02' },
    { searchStatus: 'abandoned', searchEndedAt: null },
    { searchStartedAt: '2026-07', searchEndedAt: '2026-06' },
    { humanResponsesCount: 21 },
    { anyInterviewsCount: 11 },
    { hrInterviewsCount: 7 },
    { technicalInterviewsCount: 7 },
    { acceptedOffersCount: 3 },
    { employmentStartedCount: 2 },
    { searchStatus: 'offer_accepted', acceptedOffersCount: 0, employmentStartedCount: 0 },
    { searchStatus: 'employment_started', employmentStartedCount: 0 },
    { searchStatus: 'offer_rejected', offersCount: 0, acceptedOffersCount: 0, employmentStartedCount: 0 },
    { consentGranted: false },
    { freeNote: 'must not be accepted' },
  ])('rejects inconsistent or non-allowlisted payloads: %o', (change) => {
    expect(searchBenchmarkCreateBodySchema.safeParse({
      ...validBody,
      ...change,
    }).success).toBe(false)
  })
})
