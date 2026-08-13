import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createEmptyPublicBenchmarkReport,
  type PublicRoleBenchmarkReport,
} from '@/lib/public-benchmark/contracts'
import { PublicBenchmarkPersistenceError } from '@/lib/public-benchmark/errors'
import { createSupabasePublicBenchmarkRepository } from '@/lib/server/public-benchmark/repository'
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

beforeEach(() => {
  rpc.mockReset()
  vi.mocked(createAdminSupabaseClient).mockReturnValue({ rpc } as never)
})

describe('public benchmark repository', () => {
  it('uses the server-only aggregate RPC and validates the DTO', async () => {
    rpc
      .mockResolvedValueOnce({ data: report, error: null })
      .mockResolvedValueOnce({ data: companyProcessReport, error: null })
      .mockResolvedValueOnce({ data: companyContextReport, error: null })
      .mockResolvedValueOnce({ data: roleReport, error: null })

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
    rpc
      .mockResolvedValueOnce({ data: null, error: { message: 'private' } })
      .mockResolvedValueOnce({ data: companyProcessReport, error: null })
      .mockResolvedValueOnce({ data: companyContextReport, error: null })
    await expect(
      createSupabasePublicBenchmarkRepository().getReport(),
    ).rejects.toBeInstanceOf(PublicBenchmarkPersistenceError)

    rpc
      .mockResolvedValueOnce({ data: { raw: 'private' }, error: null })
      .mockResolvedValueOnce({ data: companyProcessReport, error: null })
      .mockResolvedValueOnce({ data: companyContextReport, error: null })
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
    rpc
      .mockResolvedValueOnce({ data, error: null })
      .mockResolvedValueOnce({ data: companyProcessReport, error: null })
      .mockResolvedValueOnce({ data: companyContextReport, error: null })

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
})
