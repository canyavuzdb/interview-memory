import { describe, expect, it, vi } from 'vitest'

import { AuthServiceError } from '@/lib/auth/errors'
import type { AuthGateway } from '@/lib/server/auth/gateway'
import { createAuthService } from '@/lib/server/auth/service'

function success<T>(data: T) {
  return Promise.resolve({ data, error: null })
}

function failure(code: string | null, status: number | null = null) {
  return Promise.resolve({ data: null, error: { code, status } })
}

function createGateway(overrides: Partial<AuthGateway> = {}): AuthGateway {
  return {
    signInWithPassword: vi.fn().mockReturnValue(success({})),
    signUp: vi.fn().mockReturnValue(success({ hasSession: false })),
    startGoogle: vi
      .fn()
      .mockReturnValue(success({ url: 'https://accounts.google.com/oauth' })),
    startPasswordRecovery: vi.fn().mockReturnValue(success({})),
    updatePassword: vi.fn().mockReturnValue(success({})),
    exchangeCode: vi.fn().mockReturnValue(success({})),
    verifyOtp: vi.fn().mockReturnValue(success({ locale: 'tr' })),
    signOut: vi.fn().mockReturnValue(success({})),
    ...overrides,
  }
}

function createService(gateway = createGateway()) {
  return {
    gateway,
    service: createAuthService(gateway, {
      siteUrl: 'https://interview-memory.example',
    }),
  }
}

const signInInput = {
  email: ' MEMBER@EXAMPLE.COM ',
  password: 'existing-password',
  locale: 'tr',
  next: '/tr/account',
}
const signUpInput = {
  email: 'NEW@EXAMPLE.COM',
  password: 'a-secure-password',
  locale: 'en',
}

describe('auth service', () => {
  it('normalizes and performs password sign-in', async () => {
    const { gateway, service } = createService()

    await expect(service.signIn(signInInput)).resolves.toBeUndefined()
    expect(gateway.signInWithPassword).toHaveBeenCalledWith({
      email: 'member@example.com',
      password: 'existing-password',
    })
  })

  it.each([
    ['invalid_credentials', null, 'INVALID_CREDENTIALS'],
    ['email_not_confirmed', null, 'EMAIL_CONFIRMATION_REQUIRED'],
    ['over_request_rate_limit', null, 'RATE_LIMITED'],
    [null, 429, 'RATE_LIMITED'],
    [null, 500, 'SIGN_IN_FAILED'],
  ] as const)('maps sign-in failure %s to %s', async (code, status, expected) => {
    const { service } = createService(
      createGateway({
        signInWithPassword: vi.fn().mockReturnValue(failure(code, status)),
      }),
    )

    await expect(service.signIn(signInInput)).rejects.toEqual(
      new AuthServiceError(expected),
    )
  })

  it('rejects invalid sign-in input before calling persistence', async () => {
    const { gateway, service } = createService()

    await expect(
      service.signIn({ ...signInInput, email: 'invalid' }),
    ).rejects.toThrow()
    expect(gateway.signInWithPassword).not.toHaveBeenCalled()
  })

  it.each([
    [true, 'session_created'],
    [false, 'session_missing'],
  ] as const)('returns signup session outcome for session=%s', async (hasSession, outcome) => {
    const gateway = createGateway({
      signUp: vi.fn().mockReturnValue(success({ hasSession })),
    })
    const service = createAuthService(gateway, {
      siteUrl: 'https://interview-memory.example',
    })

    await expect(service.signUp(signUpInput)).resolves.toEqual({ outcome })
    expect(gateway.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'a-secure-password',
      locale: 'en',
      redirectTo: 'https://interview-memory.example/auth/confirm',
    })
  })

  it.each(['email_exists', 'user_already_exists', 'identity_already_exists'])(
    'does not disclose an existing account for %s',
    async (code) => {
      const { service } = createService(
        createGateway({
          signUp: vi.fn().mockReturnValue(failure(code)),
        }),
      )

      await expect(service.signUp(signUpInput)).resolves.toEqual({
        outcome: 'existing_account',
      })
    },
  )

  it.each([
    ['weak_password', null, 'PASSWORD_POLICY_FAILED'],
    ['over_email_send_rate_limit', null, 'RATE_LIMITED'],
    ['private_failure', null, 'SIGN_UP_FAILED'],
  ] as const)('maps signup failure %s', async (code, status, expected) => {
    const { service } = createService(
      createGateway({ signUp: vi.fn().mockReturnValue(failure(code, status)) }),
    )

    await expect(service.signUp(signUpInput)).rejects.toEqual(
      new AuthServiceError(expected),
    )
  })

  it('creates a strict localized Google callback URL', async () => {
    const { gateway, service } = createService()

    await expect(
      service.startGoogle({
        locale: 'en',
        next: 'https://evil.example/account',
      }),
    ).resolves.toBe('https://accounts.google.com/oauth')
    expect(gateway.startGoogle).toHaveBeenCalledWith({
      redirectTo:
        'https://interview-memory.example/auth/callback?locale=en&next=%2Fen%2Faccount',
    })
  })

  it('accepts a local OAuth authorization URL', async () => {
    const { service } = createService(
      createGateway({
        startGoogle: vi.fn().mockReturnValue(
          success({ url: 'http://127.0.0.1:54321/auth/v1/authorize' }),
        ),
      }),
    )

    await expect(
      service.startGoogle({ locale: 'tr' }),
    ).resolves.toContain('127.0.0.1')
  })

  it.each([
    { data: { url: null }, error: null },
    { data: null, error: { code: 'provider_disabled', status: 400 } },
    { data: { url: 'javascript:alert(1)' }, error: null },
    { data: { url: 'ftp://accounts.example/oauth' }, error: null },
    { data: { url: 'http://evil.example/oauth' }, error: null },
  ])('rejects an unavailable or unsafe OAuth URL', async (result) => {
    const { service } = createService(
      createGateway({
        startGoogle: vi.fn().mockResolvedValue(result),
      }),
    )

    await expect(service.startGoogle({ locale: 'tr' })).rejects.toEqual(
      new AuthServiceError('OAUTH_FAILED'),
    )
  })

  it('starts password recovery without exposing account existence', async () => {
    const { gateway, service } = createService()

    await expect(
      service.startPasswordRecovery({
        email: ' MEMBER@EXAMPLE.COM ',
        locale: 'tr',
      }),
    ).resolves.toBeUndefined()
    expect(gateway.startPasswordRecovery).toHaveBeenCalledWith({
      email: 'member@example.com',
      redirectTo: 'https://interview-memory.example/auth/confirm',
    })
  })

  it.each([
    ['rate_limit_exceeded', 'RATE_LIMITED'],
    ['private_failure', 'RECOVERY_FAILED'],
  ] as const)('maps recovery error %s', async (code, expected) => {
    const { service } = createService(
      createGateway({
        startPasswordRecovery: vi.fn().mockReturnValue(failure(code)),
      }),
    )

    await expect(
      service.startPasswordRecovery({
        email: 'member@example.com',
        locale: 'tr',
      }),
    ).rejects.toEqual(new AuthServiceError(expected))
  })

  it('updates a password using only the validated password value', async () => {
    const { gateway, service } = createService()

    await expect(
      service.updatePassword({
        password: 'a-new-secure-password',
        locale: 'en',
      }),
    ).resolves.toBeUndefined()
    expect(gateway.updatePassword).toHaveBeenCalledWith({
      password: 'a-new-secure-password',
    })
  })

  it.each([
    ['weak_password', null, 'PASSWORD_POLICY_FAILED'],
    [null, 429, 'RATE_LIMITED'],
    ['private_failure', null, 'PASSWORD_UPDATE_FAILED'],
  ] as const)('maps password update error %s', async (code, status, expected) => {
    const { service } = createService(
      createGateway({
        updatePassword: vi.fn().mockReturnValue(failure(code, status)),
      }),
    )

    await expect(
      service.updatePassword({
        password: 'a-new-secure-password',
        locale: 'tr',
      }),
    ).rejects.toEqual(new AuthServiceError(expected))
  })

  it('exchanges a bounded callback code', async () => {
    const { gateway, service } = createService()

    await expect(service.exchangeCode(' callback-code ')).resolves.toBeUndefined()
    expect(gateway.exchangeCode).toHaveBeenCalledWith({ code: 'callback-code' })
  })

  it('maps failed exchange and invalid code without leaking details', async () => {
    const { service } = createService(
      createGateway({
        exchangeCode: vi.fn().mockReturnValue(failure('bad_code')),
      }),
    )

    await expect(service.exchangeCode('valid-code')).rejects.toEqual(
      new AuthServiceError('CALLBACK_FAILED'),
    )
    await expect(service.exchangeCode(null)).rejects.toThrow()
  })

  it.each([
    ['en', 'recovery', 'en'],
    ['unsupported', 'email', 'tr'],
    [null, 'signup', 'tr'],
  ] as const)('verifies %s OTP locale for %s', async (locale, type, expected) => {
    const gateway = createGateway({
      verifyOtp: vi.fn().mockReturnValue(success({ locale })),
    })
    const service = createAuthService(gateway, {
      siteUrl: 'https://interview-memory.example',
    })

    await expect(
      service.verifyOtp({ tokenHash: 'a'.repeat(32), type }),
    ).resolves.toEqual({ locale: expected, type })
  })

  it('rejects a failed or invalid OTP verification', async () => {
    const { service } = createService(
      createGateway({ verifyOtp: vi.fn().mockReturnValue(failure('expired')) }),
    )

    await expect(
      service.verifyOtp({ tokenHash: 'a'.repeat(32), type: 'email' }),
    ).rejects.toEqual(new AuthServiceError('CALLBACK_FAILED'))
    await expect(
      service.verifyOtp({ tokenHash: 'short', type: 'magiclink' }),
    ).rejects.toThrow()
  })

  it('signs out locally and maps failures', async () => {
    const { service } = createService()

    await expect(service.signOut()).resolves.toBeUndefined()

    const failedService = createService(
      createGateway({ signOut: vi.fn().mockReturnValue(failure('network')) }),
    ).service
    await expect(failedService.signOut()).rejects.toEqual(
      new AuthServiceError('SIGN_OUT_FAILED'),
    )
  })
})
