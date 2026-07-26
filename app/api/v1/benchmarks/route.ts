import { NextResponse } from 'next/server'

import { PublicBenchmarkServiceError } from '@/lib/public-benchmark/errors'
import { createDefaultPublicBenchmarkService } from '@/lib/server/public-benchmark/service'

const publicHeaders = {
  'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  'Content-Type': 'application/json; charset=utf-8',
}

export async function GET() {
  try {
    const report = await createDefaultPublicBenchmarkService().getReport()
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
