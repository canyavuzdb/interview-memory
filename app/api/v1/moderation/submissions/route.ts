import type { NextRequest } from 'next/server'

import { ModerationServiceError } from '@/lib/moderation/errors'
import { createPrivateJsonResponse } from '@/lib/server/intake/response'
import { resolveModerationActor } from '@/lib/server/moderation/actor'
import { createDefaultModerationService } from '@/lib/server/moderation/service'

function errorResponse(code: string, status: number) {
  return createPrivateJsonResponse({ error: { code } }, status)
}

function mapError(error: ModerationServiceError) {
  switch (error.code) {
    case 'MODERATION_AUTHENTICATION_REQUIRED':
      return errorResponse(error.code, 401)
    case 'MODERATION_FORBIDDEN':
      return errorResponse(error.code, 403)
    case 'MODERATION_QUERY_INVALID':
      return errorResponse(error.code, 400)
    default:
      return errorResponse('MODERATION_READ_FAILED', 500)
  }
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams
  const query = {
    qualityStatus: search.get('qualityStatus') ?? undefined,
    surveyType: search.get('surveyType'),
    limit: search.get('limit') ?? undefined,
    beforeSubmittedAt: search.get('beforeSubmittedAt'),
    beforeSubmissionId: search.get('beforeSubmissionId'),
  }

  try {
    const actor = await resolveModerationActor()
    const result = await createDefaultModerationService().list({ actor, query })
    return createPrivateJsonResponse({ data: result }, 200)
  } catch (error) {
    if (error instanceof ModerationServiceError) return mapError(error)
    return errorResponse('MODERATION_READ_FAILED', 500)
  }
}
