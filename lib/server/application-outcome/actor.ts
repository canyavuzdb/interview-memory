import 'server-only'

import { ApplicationOutcomeServiceError } from '@/lib/application-outcome/errors'
import { resolveActiveAccount } from '@/lib/server/auth/session'
import type { IntakeRepository } from '@/lib/server/intake/repository'
import { createSupabaseIntakeRepository } from '@/lib/server/intake/repository'

const capabilityAuthorizationPattern =
  /^SubmissionCapability ([A-Za-z0-9_-]{43})$/u

export type ApplicationOutcomeActor =
  | { kind: 'authenticated'; dataSubjectId: string }
  | { kind: 'capability'; capabilityToken: string }

type ActorDependencies = {
  resolveAccount: typeof resolveActiveAccount
  intakeRepository: Pick<IntakeRepository, 'resolveAuthenticatedSubject'>
}

export async function resolveApplicationOutcomeActor(
  authorization: string | null,
  dependencies?: Partial<ActorDependencies>,
): Promise<ApplicationOutcomeActor> {
  /* v8 ignore start -- production composition defaults */
  const resolveAccount = dependencies?.resolveAccount ?? resolveActiveAccount
  const intakeRepository =
    dependencies?.intakeRepository ?? createSupabaseIntakeRepository()
  /* v8 ignore stop */

  let account
  try {
    account = await resolveAccount()
  } catch {
    throw new ApplicationOutcomeServiceError(
      'APPLICATION_OUTCOME_AUTHORIZATION_INVALID',
    )
  }

  if (account) {
    let dataSubjectId: string | null
    try {
      dataSubjectId = await intakeRepository.resolveAuthenticatedSubject(
        account.userId,
      )
    } catch {
      throw new ApplicationOutcomeServiceError(
        'APPLICATION_OUTCOME_AUTHORIZATION_INVALID',
      )
    }
    if (!dataSubjectId) {
      throw new ApplicationOutcomeServiceError(
        'APPLICATION_OUTCOME_AUTHORIZATION_INVALID',
      )
    }
    return { kind: 'authenticated', dataSubjectId }
  }

  const capability = authorization?.match(capabilityAuthorizationPattern)?.[1]
  if (!capability) {
    throw new ApplicationOutcomeServiceError(
      'APPLICATION_OUTCOME_AUTHORIZATION_INVALID',
    )
  }
  return { kind: 'capability', capabilityToken: capability }
}
