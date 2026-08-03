import { NextResponse } from 'next/server'

import { PublicBenchmarkServiceError } from '@/lib/public-benchmark/errors'
import { getCachedPublicBenchmarkReport } from '@/lib/server/public-benchmark/cache'
import { createDefaultPublicBenchmarkService } from '@/lib/server/public-benchmark/service'

const publicHeaders = {
  'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  'Content-Type': 'application/json; charset=utf-8',
}

function readInteger(value: string | null, fallback: number, minimum: number, maximum: number) {
  if (value === null) return fallback
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : fallback
}

export async function GET(request?: Request) {
  try {
    if (!request) {
      const report = await createDefaultPublicBenchmarkService().getReport()
      return NextResponse.json({ data: report }, {
        headers: publicHeaders,
        status: 200,
      })
    }

    const search = new URL(
      request?.url ?? 'http://localhost/api/v1/benchmarks',
    ).searchParams
    const report = await getCachedPublicBenchmarkReport({
      minimumSample: readInteger(search.get('minimumSample'), 1, 1, 50),
      roleOffset: readInteger(search.get('roleOffset'), 0, 0, 100_000),
      roleLimit: readInteger(search.get('roleLimit'), 100, 1, 100),
    })
    return NextResponse.json({ data: report }, {
      headers: publicHeaders,
      status: 200,
    })
  } catch (error) {
    const code = error instanceof PublicBenchmarkServiceError
      ? error.message
      : 'PUBLIC_BENCHMARK_UNAVAILABLE'

    return NextResponse.json(
      { error: { code } },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json; charset=utf-8',
        },
        status: 503,
      },
    )
  }
}
