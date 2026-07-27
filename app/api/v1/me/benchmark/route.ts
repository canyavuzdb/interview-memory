import { NextResponse } from 'next/server'

import { PersonalBenchmarkServiceError } from '@/lib/personal-benchmark/errors'
import { resolveActiveAccount } from '@/lib/server/auth/session'
import { createDefaultPersonalBenchmarkService } from '@/lib/server/personal-benchmark/service'

export async function GET() {
  const account = await resolveActiveAccount()

  if (!account) {
    return NextResponse.json(
      { error: { code: 'AUTHENTICATION_REQUIRED' } },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  try {
    const report = await createDefaultPersonalBenchmarkService().getReport(
      account.userId,
    )
    return NextResponse.json(
      { data: report },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (error) {
    const code = error instanceof PersonalBenchmarkServiceError
      ? error.message
      : 'PERSONAL_BENCHMARK_UNAVAILABLE'

    return NextResponse.json(
      { error: { code } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
