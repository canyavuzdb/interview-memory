import 'server-only'

import {
  publicBenchmarkReportSchema,
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

export function createSupabasePublicBenchmarkRepository():
PublicBenchmarkRepository {
  const client = createAdminSupabaseClient()

  return {
    async getReport(options) {
      const minimumSample = options?.minimumSample ?? 1
      const roleOffset = options?.roleOffset ?? 0
      const roleLimit = options?.roleLimit ?? 100
      const { data, error } = await client.rpc(
        'get_public_benchmark_report_v1',
        {
          p_min_cohort_size: minimumSample,
          p_months: 6,
          p_role_offset: roleOffset,
          p_role_limit: roleLimit,
        },
      )

      if (error) throw new PublicBenchmarkPersistenceError()

      const result = publicBenchmarkReportSchema.safeParse(data)
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
