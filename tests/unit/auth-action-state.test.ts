import { describe, expect, it } from 'vitest'

import {
  authErrorState,
  authSuccessState,
  initialAuthActionState,
} from '@/lib/auth/action-state'
import { AuthServiceError } from '@/lib/auth/errors'
import { authLocaleSchema } from '@/lib/auth/contracts'

describe('auth action state', () => {
  it('provides immutable-shaped idle and success states', () => {
    expect(initialAuthActionState).toEqual({ status: 'idle', code: null })
    expect(authSuccessState('recoverySent')).toEqual({
      status: 'success',
      code: 'recoverySent',
    })
  })

  it('maps validation failures without exposing field values', () => {
    let error: unknown

    try {
      authLocaleSchema.parse('private-invalid-value')
    } catch (caught) {
      error = caught
    }

    expect(authErrorState(error, 'fallback')).toEqual({
      status: 'error',
      code: 'invalidForm',
    })
  })

  it.each([
    ['INVALID_CREDENTIALS', 'invalidCredentials'],
    ['EMAIL_CONFIRMATION_REQUIRED', 'emailConfirmationRequired'],
    ['RATE_LIMITED', 'rateLimited'],
    ['PASSWORD_POLICY_FAILED', 'passwordPolicyFailed'],
    ['SIGN_IN_FAILED', 'signInFailed'],
    ['SIGN_UP_FAILED', 'signUpFailed'],
    ['OAUTH_FAILED', 'oauthFailed'],
    ['RECOVERY_FAILED', 'recoveryFailed'],
    ['PASSWORD_UPDATE_FAILED', 'passwordUpdateFailed'],
    ['CALLBACK_FAILED', 'callbackFailed'],
    ['SIGN_OUT_FAILED', 'signOutFailed'],
  ] as const)('maps %s to a stable public code', (code, expected) => {
    expect(authErrorState(new AuthServiceError(code), 'fallback')).toEqual({
      status: 'error',
      code: expected,
    })
  })

  it('uses the caller-owned fallback for unknown failures', () => {
    expect(authErrorState(new Error('private detail'), 'safeFallback')).toEqual({
      status: 'error',
      code: 'safeFallback',
    })
  })
})
