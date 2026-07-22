export type CompanyExperienceErrorCode =
  | 'COMPANY_EXPERIENCE_ACTOR_RESOLUTION_FAILED'
  | 'COMPANY_EXPERIENCE_AUTHENTICATED_SUBJECT_NOT_FOUND'
  | 'COMPANY_EXPERIENCE_BODY_INVALID'
  | 'COMPANY_EXPERIENCE_DUPLICATE'
  | 'COMPANY_EXPERIENCE_IDEMPOTENCY_CONFLICT'
  | 'COMPANY_EXPERIENCE_IDEMPOTENCY_IN_PROGRESS'
  | 'COMPANY_EXPERIENCE_NOTICE_NOT_FOUND'
  | 'COMPANY_EXPERIENCE_NOTICE_READ_FAILED'
  | 'COMPANY_EXPERIENCE_QUOTA_EXCEEDED'
  | 'COMPANY_EXPERIENCE_REPLAY_FAILED'
  | 'COMPANY_EXPERIENCE_RESPONSE_INVALID'
  | 'COMPANY_EXPERIENCE_WRITE_FAILED'

export class CompanyExperienceServiceError extends Error {
  constructor(
    public readonly code: CompanyExperienceErrorCode,
    public readonly retryAfterSeconds?: number,
  ) {
    super(code)
    this.name = 'CompanyExperienceServiceError'
  }
}

export class CompanyExperiencePersistenceError extends Error {
  constructor(public readonly code: CompanyExperienceErrorCode) {
    super(code)
    this.name = 'CompanyExperiencePersistenceError'
  }
}
