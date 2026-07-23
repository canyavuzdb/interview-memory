export type ApplicationOutcomeErrorCode =
  | 'APPLICATION_OUTCOME_AUTHORIZATION_INVALID'
  | 'APPLICATION_OUTCOME_BODY_INVALID'
  | 'APPLICATION_OUTCOME_IDEMPOTENCY_CONFLICT'
  | 'APPLICATION_OUTCOME_IDEMPOTENCY_IN_PROGRESS'
  | 'APPLICATION_OUTCOME_NOT_FOUND'
  | 'APPLICATION_OUTCOME_REPLAY_FAILED'
  | 'APPLICATION_OUTCOME_RESPONSE_INVALID'
  | 'APPLICATION_OUTCOME_TRANSITION_INVALID'
  | 'APPLICATION_OUTCOME_WRITE_FAILED'

export class ApplicationOutcomeServiceError extends Error {
  constructor(
    public readonly code: ApplicationOutcomeErrorCode,
    public readonly retryAfterSeconds?: number,
  ) {
    super(code)
    this.name = 'ApplicationOutcomeServiceError'
  }
}

export class ApplicationOutcomePersistenceError extends Error {
  constructor(public readonly code: ApplicationOutcomeErrorCode) {
    super(code)
    this.name = 'ApplicationOutcomePersistenceError'
  }
}
