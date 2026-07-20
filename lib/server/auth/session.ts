import 'server-only'

import { z } from 'zod'

import {
  accountContextDtoSchema,
  type AccountContextDto,
} from '@/lib/auth/contracts'
import {
  AuthPersistenceError,
  AuthSessionError,
} from '@/lib/auth/errors'
import type { AccountContextRecord } from '@/lib/database/database.types'
import {
  createSupabaseAccountRepository,
  type AccountRepository,
} from '@/lib/server/auth/repository'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const verifiedClaimsSchema = z.object({
  sub: z.uuid(),
})

type AccountSessionDependencies = {
  getClaims: () => Promise<unknown | null>
  repository: AccountRepository
}

function mapAccountRecord(record: AccountContextRecord): AccountContextDto {
  return accountContextDtoSchema.parse({
    userId: record.user_id,
    locale: record.locale,
    timezone: record.timezone,
    onboardingStatus: record.onboarding_status,
    accountStatus: record.account_status,
    version: record.version,
  })
}

export function createAccountSessionResolver({
  getClaims,
  repository,
}: AccountSessionDependencies) {
  return {
    async resolve(): Promise<AccountContextDto | null> {
      let claimsPayload: unknown | null

      try {
        claimsPayload = await getClaims()
      } catch {
        return null
      }

      const claims = verifiedClaimsSchema.safeParse(claimsPayload)

      if (!claims.success) return null

      let record: AccountContextRecord | null

      try {
        record = await repository.getMyAccount()
      } catch (error) {
        if (error instanceof AuthPersistenceError) {
          throw new AuthSessionError(error.code)
        }

        throw new AuthSessionError('ACCOUNT_READ_FAILED')
      }

      if (!record) return null

      let account: AccountContextDto

      try {
        account = mapAccountRecord(record)
      } catch {
        throw new AuthSessionError('ACCOUNT_RESPONSE_INVALID')
      }

      if (account.userId !== claims.data.sub) {
        throw new AuthSessionError('ACCOUNT_RESPONSE_INVALID')
      }

      return account
    },
  }
}

export async function resolveActiveAccount(): Promise<AccountContextDto | null> {
  const client = await createServerSupabaseClient()
  const repository = createSupabaseAccountRepository(client)
  const resolver = createAccountSessionResolver({
    repository,
    async getClaims() {
      const { data, error } = await client.auth.getClaims()

      return error ? null : data?.claims ?? null
    },
  })

  return resolver.resolve()
}
