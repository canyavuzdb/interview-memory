import { afterEach, describe, expect, it, vi } from 'vitest'
import { submitApplicationBenchmark } from '@/lib/api/submitApplicationBenchmark'
import { submitHRProcess } from '@/lib/api/submitHRProcess'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('application benchmark API adapter', () => {
  const receiptId = '11111111-1111-4111-8111-111111111111'
  const episodeId = '22222222-2222-4222-8222-222222222222'
  const idempotencyKey = '33333333-3333-4333-8333-333333333333'

  it('posts an idempotent request and validates the private result', async () => {
    const payload = Object.freeze({ locale: 'tr', consentGranted: true })
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: {
        receiptId,
        searchEpisodeId: episodeId,
        submissionCapability: Buffer.alloc(32, 7).toString('base64url'),
        replayed: false,
      },
    }), { status: 201, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetch)

    await expect(
      submitApplicationBenchmark(payload, idempotencyKey),
    ).resolves.toMatchObject({ success: true, id: receiptId })
    expect(fetch).toHaveBeenCalledWith('/api/v1/search-episodes', {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    })
    expect(payload).toEqual({ locale: 'tr', consentGranted: true })
  })

  it('fails closed for HTTP, malformed response, and network errors', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 422 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: {} }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockRejectedValueOnce(new Error('offline'))
    vi.stubGlobal('fetch', fetch)

    await expect(submitApplicationBenchmark({}, idempotencyKey)).resolves.toEqual({ success: false })
    await expect(submitApplicationBenchmark({}, idempotencyKey)).resolves.toEqual({ success: false })
    await expect(submitApplicationBenchmark({}, idempotencyKey)).resolves.toEqual({ success: false })
  })
})

describe('HR process preview submission adapter', () => {
  it('keeps its public response contract and does not mutate the payload', async () => {
    vi.useFakeTimers()
    const payload = Object.freeze({ syntheticFixture: true })

    const submission = submitHRProcess(payload)
    await vi.runAllTimersAsync()

    await expect(submission).resolves.toEqual({
      success: true,
      id: 'preview-only',
    })
    expect(payload).toEqual({ syntheticFixture: true })
  })
})
