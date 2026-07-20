export type AuthServiceErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_CONFIRMATION_REQUIRED'
  | 'RATE_LIMITED'
  | 'PASSWORD_POLICY_FAILED'
  | 'SIGN_IN_FAILED'
  | 'SIGN_UP_FAILED'
  | 'OAUTH_FAILED'
  | 'RECOVERY_FAILED'
  | 'PASSWORD_UPDATE_FAILED'
  | 'CALLBACK_FAILED'
  | 'SIGN_OUT_FAILED'

export class AuthServiceError extends Error {
  constructor(public readonly code: AuthServiceErrorCode) {
    super(code)
    this.name = 'AuthServiceError'
  }
}

export class AuthPersistenceError extends Error {
  constructor(
    public readonly code:
      | 'ACCOUNT_READ_FAILED'
      | 'ACCOUNT_RESPONSE_INVALID',
  ) {
    super(code)
    this.name = 'AuthPersistenceError'
  }
}

export class AuthSessionError extends Error {
  constructor(
    public readonly code:
      | 'ACCOUNT_READ_FAILED'
      | 'ACCOUNT_RESPONSE_INVALID',
  ) {
    super(code)
    this.name = 'AuthSessionError'
  }
}
