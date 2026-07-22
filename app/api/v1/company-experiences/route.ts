import type { NextRequest } from 'next/server'

import { companyExperienceIdempotencyKeySchema } from '@/lib/company-experience/contracts'
import { CompanyExperienceServiceError } from '@/lib/company-experience/errors'
import { resolveCompanyExperienceActor } from '@/lib/server/company-experience/actor'
import { createDefaultCompanyExperienceService } from '@/lib/server/company-experience/service'
import { createPrivateJsonResponse } from '@/lib/server/intake/response'

const MAX_BODY_BYTES = 16 * 1024

function errorResponse(code: string, status: number, retryAfter?: number) {
  const response = createPrivateJsonResponse({ error: { code } }, status)
  if (retryAfter !== undefined) {
    response.headers.set('Retry-After', String(Math.max(1, retryAfter)))
  }
  return response
}

function mapServiceError(error: CompanyExperienceServiceError) {
  switch (error.code) {
    case 'COMPANY_EXPERIENCE_BODY_INVALID':
      return errorResponse(error.code, 422)
    case 'COMPANY_EXPERIENCE_IDEMPOTENCY_CONFLICT':
    case 'COMPANY_EXPERIENCE_IDEMPOTENCY_IN_PROGRESS':
    case 'COMPANY_EXPERIENCE_DUPLICATE':
      return errorResponse(error.code, 409, error.retryAfterSeconds)
    case 'COMPANY_EXPERIENCE_QUOTA_EXCEEDED':
      return errorResponse(error.code, 429, error.retryAfterSeconds)
    case 'COMPANY_EXPERIENCE_ACTOR_RESOLUTION_FAILED':
    case 'COMPANY_EXPERIENCE_AUTHENTICATED_SUBJECT_NOT_FOUND':
    case 'COMPANY_EXPERIENCE_NOTICE_NOT_FOUND':
    case 'COMPANY_EXPERIENCE_NOTICE_READ_FAILED':
      return errorResponse(error.code, 503)
    default:
      return errorResponse('COMPANY_EXPERIENCE_WRITE_FAILED', 500)
  }
}

export async function POST(request: NextRequest) {
  const contentType = request.headers
    .get('content-type')
    ?.split(';', 1)[0]
    ?.trim()
    .toLowerCase()
  if (contentType !== 'application/json') {
    return errorResponse('COMPANY_EXPERIENCE_CONTENT_TYPE_UNSUPPORTED', 415)
  }

  const declaredLength = request.headers.get('content-length')
  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength)
    if (Number.isFinite(parsedLength) && parsedLength > MAX_BODY_BYTES) {
      return errorResponse('COMPANY_EXPERIENCE_BODY_TOO_LARGE', 413)
    }
  }

  const idempotencyKey = companyExperienceIdempotencyKeySchema.safeParse(
    request.headers.get('idempotency-key'),
  )
  if (!idempotencyKey.success) {
    return errorResponse('COMPANY_EXPERIENCE_IDEMPOTENCY_KEY_INVALID', 400)
  }

  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return errorResponse('COMPANY_EXPERIENCE_BODY_INVALID', 400)
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return errorResponse('COMPANY_EXPERIENCE_BODY_TOO_LARGE', 413)
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return errorResponse('COMPANY_EXPERIENCE_BODY_INVALID', 400)
  }

  try {
    const actor = await resolveCompanyExperienceActor()
    const service = createDefaultCompanyExperienceService()
    const result = await service.create({
      actor,
      idempotencyKey: idempotencyKey.data,
      body,
    })
    const response = createPrivateJsonResponse({ data: result }, 201)
    response.headers.set('Idempotency-Replayed', String(result.replayed))
    return response
  } catch (error) {
    if (error instanceof CompanyExperienceServiceError) {
      return mapServiceError(error)
    }
    return errorResponse('COMPANY_EXPERIENCE_WRITE_FAILED', 500)
  }
}
