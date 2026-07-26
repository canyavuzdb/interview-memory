export class PublicBenchmarkPersistenceError extends Error {
  constructor() {
    super('PUBLIC_BENCHMARK_READ_FAILED')
    this.name = 'PublicBenchmarkPersistenceError'
  }
}

export class PublicBenchmarkServiceError extends Error {
  constructor() {
    super('PUBLIC_BENCHMARK_UNAVAILABLE')
    this.name = 'PublicBenchmarkServiceError'
  }
}
