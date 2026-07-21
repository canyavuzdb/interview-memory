import { describe, expect, it } from 'vitest'
import {
  requireBase64UrlSecret,
  requireEnvironmentValue,
  requirePositiveInteger,
  requireSiteUrl,
  requireSupabasePublishableKey,
  requireSupabaseSecretKey,
  requireSupabaseUrl,
} from '@/lib/env/validation'

describe('environment validation', () => {
  it('normalizes a required value', () => {
    expect(requireEnvironmentValue('  publishable-key  ', 'PUBLIC_KEY')).toBe(
      'publishable-key',
    )
  })

  it.each([undefined, '', '   '])('rejects a missing value: %s', (value) => {
    expect(() => requireEnvironmentValue(value, 'SECRET_KEY')).toThrow(
      'Missing environment variable: SECRET_KEY',
    )
  })

  it('accepts positive integer versions and 256-bit base64url secrets', () => {
    expect(requirePositiveInteger(' 12 ', 'KEY_VERSION')).toBe(12)
    expect(
      requireBase64UrlSecret(
        Buffer.alloc(32, 7).toString('base64url'),
        'HMAC_KEY',
      ),
    ).toHaveLength(43)
  })

  it.each(['0', '-1', '1.5', '9007199254740992'])(
    'rejects invalid positive integers: %s',
    (value) => {
      expect(() => requirePositiveInteger(value, 'KEY_VERSION')).toThrow(
        'Invalid positive integer environment variable: KEY_VERSION',
      )
    },
  )

  it.each(['short', 'a'.repeat(42), 'a'.repeat(44), '+'.repeat(43)])(
    'rejects invalid 256-bit base64url secrets',
    (value) => {
      expect(() => requireBase64UrlSecret(value, 'HMAC_KEY')).toThrow(
        'Invalid 32-byte base64url secret: HMAC_KEY',
      )
    },
  )

  it.each([
    ['http://localhost:54321/', 'http://localhost:54321'],
    ['http://127.0.0.1:54321', 'http://127.0.0.1:54321'],
    ['http://[::1]:54321', 'http://[::1]:54321'],
    ['https://project.supabase.co', 'https://project.supabase.co'],
  ])('accepts and normalizes a Supabase URL: %s', (value, expected) => {
    expect(requireSupabaseUrl(` ${value} `, 'SUPABASE_URL')).toBe(expected)
  })

  it.each([
    'not-a-url',
    'ftp://project.supabase.co',
    'http://project.supabase.co',
    'https://user@project.supabase.co',
    'https://:secret@project.supabase.co',
    'https://project.supabase.co/rest/v1',
    'https://project.supabase.co?secret=value',
    'https://project.supabase.co#secret',
  ])('rejects an unsafe or invalid URL without leaking it: %s', (value) => {
    const readValue = () => requireSupabaseUrl(value, 'SUPABASE_URL')

    expect(readValue).toThrow(
      'Invalid Supabase URL in environment variable: SUPABASE_URL',
    )
    expect(readValue).not.toThrow(value)
  })

  it.each([
    ['http://localhost:3000/', 'http://localhost:3000'],
    ['http://127.0.0.1:3000', 'http://127.0.0.1:3000'],
    ['https://interview-memory.example', 'https://interview-memory.example'],
  ])('accepts a safe application origin: %s', (value, expected) => {
    expect(requireSiteUrl(value, 'NEXT_PUBLIC_SITE_URL')).toBe(expected)
  })

  it.each([
    'not-a-url',
    'http://interview-memory.example',
    'https://user@interview-memory.example',
    'https://interview-memory.example/login',
    'https://interview-memory.example?token=private',
  ])('rejects an unsafe application origin without leaking it: %s', (value) => {
    const readValue = () => requireSiteUrl(value, 'NEXT_PUBLIC_SITE_URL')

    expect(readValue).toThrow(
      'Invalid site URL in environment variable: NEXT_PUBLIC_SITE_URL',
    )
    expect(readValue).not.toThrow(value)
  })

  it('accepts only the current Supabase publishable key format', () => {
    expect(
      requireSupabasePublishableKey(
        ' sb_publishable_public-value ',
        'PUBLIC_KEY',
      ),
    ).toBe('sb_publishable_public-value')
  })

  it('accepts only the current Supabase secret key format', () => {
    expect(
      requireSupabaseSecretKey(' sb_secret_private-value ', 'SECRET_KEY'),
    ).toBe('sb_secret_private-value')
  })

  it.each([
    ['sb_secret_private-value', 'PUBLIC_KEY'],
    ['sb_publishable_', 'PUBLIC_KEY'],
    ['legacy-jwt', 'PUBLIC_KEY'],
  ])('rejects an invalid publishable key without leaking it', (value, name) => {
    const readValue = () => requireSupabasePublishableKey(value, name)

    expect(readValue).toThrow(
      'Invalid Supabase publishable key in environment variable: PUBLIC_KEY',
    )
    expect(readValue).not.toThrow(value)
  })

  it.each([
    ['sb_publishable_public-value', 'SECRET_KEY'],
    ['sb_secret_', 'SECRET_KEY'],
    ['legacy-jwt', 'SECRET_KEY'],
  ])('rejects an invalid secret key without leaking it', (value, name) => {
    const readValue = () => requireSupabaseSecretKey(value, name)

    expect(readValue).toThrow(
      'Invalid Supabase secret key in environment variable: SECRET_KEY',
    )
    expect(readValue).not.toThrow(value)
  })
})
