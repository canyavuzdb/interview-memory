import { describe, expect, it } from 'vitest'

import {
  canonicalJson,
  createOpaqueToken,
  deriveOpaqueToken,
  findKeyMaterial,
  hmacValue,
  respondentTokenHmacs,
  sha256Value,
  submissionCapabilityHmacs,
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

  it('derives stable opaque tokens and resolves rotation keys by version', () => {
    const ring = {
      active: { version: 2, secret: activeSecret },
      previous: { version: 1, secret: previousSecret },
    }
    const first = deriveOpaqueToken(activeSecret, 'capability', 'subject')
    expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/u)
    expect(deriveOpaqueToken(activeSecret, 'capability', 'subject')).toBe(first)
    expect(findKeyMaterial(ring, 2)).toEqual(ring.active)
    expect(findKeyMaterial(ring, 1)).toEqual(ring.previous)
    expect(findKeyMaterial(ring, 3)).toBeNull()
    expect(findKeyMaterial({ ...ring, previous: null }, 1)).toBeNull()
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

  it('uses a separate capability HMAC domain and supports rotation', () => {
    const capability = submissionCapabilityHmacs('token', {
      active: { version: 2, secret: activeSecret },
      previous: { version: 1, secret: previousSecret },
    })

    expect(capability).toMatchObject({
      active: { version: 2 },
      previous: { version: 1 },
    })
    expect(capability.active.hmac).not.toBe(
      respondentTokenHmacs('token', {
        active: { version: 2, secret: activeSecret },
        previous: null,
      }).active.hmac,
    )
    expect(
      submissionCapabilityHmacs('token', {
        active: { version: 2, secret: activeSecret },
        previous: null,
      }).previous,
    ).toBeNull()
  })
})
