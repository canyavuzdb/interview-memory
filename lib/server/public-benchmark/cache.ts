import 'server-only'

import { unstable_cache } from 'next/cache'

import type { PublicBenchmarkReport } from '@/lib/public-benchmark/contracts'
import { createDefaultPublicBenchmarkService } from '@/lib/server/public-benchmark/service'
import type { PublicBenchmarkReportQuery } from '@/lib/server/public-benchmark/service'

export const PUBLIC_BENCHMARK_REPORT_CACHE_TAG = 'public-benchmark-report'

export function getCachedPublicBenchmarkReport(
  query: PublicBenchmarkReportQuery = {},
): Promise<PublicBenchmarkReport> {
  const minimumSample = query.minimumSample ?? 1
  const roleOffset = query.roleOffset ?? 0
  const roleLimit = query.roleLimit ?? 100

  const loadReport = unstable_cache(
    async (): Promise<PublicBenchmarkReport> => (
      Object.keys(query).length === 0
        ? createDefaultPublicBenchmarkService().getReport()
        : createDefaultPublicBenchmarkService().getReport({
          minimumSample,
          roleOffset,
          roleLimit,
        })
    ),
    ['public-benchmark-report-v14', String(minimumSample), String(roleOffset), String(roleLimit)],
    {
      revalidate: 300,
      tags: [PUBLIC_BENCHMARK_REPORT_CACHE_TAG],
    },
  )

  return loadReport()
}
