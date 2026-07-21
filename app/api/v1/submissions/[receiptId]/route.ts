import type { NextRequest } from 'next/server'

import { getServerIntakeEnvironment } from '@/lib/env/server'
import { IntakeServiceError } from '@/lib/intake/errors'
import { resolveActiveAccount } from '@/lib/server/auth/session'
import { createSupabaseIntakeRepository } from '@/lib/server/intake/repository'
import { createPrivateJsonResponse } from '@/lib/server/intake/response'
import { createIntakeService } from '@/lib/server/intake/service'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ receiptId: string }> },
) {
  const { receiptId } = await context.params
  const authorization = request.headers.get('authorization')
  const repository = createSupabaseIntakeRepository()
  let requesterDataSubjectId: string | null = null

  try {
    const account = await resolveActiveAccount()
    if (account) {
      requesterDataSubjectId = await repository.resolveAuthenticatedSubject(
        account.userId,
      )
    }
  } catch {
    if (!authorization) {
      return createPrivateJsonResponse(
        { error: { code: 'SUBMISSION_AUTHORIZATION_INVALID' } },
        401,
      )
    }
  }

  try {
    const service = createIntakeService({
      repository,
      capabilityKeys: getServerIntakeEnvironment().capabilityKeys,
    })
    const receipt = await service.getSubmissionReceipt({
      receiptId,
      authorization,
      requesterDataSubjectId,
    })
    return createPrivateJsonResponse({ data: receipt })
  } catch (error) {
    if (error instanceof IntakeServiceError) {
      if (error.code === 'SUBMISSION_AUTHORIZATION_INVALID') {
        return createPrivateJsonResponse({ error: { code: error.code } }, 401)
      }
      if (error.code === 'SUBMISSION_RECEIPT_NOT_FOUND') {
        return createPrivateJsonResponse({ error: { code: error.code } }, 404)
      }
    }
    return createPrivateJsonResponse(
      { error: { code: 'SUBMISSION_RECEIPT_READ_FAILED' } },
      500,
    )
  }
}
