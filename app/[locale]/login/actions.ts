'use server'

import { redirect } from 'next/navigation'

import {
  authErrorState,
  authSuccessState,
  type AuthActionState,
} from '@/lib/auth/action-state'
import {
  getDefaultAccountPath,
  getLoginPath,
  getSignedInPath,
  resolveAuthLocale,
  sanitizeAuthNextPath,
} from '@/lib/auth/navigation'
import { getPublicSiteUrl } from '@/lib/env/public'
import { createSupabaseAuthGateway } from '@/lib/server/auth/gateway'
import { createAuthService } from '@/lib/server/auth/service'

async function createService() {
  return createAuthService(await createSupabaseAuthGateway(), {
    siteUrl: getPublicSiteUrl(),
  })
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const locale = resolveAuthLocale(formData.get('locale'))
  const next = sanitizeAuthNextPath(formData.get('next'), locale)

  try {
    const service = await createService()
    await service.signIn({
      email: formData.get('email'),
      password: formData.get('password'),
      locale,
      next,
    })
  } catch (error) {
    return authErrorState(error, 'signInFailed')
  }

  redirect(getSignedInPath(next))
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const locale = resolveAuthLocale(formData.get('locale'))
  let hasSession = false

  try {
    const service = await createService()
    const result = await service.signUp({
      email: formData.get('email'),
      password: formData.get('password'),
      locale,
    })
    hasSession = result.hasSession
  } catch (error) {
    return authErrorState(error, 'signUpFailed')
  }

  if (hasSession) {
    redirect(getSignedInPath(getDefaultAccountPath(locale)))
  }

  return authSuccessState('checkEmail')
}

export async function googleSignInAction(formData: FormData) {
  const locale = resolveAuthLocale(formData.get('locale'))
  const next = sanitizeAuthNextPath(formData.get('next'), locale)
  let authorizationUrl: string

  try {
    const service = await createService()
    authorizationUrl = await service.startGoogle({ locale, next })
  } catch {
    redirect(getLoginPath(locale, { status: 'oauthFailed' }))
  }

  redirect(authorizationUrl)
}
