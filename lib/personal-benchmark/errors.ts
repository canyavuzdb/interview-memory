export class PersonalBenchmarkPersistenceError extends Error {
  constructor(public readonly code: 'REPORT_READ_FAILED' | 'REPORT_RESPONSE_INVALID') {
    super(code)
    this.name = 'PersonalBenchmarkPersistenceError'
  }
}

export class PersonalBenchmarkServiceError extends Error {
  constructor() {
    super('PERSONAL_BENCHMARK_UNAVAILABLE')
    this.name = 'PersonalBenchmarkServiceError'
  }
}
