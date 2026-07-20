import 'server-only'

import type { EmailOtpType } from '@supabase/supabase-js'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export type AuthGatewayError = {
  code: string | null
  status: number | null
}

export type AuthGatewayResult<T> = {
  data: T | null
  error: AuthGatewayError | null
}

export interface AuthGateway {
  signInWithPassword(input: {
    email: string
    password: string
  }): Promise<AuthGatewayResult<unknown>>
  signUp(input: {
    email: string
    password: string
    locale: string
    redirectTo: string
  }): Promise<AuthGatewayResult<{ hasSession: boolean }>>
  startGoogle(input: {
    redirectTo: string
  }): Promise<AuthGatewayResult<{ url: string | null }>>
  startPasswordRecovery(input: {
    email: string
    redirectTo: string
  }): Promise<AuthGatewayResult<unknown>>
  updatePassword(input: {
    password: string
  }): Promise<AuthGatewayResult<unknown>>
  exchangeCode(input: { code: string }): Promise<AuthGatewayResult<unknown>>
  verifyOtp(input: {
    tokenHash: string
    type: EmailOtpType
  }): Promise<AuthGatewayResult<{ locale: unknown }>>
  signOut(): Promise<AuthGatewayResult<unknown>>
}

function normalizeError(error: {
  code?: string
  status?: number
} | null): AuthGatewayError | null {
  if (!error) return null

  return {
    code: error.code ?? null,
    status: error.status ?? null,
  }
}

export async function createSupabaseAuthGateway(): Promise<AuthGateway> {
  const client = await createServerSupabaseClient()

  return {
    async signInWithPassword(input) {
      const { data, error } = await client.auth.signInWithPassword(input)

      return { data, error: normalizeError(error) }
    },

    async signUp({ email, password, locale, redirectTo }) {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { locale },
          emailRedirectTo: redirectTo,
        },
      })

      return {
        data: error ? null : { hasSession: Boolean(data.session) },
        error: normalizeError(error),
      }
    },

    async startGoogle({ redirectTo }) {
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      })

      return {
        data: error ? null : { url: data.url },
        error: normalizeError(error),
      }
    },

    async startPasswordRecovery({ email, redirectTo }) {
      const { data, error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      return { data, error: normalizeError(error) }
    },

    async updatePassword({ password }) {
      const { data, error } = await client.auth.updateUser({ password })

      return { data, error: normalizeError(error) }
    },

    async exchangeCode({ code }) {
      const { data, error } = await client.auth.exchangeCodeForSession(code)

      return { data, error: normalizeError(error) }
    },

    async verifyOtp({ tokenHash, type }) {
      const { data, error } = await client.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      })

      return {
        data: error
          ? null
          : { locale: data.user?.user_metadata.locale },
        error: normalizeError(error),
      }
    },

    async signOut() {
      const { error } = await client.auth.signOut({ scope: 'local' })

      return { data: error ? null : {}, error: normalizeError(error) }
    },
  }
}
