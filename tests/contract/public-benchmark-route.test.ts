import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from '@/app/api/v1/benchmarks/route'
import { createEmptyPublicBenchmarkReport } from '@/lib/public-benchmark/contracts'
import { PublicBenchmarkServiceError } from '@/lib/public-benchmark/errors'
import { createDefaultPublicBenchmarkService } from '@/lib/server/public-benchmark/service'

vi.mock('@/lib/server/public-benchmark/service', () => ({
  createDefaultPublicBenchmarkService: vi.fn(),
}))

const getReport = vi.fn()
const report = createEmptyPublicBenchmarkReport(
  'collecting',
  new Date('2026-07-26T12:00:00.000Z'),
)

beforeEach(() => {
  getReport.mockReset()
  vi.mocked(createDefaultPublicBenchmarkService).mockReturnValue({
    getReport,
  })
})

describe('GET /api/v1/benchmarks', () => {
  it('returns the aggregate DTO with shared-cache headers', async () => {
    getReport.mockResolvedValue(report)

    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('s-maxage=300')
    await expect(response.json()).resolves.toEqual({ data: report })
  })

  it.each([
    new PublicBenchmarkServiceError(),
    new Error('private'),
  ])('returns one non-cacheable unavailable response', async (failure) => {
    getReport.mockRejectedValue(failure)

    const response = await GET()

    expect(response.status).toBe(503)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({
      error: { code: 'PUBLIC_BENCHMARK_UNAVAILABLE' },
    })
  })
})
