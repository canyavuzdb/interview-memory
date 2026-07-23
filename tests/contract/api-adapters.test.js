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

describe('HR process submission adapter', () => {
  const receiptId = '11111111-1111-4111-8111-111111111111'
  const experienceId = '22222222-2222-4222-8222-222222222222'
  const applicationId = '44444444-4444-4444-8444-444444444444'
  const idempotencyKey = '33333333-3333-4333-8333-333333333333'

  it('posts and validates the private company experience result', async () => {
    const payload = Object.freeze({ locale: 'tr', consentGranted: true })
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: {
        receiptId, companyExperienceId: experienceId,
        jobApplicationId: applicationId,
        submissionCapability: null, replayed: false,
      },
    }), { status: 201, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetch)
    await expect(submitHRProcess(payload, idempotencyKey)).resolves.toMatchObject({
      success: true, id: receiptId, companyExperienceId: experienceId,
      jobApplicationId: applicationId,
    })
    expect(fetch).toHaveBeenCalledWith('/api/v1/company-experiences',
      expect.objectContaining({
        method: 'POST', body: JSON.stringify(payload),
        headers: expect.objectContaining({ 'Idempotency-Key': idempotencyKey }),
      }))
    expect(payload).toEqual({ locale: 'tr', consentGranted: true })
  })

  it('fails closed for HTTP, malformed, and network failures', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 422 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: {} }), { status: 201 }))
      .mockRejectedValueOnce(new Error('offline'))
    vi.stubGlobal('fetch', fetch)
    await expect(submitHRProcess({}, idempotencyKey)).resolves.toEqual({ success: false })
    await expect(submitHRProcess({}, idempotencyKey)).resolves.toEqual({ success: false })
    await expect(submitHRProcess({}, idempotencyKey)).resolves.toEqual({ success: false })
  })
})
