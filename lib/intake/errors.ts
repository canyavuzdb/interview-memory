export type IntakeErrorCode =
  | 'SUBMISSION_AUTHORIZATION_INVALID'
  | 'SUBMISSION_RECEIPT_NOT_FOUND'
  | 'SUBMISSION_RECEIPT_READ_FAILED'
  | 'SUBMISSION_RECEIPT_RESPONSE_INVALID'

export class IntakeServiceError extends Error {
  constructor(public readonly code: IntakeErrorCode) {
    super(code)
    this.name = 'IntakeServiceError'
  }
}

export class IntakePersistenceError extends Error {
  constructor(public readonly code: IntakeErrorCode) {
    super(code)
    this.name = 'IntakePersistenceError'
  }
}
