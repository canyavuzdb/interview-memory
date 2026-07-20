import { describe, expect, it } from 'vitest'

import {
  accountContextDtoSchema,
  authCallbackCodeSchema,
  authLocaleSchema,
  authOtpTokenSchema,
  authOtpTypeSchema,
  googleSignInCommandSchema,
  passwordRecoveryCommandSchema,
  passwordUpdateCommandSchema,
  signInCommandSchema,
  signOutCommandSchema,
  signUpCommandSchema,
} from '@/lib/auth/contracts'

describe('auth contracts', () => {
  it('normalizes valid sign-in and sign-up commands', () => {
    expect(
      signInCommandSchema.parse({
        email: '  MEMBER@EXAMPLE.COM ',
        password: 'existing-password',
        locale: 'tr',
      }),
    ).toEqual({
      email: 'member@example.com',
      password: 'existing-password',
      locale: 'tr',
      next: null,
    })

    expect(
      signUpCommandSchema.parse({
        email: 'NEW@EXAMPLE.COM',
        password: 'twelve-characters',
        locale: 'en',
      }),
    ).toEqual({
      email: 'new@example.com',
      password: 'twelve-characters',
      locale: 'en',
    })
  })

  it.each([
    { email: 'invalid', password: 'valid', locale: 'tr' },
    { email: 'member@example.com', password: '', locale: 'tr' },
    { email: 'member@example.com', password: 'valid', locale: 'de' },
    {
      email: 'member@example.com',
      password: 'valid',
      locale: 'tr',
      unexpected: true,
    },
  ])('rejects an invalid sign-in command', (input) => {
    expect(signInCommandSchema.safeParse(input).success).toBe(false)
  })

  it.each([
    'short',
    'x'.repeat(129),
  ])('rejects an unsafe new password length', (password) => {
    expect(
      signUpCommandSchema.safeParse({
        email: 'member@example.com',
        password,
        locale: 'tr',
      }).success,
    ).toBe(false)
    expect(
      passwordUpdateCommandSchema.safeParse({ password, locale: 'tr' })
        .success,
    ).toBe(false)
  })

  it('validates OAuth, recovery, password-update, and sign-out commands', () => {
    expect(
      googleSignInCommandSchema.parse({ locale: 'tr', next: '/tr/account' }),
    ).toEqual({ locale: 'tr', next: '/tr/account' })
    expect(
      passwordRecoveryCommandSchema.parse({
        email: ' MEMBER@EXAMPLE.COM ',
        locale: 'en',
      }),
    ).toEqual({ email: 'member@example.com', locale: 'en' })
    expect(
      passwordUpdateCommandSchema.parse({
        password: 'a-secure-password',
        locale: 'tr',
      }),
    ).toEqual({ password: 'a-secure-password', locale: 'tr' })
    expect(signOutCommandSchema.parse({ locale: 'en' })).toEqual({ locale: 'en' })
  })

  it('bounds callback and OTP inputs', () => {
    expect(authCallbackCodeSchema.parse(' code-value ')).toBe('code-value')
    expect(authOtpTokenSchema.parse('a'.repeat(16))).toHaveLength(16)
    expect(authOtpTypeSchema.parse('recovery')).toBe('recovery')
    expect(authCallbackCodeSchema.safeParse('').success).toBe(false)
    expect(authOtpTokenSchema.safeParse('short').success).toBe(false)
    expect(authOtpTypeSchema.safeParse('magiclink').success).toBe(false)
  })

  it('validates the minimal active account DTO', () => {
    const account = {
      userId: 'a4000000-0000-4000-8000-000000000001',
      locale: 'tr',
      timezone: 'Europe/Istanbul',
      onboardingStatus: 'pending',
      accountStatus: 'active',
      version: 1,
    }

    expect(accountContextDtoSchema.parse(account)).toEqual(account)
    expect(
      accountContextDtoSchema.safeParse({
        ...account,
        accountStatus: 'suspended',
      }).success,
    ).toBe(false)
    expect(authLocaleSchema.safeParse('de').success).toBe(false)
  })
})
