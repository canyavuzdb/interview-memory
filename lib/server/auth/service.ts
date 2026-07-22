import 'server-only'

import { z } from 'zod'

import {
  authCallbackCodeSchema,
  authOtpTokenSchema,
  authOtpTypeSchema,
  googleSignInCommandSchema,
  passwordRecoveryCommandSchema,
  passwordUpdateCommandSchema,
  signInCommandSchema,
  signUpCommandSchema,
  type AuthLocale,
} from '@/lib/auth/contracts'
import { AuthServiceError } from '@/lib/auth/errors'
import {
  createAbsoluteAppUrl,
  resolveAuthLocale,
  sanitizeAuthNextPath,
} from '@/lib/auth/navigation'
import type {
  AuthGateway,
  AuthGatewayError,
} from '@/lib/server/auth/gateway'

const oauthAuthorizationUrlSchema = z.url().refine((value) => {
  const url = new URL(value)
  const isSecure = url.protocol === 'https:'
  const isLocal =
    url.protocol === 'http:' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)

  return isSecure || isLocal
})
const existingAccountCodes = new Set([
  'email_exists',
  'user_already_exists',
  'identity_already_exists',
])
const rateLimitCodes = new Set([
  'over_email_send_rate_limit',
  'over_request_rate_limit',
  'over_sms_send_rate_limit',
  'rate_limit_exceeded',
])

function isRateLimited(error: AuthGatewayError): boolean {
  return error.status === 429 || Boolean(error.code && rateLimitCodes.has(error.code))
}

function throwSignInError(error: AuthGatewayError): never {
  if (isRateLimited(error)) throw new AuthServiceError('RATE_LIMITED')

  if (error.code === 'email_not_confirmed') {
    throw new AuthServiceError('EMAIL_CONFIRMATION_REQUIRED')
  }

  if (error.code === 'invalid_credentials') {
    throw new AuthServiceError('INVALID_CREDENTIALS')
  }

  throw new AuthServiceError('SIGN_IN_FAILED')
}

function throwPasswordError(
  error: AuthGatewayError,
  fallback: 'SIGN_UP_FAILED' | 'PASSWORD_UPDATE_FAILED',
): never {
  if (isRateLimited(error)) throw new AuthServiceError('RATE_LIMITED')

  if (error.code === 'weak_password') {
    throw new AuthServiceError('PASSWORD_POLICY_FAILED')
  }

  throw new AuthServiceError(fallback)
}

export function createAuthService(
  gateway: AuthGateway,
  options: { siteUrl: string },
) {
  return {
    async signIn(input: unknown): Promise<void> {
      const command = signInCommandSchema.parse(input)
      const result = await gateway.signInWithPassword({
        email: command.email,
        password: command.password,
      })

      if (result.error) throwSignInError(result.error)
    },

    async signUp(input: unknown): Promise<{
      outcome: 'existing_account' | 'session_created' | 'session_missing'
    }> {
      const command = signUpCommandSchema.parse(input)
      const result = await gateway.signUp({
        ...command,
        redirectTo: createAbsoluteAppUrl(
          options.siteUrl,
          '/auth/confirm',
        ),
      })

      if (result.error) {
        if (
          result.error.code &&
          existingAccountCodes.has(result.error.code)
        ) {
          return { outcome: 'existing_account' }
        }

        throwPasswordError(result.error, 'SIGN_UP_FAILED')
      }

      return {
        outcome: result.data?.hasSession === true
          ? 'session_created'
          : 'session_missing',
      }
    },

    async startGoogle(input: unknown): Promise<string> {
      const command = googleSignInCommandSchema.parse(input)
      const next = sanitizeAuthNextPath(command.next, command.locale)
      const callbackUrl = new URL('/auth/callback', `${options.siteUrl}/`)
      callbackUrl.searchParams.set('locale', command.locale)
      callbackUrl.searchParams.set('next', next)

      const result = await gateway.startGoogle({
        redirectTo: callbackUrl.toString(),
      })

      if (result.error || !result.data?.url) {
        throw new AuthServiceError('OAUTH_FAILED')
      }

      const authorizationUrl = oauthAuthorizationUrlSchema.safeParse(
        result.data.url,
      )

      if (!authorizationUrl.success) {
        throw new AuthServiceError('OAUTH_FAILED')
      }

      return authorizationUrl.data
    },

    async startPasswordRecovery(input: unknown): Promise<void> {
      const command = passwordRecoveryCommandSchema.parse(input)
      const redirectTo = createAbsoluteAppUrl(
        options.siteUrl,
        '/auth/confirm',
      )
      const result = await gateway.startPasswordRecovery({
        email: command.email,
        redirectTo,
      })

      if (result.error) {
        if (isRateLimited(result.error)) {
          throw new AuthServiceError('RATE_LIMITED')
        }

        throw new AuthServiceError('RECOVERY_FAILED')
      }
    },

    async updatePassword(input: unknown): Promise<void> {
      const command = passwordUpdateCommandSchema.parse(input)
      const result = await gateway.updatePassword({
        password: command.password,
      })

      if (result.error) {
        throwPasswordError(result.error, 'PASSWORD_UPDATE_FAILED')
      }
    },

    async exchangeCode(code: unknown): Promise<void> {
      const parsedCode = authCallbackCodeSchema.parse(code)
      const result = await gateway.exchangeCode({ code: parsedCode })

      if (result.error) throw new AuthServiceError('CALLBACK_FAILED')
    },

    async verifyOtp(input: {
      tokenHash: unknown
      type: unknown
    }): Promise<{ locale: AuthLocale; type: 'email' | 'signup' | 'recovery' }> {
      const tokenHash = authOtpTokenSchema.parse(input.tokenHash)
      const type = authOtpTypeSchema.parse(input.type)
      const result = await gateway.verifyOtp({ tokenHash, type })

      if (result.error) throw new AuthServiceError('CALLBACK_FAILED')

      return {
        locale: resolveAuthLocale(result.data?.locale),
        type,
      }
    },

    async signOut(): Promise<void> {
      const result = await gateway.signOut()

      if (result.error) throw new AuthServiceError('SIGN_OUT_FAILED')
    },
  }
}
