import { describe, expect, it, vi } from 'vitest'

import { AuthPersistenceError } from '@/lib/auth/errors'
import { createSupabaseAccountRepository } from '@/lib/server/auth/repository'

const record = {
  user_id: 'a4000000-0000-4000-8000-000000000001',
  locale: 'tr',
  timezone: 'Europe/Istanbul',
  onboarding_status: 'pending',
  account_status: 'active',
  version: 1,
}

function createClient(result: unknown) {
  return {
    rpc: vi.fn().mockResolvedValue(result),
  }
}

describe('Supabase account repository', () => {
  it('returns the validated self-only account record', async () => {
    const client = createClient({ data: [record], error: null })
    const repository = createSupabaseAccountRepository(client as never)

    await expect(repository.getMyAccount()).resolves.toEqual(record)
    expect(client.rpc).toHaveBeenCalledWith('get_my_account_v1')
  })

  it.each([{ data: [], error: null }, { data: null, error: null }])(
    'returns null for an empty RPC result',
    async (result) => {
      const repository = createSupabaseAccountRepository(
        createClient(result) as never,
      )

      await expect(repository.getMyAccount()).resolves.toBeNull()
    },
  )

  it('maps database failures to a stable persistence error', async () => {
    const repository = createSupabaseAccountRepository(
      createClient({ data: null, error: { message: 'private detail' } }) as never,
    )

    await expect(repository.getMyAccount()).rejects.toEqual(
      new AuthPersistenceError('ACCOUNT_READ_FAILED'),
    )
  })

  it('rejects an invalid database projection', async () => {
    const repository = createSupabaseAccountRepository(
      createClient({
        data: [{ ...record, account_status: 'suspended' }],
        error: null,
      }) as never,
    )

    await expect(repository.getMyAccount()).rejects.toEqual(
      new AuthPersistenceError('ACCOUNT_RESPONSE_INVALID'),
    )
  })
})
