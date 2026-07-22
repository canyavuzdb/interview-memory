import 'server-only'

import { CompanyExperienceServiceError } from '@/lib/company-experience/errors'
import { resolveActiveAccount } from '@/lib/server/auth/session'
import type { IntakeRepository } from '@/lib/server/intake/repository'
import { createSupabaseIntakeRepository } from '@/lib/server/intake/repository'
import { resolveAnonymousRespondent } from '@/lib/server/security/respondent'

export type CompanyExperienceActor = {
  kind: 'anonymous' | 'authenticated'
  dataSubjectId: string
}

type ActorDependencies = {
  resolveAccount: typeof resolveActiveAccount
  intakeRepository: Pick<IntakeRepository, 'resolveAuthenticatedSubject'>
  resolveAnonymous: typeof resolveAnonymousRespondent
}

export async function resolveCompanyExperienceActor(
  dependencies?: Partial<ActorDependencies>,
): Promise<CompanyExperienceActor> {
  /* v8 ignore start -- production composition defaults */
  const resolveAccount = dependencies?.resolveAccount ?? resolveActiveAccount
  const intakeRepository =
    dependencies?.intakeRepository ?? createSupabaseIntakeRepository()
  const resolveAnonymous =
    dependencies?.resolveAnonymous ?? resolveAnonymousRespondent
  /* v8 ignore stop */

  let account
  try {
    account = await resolveAccount()
  } catch {
    throw new CompanyExperienceServiceError(
      'COMPANY_EXPERIENCE_ACTOR_RESOLUTION_FAILED',
    )
  }

  if (account) {
    let dataSubjectId: string | null
    try {
      dataSubjectId = await intakeRepository.resolveAuthenticatedSubject(
        account.userId,
      )
    } catch {
      throw new CompanyExperienceServiceError(
        'COMPANY_EXPERIENCE_ACTOR_RESOLUTION_FAILED',
      )
    }
    if (!dataSubjectId) {
      throw new CompanyExperienceServiceError(
        'COMPANY_EXPERIENCE_AUTHENTICATED_SUBJECT_NOT_FOUND',
      )
    }
    return { kind: 'authenticated', dataSubjectId }
  }

  try {
    const respondent = await resolveAnonymous()
    return { kind: 'anonymous', dataSubjectId: respondent.dataSubjectId }
  } catch {
    throw new CompanyExperienceServiceError(
      'COMPANY_EXPERIENCE_ACTOR_RESOLUTION_FAILED',
    )
  }
}
