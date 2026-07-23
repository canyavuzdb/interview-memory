export type ModerationErrorCode =
  | 'MODERATION_AUTHENTICATION_REQUIRED'
  | 'MODERATION_BODY_INVALID'
  | 'MODERATION_COMPANY_RESOLUTION_CONFLICT'
  | 'MODERATION_COMPANY_RESOLUTION_REQUIRED'
  | 'MODERATION_COMPANY_CONFLICT'
  | 'MODERATION_COMPANY_QUERY_INVALID'
  | 'MODERATION_DECISION_CONFLICT'
  | 'MODERATION_FORBIDDEN'
  | 'MODERATION_NOT_FOUND'
  | 'MODERATION_QUERY_INVALID'
  | 'MODERATION_READ_FAILED'
  | 'MODERATION_RESPONSE_INVALID'
  | 'MODERATION_SELF_REVIEW_FORBIDDEN'
  | 'MODERATION_WRITE_FAILED'

export class ModerationServiceError extends Error {
  constructor(public readonly code: ModerationErrorCode) {
    super(code)
    this.name = 'ModerationServiceError'
  }
}

export class ModerationPersistenceError extends Error {
  constructor(public readonly code: ModerationErrorCode) {
    super(code)
    this.name = 'ModerationPersistenceError'
  }
}
