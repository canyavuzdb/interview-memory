import { describe, expect, it } from 'vitest'

import {
  createEmptyPublicBenchmarkReport,
  publicBenchmarkReportSchema,
} from '@/lib/public-benchmark/contracts'

describe('public benchmark contracts', () => {
  it('creates a valid collecting report without suppressed counts', () => {
    const report = createEmptyPublicBenchmarkReport(
      'collecting',
      new Date('2026-07-26T12:00:00.000Z'),
    )

    expect(publicBenchmarkReportSchema.parse(report)).toMatchObject({
      meta: {
        status: 'collecting',
        periodStart: '2026-02',
        periodEnd: '2026-07',
        recordCount: 0,
        uniqueCandidates: 0,
      },
      roleMonthly: [],
      companyFunnel: [],
    })
  })

  it('rejects thresholds below ten and malformed raw fields', () => {
    const report = createEmptyPublicBenchmarkReport('unavailable')

    expect(publicBenchmarkReportSchema.safeParse({
      ...report,
      meta: { ...report.meta, minPublicCohortSize: 9 },
    }).success).toBe(false)
    expect(publicBenchmarkReportSchema.safeParse({
      ...report,
      dataSubjectId: 'private',
    }).success).toBe(false)
  })
})
