import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSupabaseAuthGateway } from '@/lib/server/auth/gateway'
import { createServerSupabaseClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}))

function createClient() {
  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'not-exposed' } },
        error: null,
      }),
      signInWithOAuth: vi.fn().mockResolvedValue({
        data: { url: 'https://accounts.google.com/oauth' },
        error: null,
      }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({
        data: {},
        error: null,
      }),
      updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
      exchangeCodeForSession: vi.fn().mockResolvedValue({
        data: {},
        error: null,
      }),
      verifyOtp: vi.fn().mockResolvedValue({
        data: { user: { user_metadata: { locale: 'en' } } },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  }
}

describe('Supabase auth gateway', () => {
  beforeEach(() => {
    vi.mocked(createServerSupabaseClient).mockReset()
  })

  it('adapts every successful auth operation without exposing tokens', async () => {
    const client = createClient()
    vi.mocked(createServerSupabaseClient).mockResolvedValue(client as never)
    const gateway = await createSupabaseAuthGateway()

    await expect(
      gateway.signInWithPassword({
        email: 'member@example.com',
        password: 'private-password',
      }),
    ).resolves.toMatchObject({ error: null })
    await expect(
      gateway.signUp({
        email: 'member@example.com',
        password: 'private-password',
        locale: 'tr',
        redirectTo: 'https://app.example/auth/confirm',
      }),
    ).resolves.toEqual({ data: { hasSession: true }, error: null })
    await expect(
      gateway.startGoogle({ redirectTo: 'https://app.example/auth/callback' }),
    ).resolves.toEqual({
      data: { url: 'https://accounts.google.com/oauth' },
      error: null,
    })
    await expect(
      gateway.startPasswordRecovery({
        email: 'member@example.com',
        redirectTo: 'https://app.example/auth/confirm',
      }),
    ).resolves.toMatchObject({ error: null })
    await expect(
      gateway.updatePassword({ password: 'new-private-password' }),
    ).resolves.toMatchObject({ error: null })
    await expect(
      gateway.exchangeCode({ code: 'callback-code' }),
    ).resolves.toMatchObject({ error: null })
    await expect(
      gateway.verifyOtp({ tokenHash: 'token-hash', type: 'email' }),
    ).resolves.toEqual({ data: { locale: 'en' }, error: null })
    await expect(gateway.signOut()).resolves.toEqual({ data: {}, error: null })

    expect(client.auth.signUp).toHaveBeenCalledWith({
      email: 'member@example.com',
      password: 'private-password',
      options: {
        data: { locale: 'tr' },
        emailRedirectTo: 'https://app.example/auth/confirm',
      },
    })
    expect(client.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'https://app.example/auth/callback',
        skipBrowserRedirect: true,
      },
    })
    expect(client.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'member@example.com',
      { redirectTo: 'https://app.example/auth/confirm' },
    )
    expect(client.auth.updateUser).toHaveBeenCalledWith({
      password: 'new-private-password',
    })
    expect(client.auth.exchangeCodeForSession).toHaveBeenCalledWith(
      'callback-code',
    )
    expect(client.auth.verifyOtp).toHaveBeenCalledWith({
      token_hash: 'token-hash',
      type: 'email',
    })
    expect(client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' })
  })

  it('normalizes provider errors and suppresses partial auth data', async () => {
    const client = createClient()
    const error = { code: 'provider_failure', status: 429 }
    client.auth.signInWithPassword.mockResolvedValue({ data: null, error })
    client.auth.signUp.mockResolvedValue({
      data: { session: { access_token: 'partial' } },
      error,
    })
    client.auth.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://unsafe.example' },
      error,
    })
    client.auth.verifyOtp
      .mockResolvedValueOnce({ data: { user: null }, error: null })
      .mockResolvedValueOnce({ data: { user: null }, error })
    client.auth.signOut.mockResolvedValue({ error })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(client as never)
    const gateway = await createSupabaseAuthGateway()

    await expect(
      gateway.signInWithPassword({ email: 'x@example.com', password: 'x' }),
    ).resolves.toEqual({ data: null, error })
    await expect(
      gateway.signUp({
        email: 'x@example.com',
        password: 'x',
        locale: 'tr',
        redirectTo: 'https://app.example/auth/confirm',
      }),
    ).resolves.toEqual({ data: null, error })
    await expect(
      gateway.startGoogle({ redirectTo: 'https://app.example/auth/callback' }),
    ).resolves.toEqual({ data: null, error })
    await expect(
      gateway.verifyOtp({ tokenHash: 'hash', type: 'recovery' }),
    ).resolves.toEqual({ data: { locale: undefined }, error: null })
    await expect(
      gateway.verifyOtp({ tokenHash: 'hash', type: 'email' }),
    ).resolves.toEqual({ data: null, error })
    await expect(gateway.signOut()).resolves.toEqual({ data: null, error })
  })

  it('normalizes errors without optional code or status', async () => {
    const client = createClient()
    client.auth.updateUser.mockResolvedValue({ data: null, error: {} })
    client.auth.exchangeCodeForSession.mockResolvedValue({
      data: null,
      error: {},
    })
    client.auth.resetPasswordForEmail.mockResolvedValue({
      data: null,
      error: {},
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(client as never)
    const gateway = await createSupabaseAuthGateway()
    const normalizedError = { code: null, status: null }

    await expect(
      gateway.updatePassword({ password: 'private-password' }),
    ).resolves.toEqual({ data: null, error: normalizedError })
    await expect(
      gateway.exchangeCode({ code: 'code' }),
    ).resolves.toEqual({ data: null, error: normalizedError })
    await expect(
      gateway.startPasswordRecovery({
        email: 'member@example.com',
        redirectTo: 'https://app.example/auth/confirm',
      }),
    ).resolves.toEqual({ data: null, error: normalizedError })
  })

  it('reports a successful signup without a session', async () => {
    const client = createClient()
    client.auth.signUp.mockResolvedValue({ data: { session: null }, error: null })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(client as never)
    const gateway = await createSupabaseAuthGateway()

    await expect(
      gateway.signUp({
        email: 'member@example.com',
        password: 'private-password',
        locale: 'en',
        redirectTo: 'https://app.example/auth/confirm',
      }),
    ).resolves.toEqual({ data: { hasSession: false }, error: null })
  })
})
