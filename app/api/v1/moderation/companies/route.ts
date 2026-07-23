import type { NextRequest } from 'next/server'

import { moderationDecisionIdSchema } from '@/lib/moderation/contracts'
import { ModerationServiceError } from '@/lib/moderation/errors'
import { createPrivateJsonResponse } from '@/lib/server/intake/response'
import { resolveModerationActor } from '@/lib/server/moderation/actor'
import { createDefaultModerationService } from '@/lib/server/moderation/service'

const MAX_BODY_BYTES = 2 * 1024

function errorResponse(code: string, status: number) {
  return createPrivateJsonResponse({ error: { code } }, status)
}

function mapError(error: ModerationServiceError, operation: 'read' | 'write') {
  switch (error.code) {
    case 'MODERATION_AUTHENTICATION_REQUIRED':
      return errorResponse(error.code, 401)
    case 'MODERATION_FORBIDDEN':
      return errorResponse(error.code, 403)
    case 'MODERATION_COMPANY_QUERY_INVALID':
      return errorResponse(error.code, 400)
    case 'MODERATION_BODY_INVALID':
      return errorResponse(error.code, 422)
    case 'MODERATION_COMPANY_CONFLICT':
      return errorResponse(error.code, 409)
    default:
      return errorResponse(
        operation === 'read'
          ? 'MODERATION_READ_FAILED'
          : 'MODERATION_WRITE_FAILED',
        500,
      )
  }
}

export async function GET(request: NextRequest) {
  try {
    const actor = await resolveModerationActor()
    const result = await createDefaultModerationService().listCompanies({
      actor,
      query: {
        query: request.nextUrl.searchParams.get('query'),
        limit: request.nextUrl.searchParams.get('limit') ?? undefined,
      },
    })
    return createPrivateJsonResponse({ data: result }, 200)
  } catch (error) {
    if (error instanceof ModerationServiceError) {
      return mapError(error, 'read')
    }
    return errorResponse('MODERATION_READ_FAILED', 500)
  }
}

export async function POST(request: NextRequest) {
  const contentType = request.headers
    .get('content-type')
    ?.split(';', 1)[0]
    ?.trim()
    .toLowerCase()
  if (contentType !== 'application/json') {
    return errorResponse('MODERATION_CONTENT_TYPE_UNSUPPORTED', 415)
  }
  const companyId = moderationDecisionIdSchema.safeParse(
    request.headers.get('idempotency-key'),
  )
  if (!companyId.success) {
    return errorResponse('MODERATION_COMPANY_ID_INVALID', 400)
  }
  const declaredLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return errorResponse('MODERATION_BODY_TOO_LARGE', 413)
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
    const result = await createDefaultModerationService().createCompany({
      actor,
      companyId: companyId.data,
      body,
    })
    return createPrivateJsonResponse({ data: result }, 201)
  } catch (error) {
    if (error instanceof ModerationServiceError) {
      return mapError(error, 'write')
    }
    return errorResponse('MODERATION_WRITE_FAILED', 500)
  }
}
