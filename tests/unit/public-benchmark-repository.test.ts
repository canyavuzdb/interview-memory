import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createEmptyPublicBenchmarkReport,
  type PublicRoleBenchmarkReport,
} from '@/lib/public-benchmark/contracts'
import { PublicBenchmarkPersistenceError } from '@/lib/public-benchmark/errors'
import {
  createSupabasePublicBenchmarkRepository,
  normalizePublicThresholds,
} from '@/lib/server/public-benchmark/repository'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: vi.fn(),
}))

const rpc = vi.fn()
const report = createEmptyPublicBenchmarkReport(
  'collecting',
  new Date('2026-07-26T12:00:00.000Z'),
)
const roleReport: PublicRoleBenchmarkReport = {
  roleCohortCount: 0,
  roleMonthly: [],
}
const companyProcessReport = {
  meta: report.companyResponsivenessMeta,
  rows: [],
}
const companyContextReport = { rows: [] }
const companyProcessRow = {
  id: 'example-corp', company: 'Example Corp',
  eligibleMatureApplicationsCount: 2, respondedApplicationsCount: 1,
  hrScreenApplicationsCount: 1, noSubstantiveUpdateCount: 1,
  interviewedApplicationsCount: 1, technicalApplicationsCount: 1,
  finalApplicationsCount: 0, offeredApplicationsCount: 0,
  employmentStartedApplicationsCount: 0, postInterviewNoFollowUpCount: 0,
  contributorsCount: 2, averageTransparency: 4, averageProfessionalism: 5,
  feedbackSharedCount: 1, irrelevantQuestionCount: 0, contexts: [], roles: [],
}
const companyContext = {
  role: 'Frontend Developer', seniority: 'mid', experienceBand: '3-5',
  applicationChannel: 'linkedin', hadReferral: false, applicationsCount: 1,
  contributorsCount: 1, respondedApplicationsCount: 1, hrScreenApplicationsCount: 1,
  interviewedApplicationsCount: 1, technicalApplicationsCount: 1,
  finalApplicationsCount: 0, offeredApplicationsCount: 0,
  employmentStartedApplicationsCount: 0,
}

function mockReportResponse(input: {
  report?: unknown
  process?: unknown
  context?: unknown
  publicError?: { message: string } | null
  processError?: { message: string } | null
  contextError?: { message: string } | null
} = {}) {
  rpc
    .mockResolvedValueOnce({
      data: Object.hasOwn(input, 'report') ? input.report : report,
      error: input.publicError ?? null,
    })
    .mockResolvedValueOnce({
      data: Object.hasOwn(input, 'process') ? input.process : companyProcessReport,
      error: input.processError ?? null,
    })
    .mockResolvedValueOnce({
      data: Object.hasOwn(input, 'context') ? input.context : companyContextReport,
      error: input.contextError ?? null,
    })
}

beforeEach(() => {
  rpc.mockReset()
  vi.mocked(createAdminSupabaseClient).mockReturnValue({ rpc } as never)
})

describe('public benchmark repository', () => {
  it('leaves non-object public report payloads unchanged', () => {
    expect(normalizePublicThresholds(null)).toBeNull()
    expect(normalizePublicThresholds([])).toEqual([])
    expect(normalizePublicThresholds('private')).toBe('private')
  })

  it('uses the server-only aggregate RPC and validates the DTO', async () => {
    mockReportResponse()
    rpc.mockResolvedValueOnce({ data: roleReport, error: null })

    await expect(
      createSupabasePublicBenchmarkRepository().getReport(),
    ).resolves.toEqual(report)
    expect(rpc).toHaveBeenCalledWith('get_public_benchmark_report_v1', {
      p_min_cohort_size: 1,
      p_months: 6,
      p_role_offset: 0,
      p_role_limit: 100,
    })

    await expect(
      createSupabasePublicBenchmarkRepository().getRoleReport(),
    ).resolves.toEqual(roleReport)
    expect(rpc).toHaveBeenCalledWith('get_public_role_benchmark_report_v1', {
      p_min_cohort_size: 1,
      p_months: 6,
    })
  })

  it('fails closed for database and malformed-response failures', async () => {
    mockReportResponse({ publicError: { message: 'private' } })
    await expect(
      createSupabasePublicBenchmarkRepository().getReport(),
    ).rejects.toBeInstanceOf(PublicBenchmarkPersistenceError)

    mockReportResponse({ report: { raw: 'private' } })
    await expect(
      createSupabasePublicBenchmarkRepository().getReport(),
    ).rejects.toBeInstanceOf(PublicBenchmarkPersistenceError)
  })

  it.each([
    null,
    [],
    { ...report, meta: null },
    { ...report, activityTiming: null },
    { ...report, activityTiming: { ...report.activityTiming, meta: null } },
  ])('fails closed when a report shape cannot be normalized: %o', async (data) => {
    mockReportResponse({ report: data })

    await expect(
      createSupabasePublicBenchmarkRepository().getReport(),
    ).rejects.toBeInstanceOf(PublicBenchmarkPersistenceError)
  })

  it('fails closed for invalid dedicated role-report responses', async () => {
    rpc
      .mockResolvedValueOnce({ data: null, error: { message: 'private' } })
      .mockResolvedValueOnce({ data: { raw: 'private' }, error: null })
    const repository = createSupabasePublicBenchmarkRepository()

    await expect(repository.getRoleReport())
      .rejects.toBeInstanceOf(PublicBenchmarkPersistenceError)
    await expect(repository.getRoleReport())
      .rejects.toBeInstanceOf(PublicBenchmarkPersistenceError)
  })

  it.each([
    { processError: { message: 'private' } },
    { contextError: { message: 'private' } },
    { process: { raw: 'private' } },
    { context: { raw: 'private' } },
  ])('fails closed for invalid company process dependencies: %o', async (input) => {
    mockReportResponse(input)

    await expect(
      createSupabasePublicBenchmarkRepository().getReport(),
    ).rejects.toBeInstanceOf(PublicBenchmarkPersistenceError)
  })

  it('enriches company rows with matching contexts and normalizes public thresholds', async () => {
    const lowThresholdReport = {
      ...report,
      meta: { ...report.meta, minPublicCohortSize: 1, minSalarySampleSize: 2 },
      activityTiming: {
        ...report.activityTiming,
        meta: { ...report.activityTiming.meta, minimumPublicSample: 3 },
      },
    }
    mockReportResponse({
      report: lowThresholdReport,
      process: {
        ...companyProcessReport,
        rows: [companyProcessRow, { ...companyProcessRow, id: 'no-context' }],
      },
      context: { rows: [{ id: 'example-corp', contexts: [companyContext] }] },
    })

    await expect(createSupabasePublicBenchmarkRepository().getReport({
      minimumSample: 3, roleOffset: 2, roleLimit: 20,
    })).resolves.toMatchObject({
      meta: { minPublicCohortSize: 10, minSalarySampleSize: 10 },
      activityTiming: { meta: { minimumPublicSample: 10 } },
      companyResponsiveness: [
        { id: 'example-corp', contexts: [companyContext] },
        { id: 'no-context', contexts: [] },
      ],
    })
    expect(rpc).toHaveBeenCalledWith('get_public_benchmark_report_v1', {
      p_min_cohort_size: 3,
      p_months: 6,
      p_role_offset: 2,
      p_role_limit: 20,
    })
  })
})
