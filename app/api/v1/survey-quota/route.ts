import type { NextRequest } from 'next/server'

import { getServerSecurityEnvironment } from '@/lib/env/server'
import { resolveCompanyExperienceActor } from '@/lib/server/company-experience/actor'
import { createPrivateJsonResponse } from '@/lib/server/intake/response'
import { createSupabaseSecurityRepository } from '@/lib/server/security/repository'
import { createSecurityService } from '@/lib/server/security/service'

const surveys = {
  'application-benchmark': {
    policy: 'anonymousApplicationBenchmark',
    windowKind: 'accepted_period',
  },
  'company-experience': {
    policy: 'anonymousCompanyExperience',
    windowKind: 'accepted_24h',
  },
  'interview-preparation': {
    policy: 'anonymousInterviewPreparation',
    windowKind: 'accepted_day',
  },
}

export async function GET(request: NextRequest) {
  const survey = request.nextUrl.searchParams.get('survey')
  const definition = survey ? surveys[survey as keyof typeof surveys] : null
  if (!definition) {
    return createPrivateJsonResponse({ error: { code: 'SURVEY_INVALID' } }, 422)
  }

  try {
    const actor = await resolveCompanyExperienceActor()
    if (actor.kind === 'authenticated') {
      return createPrivateJsonResponse({
        data: { mode: 'authenticated', unlimited: true },
      })
    }

    const environment = getServerSecurityEnvironment()
    const security = createSecurityService({
      repository: createSupabaseSecurityRepository(),
      quotaSubjectKey: environment.quotaSubjectKey,
      idempotencyKey: environment.idempotencyKey,
    })
    const quota = await security.getQuotaStatus({
      policy: definition.policy,
      windowKind: definition.windowKind,
      counter: 'accepted',
      subjectId: actor.dataSubjectId,
    })

    return createPrivateJsonResponse({
      data: {
        mode: 'anonymous',
        limit: quota.limit,
        remaining: quota.remaining,
        resetsAt: quota.expiresAt,
      },
    })
  } catch {
    return createPrivateJsonResponse({ error: { code: 'QUOTA_STATUS_UNAVAILABLE' } }, 503)
  }
}
