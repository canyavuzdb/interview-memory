import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

import { POST } from '@/app/api/v1/search-episodes/route'
import { SearchBenchmarkServiceError } from '@/lib/search-benchmark/errors'
import { resolveSearchBenchmarkActor } from '@/lib/server/search-benchmark/actor'
import { createDefaultSearchBenchmarkService } from '@/lib/server/search-benchmark/service'

vi.mock('@/lib/server/search-benchmark/actor', () => ({ resolveSearchBenchmarkActor: vi.fn() }))
vi.mock('@/lib/server/search-benchmark/service', () => ({ createDefaultSearchBenchmarkService: vi.fn() }))

const key = '11111111-1111-4111-8111-111111111111'
const actor = { kind: 'anonymous', dataSubjectId: key }
const create = vi.fn()

function request(body = '{}', headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost:3000/api/v1/search-episodes', {
    method: 'POST', body,
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key, ...headers },
  })
}

beforeEach(() => {
  vi.mocked(resolveSearchBenchmarkActor).mockResolvedValue(actor as never)
  vi.mocked(createDefaultSearchBenchmarkService).mockReturnValue({ create } as never)
  create.mockResolvedValue({
    receiptId: key, searchEpisodeId: key, submissionCapability: null, replayed: false,
  })
})

describe('POST search episodes contract', () => {
  it('returns a private 201 response and replay signal', async () => {
    const response = await POST(request('{"locale":"tr"}'))
    expect(response.status).toBe(201)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(response.headers.get('idempotency-replayed')).toBe('false')
    await expect(response.json()).resolves.toMatchObject({ data: { receiptId: key } })
  })

  it.each([
    [new SearchBenchmarkServiceError('SEARCH_BENCHMARK_BODY_INVALID'), 422],
    [new SearchBenchmarkServiceError('SEARCH_BENCHMARK_DUPLICATE'), 409],
    [new SearchBenchmarkServiceError('SEARCH_BENCHMARK_QUOTA_EXCEEDED', 9), 429],
    [new SearchBenchmarkServiceError('SEARCH_BENCHMARK_NOTICE_NOT_FOUND'), 503],
    [new SearchBenchmarkServiceError('SEARCH_BENCHMARK_WRITE_FAILED'), 500],
  ] as const)('maps service errors without leaking details', async (error, status) => {
    create.mockRejectedValue(error)
    const response = await POST(request())
    expect(response.status).toBe(status)
    if (status === 429) expect(response.headers.get('retry-after')).toBe('9')
  })

  it('rejects unsupported media, invalid keys, malformed JSON, and oversized bodies', async () => {
    expect((await POST(request('{}', { 'Content-Type': 'text/plain' }))).status).toBe(415)
    expect((await POST(request('{}', { 'Idempotency-Key': 'bad' }))).status).toBe(400)
    expect((await POST(request('{'))).status).toBe(400)
    expect((await POST(request('x'.repeat(16 * 1024 + 1)))).status).toBe(413)
    expect((await POST(request('{}', { 'Content-Length': String(16 * 1024 + 1) }))).status).toBe(413)
    expect(resolveSearchBenchmarkActor).not.toHaveBeenCalled()
  })

  it('maps unknown composition failures to a generic write error', async () => {
    vi.mocked(resolveSearchBenchmarkActor).mockRejectedValue(new Error('private'))
    const response = await POST(request())
    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: { code: 'SEARCH_BENCHMARK_WRITE_FAILED' },
    })
  })
})
