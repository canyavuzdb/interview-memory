import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import { AuthPersistenceError } from '@/lib/auth/errors'
import type { ApiDatabase, AccountContextRecord } from '@/lib/database/database.types'
import { accountContextRecordSchema } from '@/lib/server/auth/persistence.schemas'

export interface AccountRepository {
  getMyAccount(): Promise<AccountContextRecord | null>
}

export function createSupabaseAccountRepository(
  client: SupabaseClient<ApiDatabase, 'api'>,
): AccountRepository {
  return {
    async getMyAccount() {
      const { data, error } = await client.rpc('get_my_account_v1')

      if (error) {
        throw new AuthPersistenceError('ACCOUNT_READ_FAILED')
      }

      if (!data?.[0]) return null

      const result = accountContextRecordSchema.safeParse(data[0])

      if (!result.success) {
        throw new AuthPersistenceError('ACCOUNT_RESPONSE_INVALID')
      }

      return result.data
    },
  }
}
