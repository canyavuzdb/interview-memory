import type { NextRequest } from 'next/server'

import { applicationOutcomeIdempotencyKeySchema } from '@/lib/application-outcome/contracts'
import { ApplicationOutcomeServiceError } from '@/lib/application-outcome/errors'
import { resolveApplicationOutcomeActor } from '@/lib/server/application-outcome/actor'
import { createDefaultApplicationOutcomeService } from '@/lib/server/application-outcome/service'
import { createPrivateJsonResponse } from '@/lib/server/intake/response'

const MAX_BODY_BYTES = 4 * 1024

function errorResponse(code: string, status: number, retryAfter?: number) {
  const response = createPrivateJsonResponse({ error: { code } }, status)
  if (retryAfter !== undefined) {
    response.headers.set('Retry-After', String(Math.max(1, retryAfter)))
  }
  return response
}

function mapServiceError(error: ApplicationOutcomeServiceError) {
  switch (error.code) {
    case 'APPLICATION_OUTCOME_AUTHORIZATION_INVALID':
      return errorResponse(error.code, 401)
    case 'APPLICATION_OUTCOME_NOT_FOUND':
      return errorResponse(error.code, 404)
    case 'APPLICATION_OUTCOME_BODY_INVALID':
    case 'APPLICATION_OUTCOME_TRANSITION_INVALID':
      return errorResponse(error.code, 422)
    case 'APPLICATION_OUTCOME_IDEMPOTENCY_CONFLICT':
    case 'APPLICATION_OUTCOME_IDEMPOTENCY_IN_PROGRESS':
      return errorResponse(error.code, 409, error.retryAfterSeconds)
    default:
      return errorResponse('APPLICATION_OUTCOME_WRITE_FAILED', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ applicationId: string }> },
) {
  const contentType = request.headers
    .get('content-type')
    ?.split(';', 1)[0]
    ?.trim()
    .toLowerCase()
  if (contentType !== 'application/json') {
    return errorResponse('APPLICATION_OUTCOME_CONTENT_TYPE_UNSUPPORTED', 415)
  }

  const declaredLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return errorResponse('APPLICATION_OUTCOME_BODY_TOO_LARGE', 413)
  }

  const idempotencyKey = applicationOutcomeIdempotencyKeySchema.safeParse(
    request.headers.get('idempotency-key'),
  )
  if (!idempotencyKey.success) {
    return errorResponse('APPLICATION_OUTCOME_IDEMPOTENCY_KEY_INVALID', 400)
  }

  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return errorResponse('APPLICATION_OUTCOME_BODY_INVALID', 400)
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return errorResponse('APPLICATION_OUTCOME_BODY_TOO_LARGE', 413)
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return errorResponse('APPLICATION_OUTCOME_BODY_INVALID', 400)
  }

  try {
    const actor = await resolveApplicationOutcomeActor(
      request.headers.get('authorization'),
    )
    const service = createDefaultApplicationOutcomeService()
    const result = await service.append({
      actor,
      applicationId: (await context.params).applicationId,
      idempotencyKey: idempotencyKey.data,
      body,
    })
    const response = createPrivateJsonResponse({ data: result }, 200)
    response.headers.set('Idempotency-Replayed', String(result.replayed))
    return response
  } catch (error) {
    if (error instanceof ApplicationOutcomeServiceError) {
      return mapServiceError(error)
    }
    return errorResponse('APPLICATION_OUTCOME_WRITE_FAILED', 500)
  }
}
