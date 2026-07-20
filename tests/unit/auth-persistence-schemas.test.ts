import { describe, expect, it } from 'vitest'

import { accountContextRecordSchema } from '@/lib/server/auth/persistence.schemas'

describe('auth persistence schemas', () => {
  const record = {
    user_id: 'a4000000-0000-4000-8000-000000000001',
    locale: 'tr',
    timezone: 'Europe/Istanbul',
    onboarding_status: 'pending',
    account_status: 'active',
    version: 1,
  }

  it('accepts the fixed active account record', () => {
    expect(accountContextRecordSchema.parse(record)).toEqual(record)
  })

  it.each([
    { ...record, user_id: 'not-a-uuid' },
    { ...record, locale: 'de' },
    { ...record, timezone: '' },
    { ...record, onboarding_status: 'unknown' },
    { ...record, account_status: 'suspended' },
    { ...record, version: 0 },
    { ...record, private_column: true },
  ])('rejects an invalid or widened account record', (input) => {
    expect(accountContextRecordSchema.safeParse(input).success).toBe(false)
  })
})
