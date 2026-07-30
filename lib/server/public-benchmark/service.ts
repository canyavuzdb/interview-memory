import 'server-only'

import type { PublicBenchmarkReport } from '@/lib/public-benchmark/contracts'
import {
  PublicBenchmarkPersistenceError,
  PublicBenchmarkServiceError,
} from '@/lib/public-benchmark/errors'
import {
  createSupabasePublicBenchmarkRepository,
  type PublicBenchmarkReportQuery,
  type PublicBenchmarkRepository,
} from '@/lib/server/public-benchmark/repository'

export type {
  PublicBenchmarkReportQuery,
  PublicBenchmarkRepository,
} from '@/lib/server/public-benchmark/repository'

export function createPublicBenchmarkService(
  repository: PublicBenchmarkRepository,
) {
  return {
    async getReport(options?: PublicBenchmarkReportQuery): Promise<PublicBenchmarkReport> {
      try {
        const minimumSample = options?.minimumSample ?? 1
        const [report, roleReport] = await Promise.all([
          repository.getReport(options),
          repository.getRoleReport(minimumSample),
        ])

        return {
          ...report,
          roleCohortCount: roleReport.roleCohortCount,
          roleMonthly: roleReport.roleMonthly,
        }
      } catch (error) {
        if (error instanceof PublicBenchmarkPersistenceError) {
          throw new PublicBenchmarkServiceError()
        }
        throw new PublicBenchmarkServiceError()
      }
    },
  }
}

export function createDefaultPublicBenchmarkService() {
  return createPublicBenchmarkService(
    createSupabasePublicBenchmarkRepository(),
  )
}
