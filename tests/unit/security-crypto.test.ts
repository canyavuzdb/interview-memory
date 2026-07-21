import { describe, expect, it } from 'vitest'

import {
  canonicalJson,
  createOpaqueToken,
  hmacValue,
  respondentTokenHmacs,
  sha256Value,
} from '@/lib/server/security/crypto'

const activeSecret = Buffer.alloc(32, 1).toString('base64url')
const previousSecret = Buffer.alloc(32, 2).toString('base64url')

describe('security cryptography', () => {
  it('creates opaque 256-bit respondent tokens', () => {
    const first = createOpaqueToken()
    const second = createOpaqueToken()

    expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/u)
    expect(second).not.toBe(first)
    expect(Buffer.from(first, 'base64url')).toHaveLength(32)
  })

  it('separates HMAC domains and key-ring versions', () => {
    expect(hmacValue(activeSecret, 'purpose-a', 'value')).toMatch(
      /^\\x[0-9a-f]{64}$/u,
    )
    expect(hmacValue(activeSecret, 'purpose-a', 'value')).not.toBe(
      hmacValue(activeSecret, 'purpose-b', 'value'),
    )
    expect(
      respondentTokenHmacs('token', {
        active: { version: 2, secret: activeSecret },
        previous: { version: 1, secret: previousSecret },
      }),
    ).toMatchObject({ active: { version: 2 }, previous: { version: 1 } })
    expect(
      respondentTokenHmacs('token', {
        active: { version: 2, secret: activeSecret },
        previous: null,
      }).previous,
    ).toBeNull()
  })

  it('canonicalizes JSON before hashing', () => {
    expect(canonicalJson({ z: [2, null], a: { y: true, x: 'one' } })).toBe(
      '{"a":{"x":"one","y":true},"z":[2,null]}',
    )
    expect(sha256Value({ b: 2, a: 1 })).toBe(
      sha256Value({ a: 1, b: 2 }),
    )
  })
})
