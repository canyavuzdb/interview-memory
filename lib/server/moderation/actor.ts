import 'server-only'

import { ModerationServiceError } from '@/lib/moderation/errors'
import { resolveActiveAccount } from '@/lib/server/auth/session'

export type ModerationActor = { userId: string }

export async function resolveModerationActor(
  resolveAccount: typeof resolveActiveAccount = resolveActiveAccount,
): Promise<ModerationActor> {
  let account
  try {
    account = await resolveAccount()
  } catch {
    throw new ModerationServiceError('MODERATION_AUTHENTICATION_REQUIRED')
  }
  if (!account) {
    throw new ModerationServiceError('MODERATION_AUTHENTICATION_REQUIRED')
  }
  return { userId: account.userId }
}
