import 'server-only'

import type { PersonalBenchmarkReport } from '@/lib/personal-benchmark/contracts'
import { PersonalBenchmarkServiceError } from '@/lib/personal-benchmark/errors'
import {
  createSupabasePersonalBenchmarkRepository,
  type PersonalBenchmarkRepository,
} from '@/lib/server/personal-benchmark/repository'

export function createPersonalBenchmarkService(
  repository: PersonalBenchmarkRepository,
) {
  return {
    async getReport(authUserId: string): Promise<PersonalBenchmarkReport> {
      try {
        const report = await repository.getReport(authUserId)
        if (!report) throw new PersonalBenchmarkServiceError()
        return report
      } catch {
        throw new PersonalBenchmarkServiceError()
      }
    },
  }
}

export function createDefaultPersonalBenchmarkService() {
  return createPersonalBenchmarkService(
    createSupabasePersonalBenchmarkRepository(),
  )
}
