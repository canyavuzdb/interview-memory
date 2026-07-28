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
export const DEVELOPMENT_RESPONDENT_COOKIE_NAME = 'im_respondent'
const RESPONDENT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180
const respondentTokenPattern = /^[A-Za-z0-9_-]{43}$/u

export type RespondentCookieStore = {
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

export function isValidRespondentToken(
  value: string | undefined,
): value is string {
  return Boolean(value && respondentTokenPattern.test(value))
}

export function getRespondentCookieName(production: boolean) {
  return production
    ? RESPONDENT_COOKIE_NAME
    : DEVELOPMENT_RESPONDENT_COOKIE_NAME
}

export async function resolveAnonymousRespondent(options?: {
  cookieStore?: RespondentCookieStore
  repository?: SecurityRepository
  production?: boolean
}) {
  const cookieStore =
    options?.cookieStore ?? ((await cookies()) as RespondentCookieStore)
  const repository =
    options?.repository ?? createSupabaseSecurityRepository()
  const environment = getServerSecurityEnvironment()
  const production = options?.production ?? process.env.NODE_ENV === 'production'
  const cookieName = getRespondentCookieName(production)
  const currentCookie = cookieStore.get(cookieName)?.value
  const hasValidCookie = isValidRespondentToken(currentCookie)
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
      cookieStore.set(cookieName, token, {
        httpOnly: true,
        maxAge: RESPONDENT_COOKIE_MAX_AGE_SECONDS,
        path: '/',
        sameSite: 'lax',
        secure: production,
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
