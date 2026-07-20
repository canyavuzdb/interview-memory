'use server'

import { redirect } from 'next/navigation'

import { getLoginPath, resolveAuthLocale } from '@/lib/auth/navigation'
import { getPublicSiteUrl } from '@/lib/env/public'
import { createSupabaseAuthGateway } from '@/lib/server/auth/gateway'
import { createAuthService } from '@/lib/server/auth/service'

export async function signOutAction(formData: FormData) {
  const locale = resolveAuthLocale(formData.get('locale'))

  try {
    const service = createAuthService(await createSupabaseAuthGateway(), {
      siteUrl: getPublicSiteUrl(),
    })
    await service.signOut()
  } catch {
    redirect(getLoginPath(locale, { status: 'signOutFailed' }))
  }

  redirect(getLoginPath(locale, { status: 'signedOut' }))
}
