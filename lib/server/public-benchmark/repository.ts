import 'server-only'

import {
  publicBenchmarkReportSchema,
  companyProcessReportSchema,
  companyProcessContextReportSchema,
  publicRoleBenchmarkReportSchema,
  type PublicBenchmarkReport,
  type PublicRoleBenchmarkReport,
} from '@/lib/public-benchmark/contracts'
import { PublicBenchmarkPersistenceError } from '@/lib/public-benchmark/errors'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export interface PublicBenchmarkRepository {
  getReport(options?: PublicBenchmarkReportQuery): Promise<PublicBenchmarkReport>
  getRoleReport(minimumSample?: number): Promise<PublicRoleBenchmarkReport>
}

export interface PublicBenchmarkReportQuery {
  minimumSample?: number
  roleOffset?: number
  roleLimit?: number
}

function normalizePublicThresholds(data: unknown) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data

  const report = data as Record<string, unknown>
  const meta = report.meta
  const activityTiming = report.activityTiming
  const activityMeta = activityTiming
    && typeof activityTiming === 'object'
    && !Array.isArray(activityTiming)
    ? (activityTiming as Record<string, unknown>).meta
    : null

  return {
    ...report,
    meta: meta && typeof meta === 'object' && !Array.isArray(meta)
      ? {
          ...(meta as Record<string, unknown>),
          minPublicCohortSize: Math.max(10, Number((meta as Record<string, unknown>).minPublicCohortSize)),
          minSalarySampleSize: Math.max(10, Number((meta as Record<string, unknown>).minSalarySampleSize)),
        }
      : meta,
    activityTiming: activityTiming
      && typeof activityTiming === 'object'
      && !Array.isArray(activityTiming)
      ? {
          ...(activityTiming as Record<string, unknown>),
          meta: activityMeta && typeof activityMeta === 'object' && !Array.isArray(activityMeta)
            ? {
                ...(activityMeta as Record<string, unknown>),
                minimumPublicSample: Math.max(10, Number((activityMeta as Record<string, unknown>).minimumPublicSample)),
              }
            : activityMeta,
        }
      : activityTiming,
  }
}

export function createSupabasePublicBenchmarkRepository():
PublicBenchmarkRepository {
  const client = createAdminSupabaseClient()

  return {
    async getReport(options) {
      const minimumSample = options?.minimumSample ?? 1
      const roleOffset = options?.roleOffset ?? 0
      const roleLimit = options?.roleLimit ?? 100
      const [
        { data, error },
        { data: companyProcessData, error: companyProcessError },
        { data: companyContextData, error: companyContextError },
      ] = await Promise.all([
        client.rpc('get_public_benchmark_report_v1', {
          p_min_cohort_size: minimumSample,
          p_months: 6,
          p_role_offset: roleOffset,
          p_role_limit: roleLimit,
        }),
        client.rpc('get_company_process_report_v1', {
          p_min_cohort_size: minimumSample,
          p_months: 6,
        }),
        client.rpc('get_company_process_context_report_v1', {
          p_min_cohort_size: minimumSample,
          p_months: 6,
        }),
      ])

      if (error || companyProcessError || companyContextError) throw new PublicBenchmarkPersistenceError()

      const companyProcess = companyProcessReportSchema.safeParse(companyProcessData)
      const companyContext = companyProcessContextReportSchema.safeParse(companyContextData)
      if (!companyProcess.success || !companyContext.success) throw new PublicBenchmarkPersistenceError()
      const contextsByCompany = new Map(
        companyContext.data.rows.map((row) => [row.id, row.contexts]),
      )

      const result = publicBenchmarkReportSchema.safeParse(
        normalizePublicThresholds({
          ...(data as Record<string, unknown>),
          companyResponsivenessMeta: companyProcess.data.meta,
          companyResponsiveness: companyProcess.data.rows.map((row) => ({
            ...row,
            contexts: contextsByCompany.get(row.id) ?? [],
          })),
        }),
      )
      if (!result.success) throw new PublicBenchmarkPersistenceError()

      return result.data
    },
    async getRoleReport(minimumSample = 1) {
      const { data, error } = await client.rpc(
        'get_public_role_benchmark_report_v1',
        {
          p_min_cohort_size: minimumSample,
          p_months: 6,
        },
      )

      if (error) throw new PublicBenchmarkPersistenceError()

      const result = publicRoleBenchmarkReportSchema.safeParse(data)
      if (!result.success) throw new PublicBenchmarkPersistenceError()

      return result.data
    },
  }
}
