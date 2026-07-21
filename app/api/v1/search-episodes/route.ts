import type { NextRequest } from 'next/server'

import { searchBenchmarkIdempotencyKeySchema } from '@/lib/search-benchmark/contracts'
import { SearchBenchmarkServiceError } from '@/lib/search-benchmark/errors'
import { createPrivateJsonResponse } from '@/lib/server/intake/response'
import { resolveSearchBenchmarkActor } from '@/lib/server/search-benchmark/actor'
import { createDefaultSearchBenchmarkService } from '@/lib/server/search-benchmark/service'

const MAX_BODY_BYTES = 16 * 1024

function errorResponse(code: string, status: number, retryAfter?: number) {
  const response = createPrivateJsonResponse({ error: { code } }, status)
  if (retryAfter !== undefined) {
    response.headers.set('Retry-After', String(Math.max(1, retryAfter)))
  }
  return response
}

function mapServiceError(error: SearchBenchmarkServiceError) {
  switch (error.code) {
    case 'SEARCH_BENCHMARK_BODY_INVALID':
    case 'SEARCH_BENCHMARK_CATALOG_INVALID':
      return errorResponse(error.code, 422)
    case 'SEARCH_BENCHMARK_IDEMPOTENCY_CONFLICT':
    case 'SEARCH_BENCHMARK_IDEMPOTENCY_IN_PROGRESS':
    case 'SEARCH_BENCHMARK_DUPLICATE':
      return errorResponse(error.code, 409, error.retryAfterSeconds)
    case 'SEARCH_BENCHMARK_QUOTA_EXCEEDED':
      return errorResponse(error.code, 429, error.retryAfterSeconds)
    case 'SEARCH_BENCHMARK_ACTOR_RESOLUTION_FAILED':
    case 'SEARCH_BENCHMARK_AUTHENTICATED_SUBJECT_NOT_FOUND':
    case 'SEARCH_BENCHMARK_NOTICE_NOT_FOUND':
    case 'SEARCH_BENCHMARK_NOTICE_READ_FAILED':
      return errorResponse(error.code, 503)
    default:
      return errorResponse('SEARCH_BENCHMARK_WRITE_FAILED', 500)
  }
}

export async function POST(request: NextRequest) {
  const contentType = request.headers
    .get('content-type')
    ?.split(';', 1)[0]
    ?.trim()
    .toLowerCase()
  if (contentType !== 'application/json') {
    return errorResponse('SEARCH_BENCHMARK_CONTENT_TYPE_UNSUPPORTED', 415)
  }

  const declaredLength = request.headers.get('content-length')
  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength)
    if (Number.isFinite(parsedLength) && parsedLength > MAX_BODY_BYTES) {
      return errorResponse('SEARCH_BENCHMARK_BODY_TOO_LARGE', 413)
    }
  }

  const idempotencyKey = searchBenchmarkIdempotencyKeySchema.safeParse(
    request.headers.get('idempotency-key'),
  )
  if (!idempotencyKey.success) {
    return errorResponse('SEARCH_BENCHMARK_IDEMPOTENCY_KEY_INVALID', 400)
  }

  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return errorResponse('SEARCH_BENCHMARK_BODY_INVALID', 400)
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return errorResponse('SEARCH_BENCHMARK_BODY_TOO_LARGE', 413)
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return errorResponse('SEARCH_BENCHMARK_BODY_INVALID', 400)
  }

  try {
    const actor = await resolveSearchBenchmarkActor()
    const service = createDefaultSearchBenchmarkService()
    const result = await service.create({
      actor,
      idempotencyKey: idempotencyKey.data,
      body,
    })
    const response = createPrivateJsonResponse({ data: result }, 201)
    response.headers.set('Idempotency-Replayed', String(result.replayed))
    return response
  } catch (error) {
    if (error instanceof SearchBenchmarkServiceError) {
      return mapServiceError(error)
    }
    return errorResponse('SEARCH_BENCHMARK_WRITE_FAILED', 500)
  }
}
