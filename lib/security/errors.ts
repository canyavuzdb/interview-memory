export type SecurityErrorCode =
  | 'ANONYMOUS_SUBJECT_RESOLUTION_FAILED'
  | 'IDEMPOTENCY_CONFLICT'
  | 'IDEMPOTENCY_IN_PROGRESS'
  | 'IDEMPOTENCY_STATE_INVALID'
  | 'QUOTA_EXCEEDED'
  | 'QUOTA_POLICY_INVALID'
  | 'SECURITY_RESPONSE_INVALID'
  | 'SECURITY_WRITE_FAILED'

export class SecurityServiceError extends Error {
  constructor(
    public readonly code: SecurityErrorCode,
    public readonly retryAfterSeconds?: number,
  ) {
    super(code)
    this.name = 'SecurityServiceError'
  }
}

export class SecurityPersistenceError extends Error {
  constructor(public readonly code: SecurityErrorCode) {
    super(code)
    this.name = 'SecurityPersistenceError'
  }
}
