import type { NextRequest } from 'next/server'

import { moderationDecisionIdSchema } from '@/lib/moderation/contracts'
import { ModerationServiceError } from '@/lib/moderation/errors'
import { createPrivateJsonResponse } from '@/lib/server/intake/response'
import { resolveModerationActor } from '@/lib/server/moderation/actor'
import { createDefaultModerationService } from '@/lib/server/moderation/service'

const MAX_BODY_BYTES = 4 * 1024

function errorResponse(code: string, status: number) {
  return createPrivateJsonResponse({ error: { code } }, status)
}

function mapError(error: ModerationServiceError) {
  switch (error.code) {
    case 'MODERATION_AUTHENTICATION_REQUIRED':
      return errorResponse(error.code, 401)
    case 'MODERATION_FORBIDDEN':
    case 'MODERATION_SELF_REVIEW_FORBIDDEN':
      return errorResponse(error.code, 403)
    case 'MODERATION_NOT_FOUND':
      return errorResponse(error.code, 404)
    case 'MODERATION_DECISION_CONFLICT':
    case 'MODERATION_COMPANY_RESOLUTION_CONFLICT':
      return errorResponse(error.code, 409)
    case 'MODERATION_BODY_INVALID':
    case 'MODERATION_COMPANY_RESOLUTION_REQUIRED':
      return errorResponse(error.code, 422)
    default:
      return errorResponse('MODERATION_WRITE_FAILED', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ submissionId: string }> },
) {
  const contentType = request.headers
    .get('content-type')
    ?.split(';', 1)[0]
    ?.trim()
    .toLowerCase()
  if (contentType !== 'application/json') {
    return errorResponse('MODERATION_CONTENT_TYPE_UNSUPPORTED', 415)
  }

  const declaredLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return errorResponse('MODERATION_BODY_TOO_LARGE', 413)
  }

  const decisionId = moderationDecisionIdSchema.safeParse(
    request.headers.get('idempotency-key'),
  )
  if (!decisionId.success) {
    return errorResponse('MODERATION_DECISION_ID_INVALID', 400)
  }

  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return errorResponse('MODERATION_BODY_INVALID', 400)
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return errorResponse('MODERATION_BODY_TOO_LARGE', 413)
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return errorResponse('MODERATION_BODY_INVALID', 400)
  }

  try {
    const actor = await resolveModerationActor()
    const result = await createDefaultModerationService().decide({
      actor,
      submissionId: (await context.params).submissionId,
      decisionId: decisionId.data,
      body,
    })
    return createPrivateJsonResponse({ data: result }, 200)
  } catch (error) {
    if (error instanceof ModerationServiceError) return mapError(error)
    return errorResponse('MODERATION_WRITE_FAILED', 500)
  }
}
