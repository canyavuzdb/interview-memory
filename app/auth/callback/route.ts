import type { NextRequest } from 'next/server'

import {
  getLoginPath,
  getSignedInPath,
  resolveAuthLocale,
  sanitizeAuthNextPath,
} from '@/lib/auth/navigation'
import { getPublicSiteUrl } from '@/lib/env/public'
import { createSupabaseAuthGateway } from '@/lib/server/auth/gateway'
import { createAuthRedirect } from '@/lib/server/auth/response'
import { createAuthService } from '@/lib/server/auth/service'

export async function GET(request: NextRequest) {
  const parameters = request.nextUrl.searchParams
  const locale = resolveAuthLocale(parameters.get('locale'))
  const next = sanitizeAuthNextPath(parameters.get('next'), locale)
  const siteUrl = getPublicSiteUrl()

  try {
    const service = createAuthService(await createSupabaseAuthGateway(), {
      siteUrl,
    })
    await service.exchangeCode(parameters.get('code'))

    return createAuthRedirect(
      new URL(getSignedInPath(next), `${siteUrl}/`).toString(),
    )
  } catch {
    const loginPath = getLoginPath(locale, { status: 'callbackFailed' })

    return createAuthRedirect(new URL(loginPath, `${siteUrl}/`).toString())
  }
}
