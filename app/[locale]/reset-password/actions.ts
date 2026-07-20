'use server'

import { redirect } from 'next/navigation'

import {
  authErrorState,
  type AuthActionState,
} from '@/lib/auth/action-state'
import { getLoginPath, resolveAuthLocale } from '@/lib/auth/navigation'
import { getPublicSiteUrl } from '@/lib/env/public'
import { createSupabaseAuthGateway } from '@/lib/server/auth/gateway'
import { createAuthService } from '@/lib/server/auth/service'

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const locale = resolveAuthLocale(formData.get('locale'))

  try {
    const service = createAuthService(await createSupabaseAuthGateway(), {
      siteUrl: getPublicSiteUrl(),
    })
    await service.updatePassword({
      password: formData.get('password'),
      locale,
    })
    await service.signOut()
  } catch (error) {
    return authErrorState(error, 'passwordUpdateFailed')
  }

  redirect(getLoginPath(locale, { status: 'passwordUpdated' }))
}
