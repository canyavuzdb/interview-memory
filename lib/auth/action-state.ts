import { ZodError } from 'zod'

import { AuthServiceError } from '@/lib/auth/errors'

export type AuthActionState = {
  status: 'idle' | 'success' | 'error'
  code: string | null
}

export const initialAuthActionState: AuthActionState = {
  status: 'idle',
  code: null,
}

const serviceErrorCodes = {
  INVALID_CREDENTIALS: 'invalidCredentials',
  EMAIL_CONFIRMATION_REQUIRED: 'emailConfirmationRequired',
  RATE_LIMITED: 'rateLimited',
  PASSWORD_POLICY_FAILED: 'passwordPolicyFailed',
  SIGN_IN_FAILED: 'signInFailed',
  SIGN_UP_FAILED: 'signUpFailed',
  OAUTH_FAILED: 'oauthFailed',
  RECOVERY_FAILED: 'recoveryFailed',
  PASSWORD_UPDATE_FAILED: 'passwordUpdateFailed',
  CALLBACK_FAILED: 'callbackFailed',
  SIGN_OUT_FAILED: 'signOutFailed',
} as const

export function authErrorState(
  error: unknown,
  fallbackCode: string,
): AuthActionState {
  if (error instanceof ZodError) {
    return { status: 'error', code: 'invalidForm' }
  }

  if (error instanceof AuthServiceError) {
    return {
      status: 'error',
      code: serviceErrorCodes[error.code],
    }
  }

  return { status: 'error', code: fallbackCode }
}

export function authSuccessState(code: string): AuthActionState {
  return { status: 'success', code }
}
