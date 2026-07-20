import type { NextRequest } from 'next/server'

import {
  getDefaultAccountPath,
  getLoginPath,
  getResetPasswordPath,
} from '@/lib/auth/navigation'
import { getPublicSiteUrl } from '@/lib/env/public'
import { createSupabaseAuthGateway } from '@/lib/server/auth/gateway'
import { createAuthRedirect } from '@/lib/server/auth/response'
import { createAuthService } from '@/lib/server/auth/service'

export async function GET(request: NextRequest) {
  const parameters = request.nextUrl.searchParams
  const siteUrl = getPublicSiteUrl()

  try {
    const service = createAuthService(await createSupabaseAuthGateway(), {
      siteUrl,
    })
    const result = await service.verifyOtp({
      tokenHash: parameters.get('token_hash'),
      type: parameters.get('type'),
    })
    const destination =
      result.type === 'recovery'
        ? getResetPasswordPath(result.locale)
        : getDefaultAccountPath(result.locale)

    return createAuthRedirect(
      new URL(destination, `${siteUrl}/`).toString(),
    )
  } catch {
    const loginPath = getLoginPath('tr', { status: 'callbackFailed' })

    return createAuthRedirect(new URL(loginPath, `${siteUrl}/`).toString())
  }
}
