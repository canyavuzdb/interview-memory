import { afterEach, describe, expect, it, vi } from 'vitest'
import { submitApplicationBenchmark } from '@/lib/api/submitApplicationBenchmark'
import { submitHRProcess } from '@/lib/api/submitHRProcess'

afterEach(() => {
  vi.useRealTimers()
})

describe.each([
  ['application benchmark', submitApplicationBenchmark],
  ['HR process', submitHRProcess],
])('%s preview submission adapter', (_label, submit) => {
  it('keeps its public response contract and does not mutate the payload', async () => {
    vi.useFakeTimers()
    const payload = Object.freeze({ syntheticFixture: true })

    const submission = submit(payload)
    await vi.runAllTimersAsync()

    await expect(submission).resolves.toEqual({
      success: true,
      id: 'preview-only',
    })
    expect(payload).toEqual({ syntheticFixture: true })
  })
})
