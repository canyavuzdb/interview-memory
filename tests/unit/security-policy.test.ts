import { describe, expect, it } from 'vitest'

import {
  loadQuotaPolicy,
  parseQuotaPolicy,
} from '@/lib/server/security/policy'

describe('quota policy loader', () => {
  it('validates, hashes, and caches the checked-in policy', () => {
    const first = loadQuotaPolicy()
    const second = loadQuotaPolicy()

    expect(first).toBe(second)
    expect(first.document.version).toBe('2026-07-21.v1')
    expect(first.hash).toMatch(/^\\x[0-9a-f]{64}$/u)
  })

  it('rejects an invalid policy before use', () => {
    expect(() => parseQuotaPolicy({ policies: {} })).toThrow(
      'QUOTA_POLICY_INVALID',
    )
  })
})
