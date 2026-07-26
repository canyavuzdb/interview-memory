import { describe, expect, it, vi } from 'vitest'

import { createEmptyPublicBenchmarkReport } from '@/lib/public-benchmark/contracts'
import {
  PublicBenchmarkPersistenceError,
  PublicBenchmarkServiceError,
} from '@/lib/public-benchmark/errors'
import {
  createDefaultPublicBenchmarkService,
  createPublicBenchmarkService,
  type PublicBenchmarkRepository,
} from '@/lib/server/public-benchmark/service'

const repositoryFactory = vi.hoisted(() => vi.fn())

vi.mock('@/lib/server/public-benchmark/repository', () => ({
  createSupabasePublicBenchmarkRepository: repositoryFactory,
}))

const report = createEmptyPublicBenchmarkReport(
  'collecting',
  new Date('2026-07-26T12:00:00.000Z'),
)

describe('public benchmark service', () => {
  it('returns the already privacy-filtered public DTO', async () => {
    const repository: PublicBenchmarkRepository = {
      getReport: vi.fn().mockResolvedValue(report),
    }

    await expect(
      createPublicBenchmarkService(repository).getReport(),
    ).resolves.toEqual(report)
  })

  it('builds the default service with the Supabase repository', async () => {
    const repository: PublicBenchmarkRepository = {
      getReport: vi.fn().mockResolvedValue(report),
    }
    repositoryFactory.mockReturnValue(repository)

    await expect(
      createDefaultPublicBenchmarkService().getReport(),
    ).resolves.toEqual(report)
    expect(repositoryFactory).toHaveBeenCalledOnce()
  })

  it.each([
    new PublicBenchmarkPersistenceError(),
    new Error('private'),
  ])('maps repository failures to one public error', async (failure) => {
    const repository: PublicBenchmarkRepository = {
      getReport: vi.fn().mockRejectedValue(failure),
    }

    await expect(
      createPublicBenchmarkService(repository).getReport(),
    ).rejects.toBeInstanceOf(PublicBenchmarkServiceError)
  })
})
