import 'server-only'

import { cookies } from 'next/headers'

import { getServerSecurityEnvironment } from '@/lib/env/server'
import { SecurityServiceError } from '@/lib/security/errors'
import {
  createOpaqueToken,
  respondentTokenHmacs,
} from '@/lib/server/security/crypto'
import {
  createSupabaseSecurityRepository,
  type SecurityRepository,
} from '@/lib/server/security/repository'

export const RESPONDENT_COOKIE_NAME = '__Host-im_respondent'
const RESPONDENT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180
const respondentTokenPattern = /^[A-Za-z0-9_-]{43}$/u

type CookieStore = {
  get(name: string): { value: string } | undefined
  set(
    name: string,
    value: string,
    options: {
      httpOnly: boolean
      maxAge: number
      path: string
      sameSite: 'lax'
      secure: boolean
    },
  ): void
}

export async function resolveAnonymousRespondent(options?: {
  cookieStore?: CookieStore
  repository?: SecurityRepository
  production?: boolean
}) {
  const cookieStore = options?.cookieStore ?? ((await cookies()) as CookieStore)
  const repository =
    options?.repository ?? createSupabaseSecurityRepository()
  const environment = getServerSecurityEnvironment()
  const currentCookie = cookieStore.get(RESPONDENT_COOKIE_NAME)?.value
  const hasValidCookie = Boolean(
    currentCookie && respondentTokenPattern.test(currentCookie),
  )
  const token = hasValidCookie ? currentCookie! : createOpaqueToken()
  const tokenHmacs = respondentTokenHmacs(
    token,
    environment.respondentKeys,
  )

  try {
    const record = await repository.resolveAnonymousSubject({
      activeHmac: tokenHmacs.active.hmac,
      activeKeyVersion: tokenHmacs.active.version,
      previousHmac: tokenHmacs.previous?.hmac ?? null,
      previousKeyVersion: tokenHmacs.previous?.version ?? null,
    })

    if (!hasValidCookie || record.created || record.key_rotated) {
      cookieStore.set(RESPONDENT_COOKIE_NAME, token, {
        httpOnly: true,
        maxAge: RESPONDENT_COOKIE_MAX_AGE_SECONDS,
        path: '/',
        sameSite: 'lax',
        secure: options?.production ?? process.env.NODE_ENV === 'production',
      })
    }

    return {
      dataSubjectId: record.data_subject_id,
      created: record.created,
      keyRotated: record.key_rotated,
    }
  } catch {
    throw new SecurityServiceError('ANONYMOUS_SUBJECT_RESOLUTION_FAILED')
  }
}
