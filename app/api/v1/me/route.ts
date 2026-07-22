import { resolveActiveAccount } from '@/lib/server/auth/session'
import { createPrivateJsonResponse } from '@/lib/server/intake/response'

export async function GET() {
  try {
    const account = await resolveActiveAccount()
    if (!account) {
      return createPrivateJsonResponse(
        { error: { code: 'AUTHENTICATION_REQUIRED' } },
        401,
      )
    }

    return createPrivateJsonResponse({ data: account })
  } catch {
    return createPrivateJsonResponse(
      { error: { code: 'ACCOUNT_READ_FAILED' } },
      500,
    )
  }
}
