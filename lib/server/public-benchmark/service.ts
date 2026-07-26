import 'server-only'

import type { PublicBenchmarkReport } from '@/lib/public-benchmark/contracts'
import {
  PublicBenchmarkPersistenceError,
  PublicBenchmarkServiceError,
} from '@/lib/public-benchmark/errors'
import {
  createSupabasePublicBenchmarkRepository,
  type PublicBenchmarkRepository,
} from '@/lib/server/public-benchmark/repository'

export type { PublicBenchmarkRepository } from '@/lib/server/public-benchmark/repository'

export function createPublicBenchmarkService(
  repository: PublicBenchmarkRepository,
) {
  return {
    async getReport(): Promise<PublicBenchmarkReport> {
      try {
        return await repository.getReport()
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
