import 'server-only'

import {
  publicBenchmarkReportSchema,
  type PublicBenchmarkReport,
} from '@/lib/public-benchmark/contracts'
import { PublicBenchmarkPersistenceError } from '@/lib/public-benchmark/errors'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export interface PublicBenchmarkRepository {
  getReport(): Promise<PublicBenchmarkReport>
}

export function createSupabasePublicBenchmarkRepository():
PublicBenchmarkRepository {
  const client = createAdminSupabaseClient()

  return {
    async getReport() {
      const { data, error } = await client.rpc(
        'get_public_benchmark_report_v1',
        {
          p_min_cohort_size: 10,
          p_months: 6,
        },
      )

      if (error) throw new PublicBenchmarkPersistenceError()

      const result = publicBenchmarkReportSchema.safeParse(data)
      if (!result.success) throw new PublicBenchmarkPersistenceError()

      return result.data
    },
  }
}
