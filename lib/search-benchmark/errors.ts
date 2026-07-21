export type SearchBenchmarkErrorCode =
  | 'SEARCH_BENCHMARK_ACTOR_RESOLUTION_FAILED'
  | 'SEARCH_BENCHMARK_AUTHENTICATED_SUBJECT_NOT_FOUND'
  | 'SEARCH_BENCHMARK_BODY_INVALID'
  | 'SEARCH_BENCHMARK_CATALOG_INVALID'
  | 'SEARCH_BENCHMARK_DUPLICATE'
  | 'SEARCH_BENCHMARK_IDEMPOTENCY_CONFLICT'
  | 'SEARCH_BENCHMARK_IDEMPOTENCY_IN_PROGRESS'
  | 'SEARCH_BENCHMARK_NOTICE_NOT_FOUND'
  | 'SEARCH_BENCHMARK_NOTICE_READ_FAILED'
  | 'SEARCH_BENCHMARK_QUOTA_EXCEEDED'
  | 'SEARCH_BENCHMARK_REPLAY_FAILED'
  | 'SEARCH_BENCHMARK_RESPONSE_INVALID'
  | 'SEARCH_BENCHMARK_WRITE_FAILED'

export class SearchBenchmarkServiceError extends Error {
  constructor(
    public readonly code: SearchBenchmarkErrorCode,
    public readonly retryAfterSeconds?: number,
  ) {
    super(code)
    this.name = 'SearchBenchmarkServiceError'
  }
}

export class SearchBenchmarkPersistenceError extends Error {
  constructor(public readonly code: SearchBenchmarkErrorCode) {
    super(code)
    this.name = 'SearchBenchmarkPersistenceError'
  }
}
