import 'server-only'

import { cookies } from 'next/headers'

import { getServerSecurityEnvironment } from '@/lib/env/server'
import { resolveActiveAccount } from '@/lib/server/auth/session'
import {
  createSupabaseIntakeRepository,
  type IntakeRepository,
} from '@/lib/server/intake/repository'
import {
  hmacValue,
  respondentTokenHmacs,
  type RespondentKeyRing,
} from '@/lib/server/security/crypto'
import {
  isValidRespondentToken,
  resolveAnonymousRespondent,
  RESPONDENT_COOKIE_NAME,
  type RespondentCookieStore,
} from '@/lib/server/security/respondent'

type MutableRespondentCookieStore = RespondentCookieStore & {
  delete(name: string): void
}

type BridgeDependencies = {
  cookieStore: MutableRespondentCookieStore
  repository: Pick<
    IntakeRepository,
    'mergeAnonymousSubject' | 'resolveAuthenticatedSubject'
  >
  respondentKeys: RespondentKeyRing
  quotaSubjectKey: string
  resolveAccount: typeof resolveActiveAccount
  resolveAnonymous: typeof resolveAnonymousRespondent
}

export type AuthIntakeBridgeResult =
  | 'already_reconciled'
  | 'merged'
  | 'no_account'
  | 'no_anonymous_cookie'
  | 'retry_pending'

function quotaSubjectHmac(secret: string, dataSubjectId: string) {
  return hmacValue(
    secret,
    'quota-subject:data-subject:v1',
    dataSubjectId,
  )
}

export function createAuthIntakeBridge(dependencies: BridgeDependencies) {
  return {
    async reconcile(input: {
      authUserId?: string
    } = {}): Promise<AuthIntakeBridgeResult> {
      const cookieToken = dependencies.cookieStore.get(
        RESPONDENT_COOKIE_NAME,
      )?.value

      if (!cookieToken) return 'no_anonymous_cookie'
      if (!isValidRespondentToken(cookieToken)) {
        dependencies.cookieStore.delete(RESPONDENT_COOKIE_NAME)
        return 'no_anonymous_cookie'
      }

      try {
        const authUserId =
          input.authUserId ?? (await dependencies.resolveAccount())?.userId
        if (!authUserId) return 'no_account'

        const anonymous = await dependencies.resolveAnonymous({
          cookieStore: dependencies.cookieStore,
        })
        const authenticatedDataSubjectId =
          await dependencies.repository.resolveAuthenticatedSubject(authUserId)
        if (!authenticatedDataSubjectId) return 'retry_pending'

        const anonymousHmacs = respondentTokenHmacs(
          cookieToken,
          dependencies.respondentKeys,
        )
        const result = await dependencies.repository.mergeAnonymousSubject({
          authUserId,
          activeAnonymousHmac: anonymousHmacs.active.hmac,
          previousAnonymousHmac: anonymousHmacs.previous?.hmac ?? null,
          anonymousQuotaSubjectHmac: quotaSubjectHmac(
            dependencies.quotaSubjectKey,
            anonymous.dataSubjectId,
          ),
          authenticatedQuotaSubjectHmac: quotaSubjectHmac(
            dependencies.quotaSubjectKey,
            authenticatedDataSubjectId,
          ),
        })

        if (result.data_subject_id !== authenticatedDataSubjectId) {
          return 'retry_pending'
        }

        dependencies.cookieStore.delete(RESPONDENT_COOKIE_NAME)
        return result.merged ? 'merged' : 'already_reconciled'
      } catch {
        // Authentication remains valid. Keeping the cookie makes the merge
        // retry-safe at the next authenticated boundary.
        return 'retry_pending'
      }
    },
  }
}

/* v8 ignore start -- request-scoped production composition */
export async function reconcileAnonymousSubjectForActiveAccount(input?: {
  authUserId?: string
}) {
  try {
    const environment = getServerSecurityEnvironment()
    const cookieStore = (await cookies()) as MutableRespondentCookieStore
    return createAuthIntakeBridge({
      cookieStore,
      repository: createSupabaseIntakeRepository(),
      respondentKeys: environment.respondentKeys,
      quotaSubjectKey: environment.quotaSubjectKey,
      resolveAccount: resolveActiveAccount,
      resolveAnonymous: resolveAnonymousRespondent,
    }).reconcile(input)
  } catch {
    return 'retry_pending'
  }
}
/* v8 ignore stop */
