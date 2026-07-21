import 'server-only'

import { SearchBenchmarkServiceError } from '@/lib/search-benchmark/errors'
import { resolveActiveAccount } from '@/lib/server/auth/session'
import type { IntakeRepository } from '@/lib/server/intake/repository'
import { createSupabaseIntakeRepository } from '@/lib/server/intake/repository'
import { resolveAnonymousRespondent } from '@/lib/server/security/respondent'

export type SearchBenchmarkActor = {
  kind: 'anonymous' | 'authenticated'
  dataSubjectId: string
}

type ActorDependencies = {
  resolveAccount: typeof resolveActiveAccount
  intakeRepository: Pick<IntakeRepository, 'resolveAuthenticatedSubject'>
  resolveAnonymous: typeof resolveAnonymousRespondent
}

export async function resolveSearchBenchmarkActor(
  dependencies?: Partial<ActorDependencies>,
): Promise<SearchBenchmarkActor> {
  /* v8 ignore start -- production composition defaults; behavior is tested through injected adapters */
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
    throw new SearchBenchmarkServiceError(
      'SEARCH_BENCHMARK_ACTOR_RESOLUTION_FAILED',
    )
  }

  if (account) {
    let dataSubjectId: string | null
    try {
      dataSubjectId = await intakeRepository.resolveAuthenticatedSubject(
        account.userId,
      )
    } catch {
      throw new SearchBenchmarkServiceError(
        'SEARCH_BENCHMARK_ACTOR_RESOLUTION_FAILED',
      )
    }

    if (!dataSubjectId) {
      throw new SearchBenchmarkServiceError(
        'SEARCH_BENCHMARK_AUTHENTICATED_SUBJECT_NOT_FOUND',
      )
    }

    return { kind: 'authenticated', dataSubjectId }
  }

  try {
    const respondent = await resolveAnonymous()
    return {
      kind: 'anonymous',
      dataSubjectId: respondent.dataSubjectId,
    }
  } catch {
    throw new SearchBenchmarkServiceError(
      'SEARCH_BENCHMARK_ACTOR_RESOLUTION_FAILED',
    )
  }
}
