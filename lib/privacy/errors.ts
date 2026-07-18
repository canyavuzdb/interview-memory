export type PrivacyPersistenceErrorCode =
  | 'NOTICE_READ_FAILED'
  | 'NOTICE_RESPONSE_INVALID'
  | 'CONSENT_SUBJECT_NOT_FOUND'
  | 'CONSENT_NOTICE_NOT_EFFECTIVE'
  | 'CONSENT_NOTICE_PURPOSE_MISMATCH'
  | 'CONSENT_IDEMPOTENCY_CONFLICT'
  | 'CONSENT_WRITE_FAILED'
  | 'CONSENT_RESPONSE_INVALID'

export class PrivacyPersistenceError extends Error {
  constructor(public readonly code: PrivacyPersistenceErrorCode) {
    super(code)
    this.name = 'PrivacyPersistenceError'
  }
}
