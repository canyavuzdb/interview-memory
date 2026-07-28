import type { NextRequest } from 'next/server'

import { resolveActiveAccount } from '@/lib/server/auth/session'
import { resolveCompanyExperienceActor } from '@/lib/server/company-experience/actor'
import { createDefaultInterviewPreparationService } from '@/lib/server/interview-preparation/service'
import { createPrivateJsonResponse } from '@/lib/server/intake/response'

const MAX_BODY_BYTES = 8 * 1024

export async function POST(request: NextRequest) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return createPrivateJsonResponse({ error: { code: 'CONTENT_TYPE_UNSUPPORTED' } }, 415)
  }

  let body: unknown
  try {
    const raw = await request.text()
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return createPrivateJsonResponse({ error: { code: 'BODY_TOO_LARGE' } }, 413)
    }
    body = JSON.parse(raw)
  } catch {
    return createPrivateJsonResponse({ error: { code: 'BODY_INVALID' } }, 400)
  }

  try {
    const actor = await resolveCompanyExperienceActor()
    const result = await createDefaultInterviewPreparationService().contribute(actor.dataSubjectId, body)
    return createPrivateJsonResponse({ data: result }, 201)
  } catch (error) {
    const code = error instanceof Error && error.message === 'PREPARATION_BODY_INVALID'
      ? 'BODY_INVALID'
      : 'PREPARATION_WRITE_FAILED'
    return createPrivateJsonResponse({ error: { code } }, code === 'BODY_INVALID' ? 422 : 500)
  }
}

export async function GET(request: NextRequest) {
  const account = await resolveActiveAccount()
  if (!account) return createPrivateJsonResponse({ error: { code: 'AUTH_REQUIRED' } }, 401)

  const { searchParams } = new URL(request.url)
  const companyName = searchParams.get('company')?.trim() ?? ''
  const appliedRole = searchParams.get('role')?.trim() ?? ''
  const seniority = searchParams.get('seniority')?.trim() || null
  if (companyName.length < 2 || appliedRole.length < 2) {
    return createPrivateJsonResponse({ error: { code: 'QUERY_INVALID' } }, 422)
  }

  try {
    const report = await createDefaultInterviewPreparationService().getReport({
      companyName,
      appliedRole,
      seniority,
    })
    return createPrivateJsonResponse({ data: report }, 200)
  } catch {
    return createPrivateJsonResponse({ error: { code: 'PREPARATION_REPORT_FAILED' } }, 500)
  }
}
