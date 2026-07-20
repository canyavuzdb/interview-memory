'use server'

import {
  authErrorState,
  authSuccessState,
  type AuthActionState,
} from '@/lib/auth/action-state'
import { resolveAuthLocale } from '@/lib/auth/navigation'
import { getPublicSiteUrl } from '@/lib/env/public'
import { createSupabaseAuthGateway } from '@/lib/server/auth/gateway'
import { createAuthService } from '@/lib/server/auth/service'

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const locale = resolveAuthLocale(formData.get('locale'))

  try {
    const service = createAuthService(await createSupabaseAuthGateway(), {
      siteUrl: getPublicSiteUrl(),
    })
    await service.startPasswordRecovery({
      email: formData.get('email'),
      locale,
    })

    return authSuccessState('recoverySent')
  } catch (error) {
    return authErrorState(error, 'recoveryFailed')
  }
}
