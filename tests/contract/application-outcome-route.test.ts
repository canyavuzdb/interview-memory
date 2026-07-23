import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

import { PATCH } from '@/app/api/v1/job-applications/[applicationId]/outcome/route'
import { ApplicationOutcomeServiceError } from '@/lib/application-outcome/errors'
import { resolveApplicationOutcomeActor } from '@/lib/server/application-outcome/actor'
import { createDefaultApplicationOutcomeService } from '@/lib/server/application-outcome/service'

vi.mock('@/lib/server/application-outcome/actor', () => ({
  resolveApplicationOutcomeActor: vi.fn(),
}))
vi.mock('@/lib/server/application-outcome/service', () => ({
  createDefaultApplicationOutcomeService: vi.fn(),
}))

const id = '11111111-1111-4111-8111-111111111111'
const append = vi.fn()
const context = { params: Promise.resolve({ applicationId: id }) }

function request(body = '{}', headers: Record<string, string> = {}) {
  return new NextRequest(
    `http://localhost:3000/api/v1/job-applications/${id}/outcome`,
    {
      method: 'PATCH',
      body,
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': id,
        ...headers,
      },
    },
  )
}

beforeEach(() => {
  vi.mocked(resolveApplicationOutcomeActor).mockResolvedValue({
    kind: 'authenticated',
    dataSubjectId: id,
  })
  vi.mocked(createDefaultApplicationOutcomeService).mockReturnValue({
    append,
  } as never)
  append.mockResolvedValue({
    applicationId: id,
    outcomeEventId: id,
    outcome: 'manual_rejection',
    replayed: false,
  })
})

describe('PATCH application outcome contract', () => {
  it('returns a private outcome and replay signal', async () => {
    const response = await PATCH(request(), context)
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(response.headers.get('idempotency-replayed')).toBe('false')
  })

  it.each([
    ['APPLICATION_OUTCOME_AUTHORIZATION_INVALID', 401],
    ['APPLICATION_OUTCOME_NOT_FOUND', 404],
    ['APPLICATION_OUTCOME_BODY_INVALID', 422],
    ['APPLICATION_OUTCOME_TRANSITION_INVALID', 422],
    ['APPLICATION_OUTCOME_IDEMPOTENCY_CONFLICT', 409],
    ['APPLICATION_OUTCOME_IDEMPOTENCY_IN_PROGRESS', 409],
    ['APPLICATION_OUTCOME_WRITE_FAILED', 500],
  ] as const)('maps %s', async (code, status) => {
    append.mockRejectedValue(
      new ApplicationOutcomeServiceError(code, code.includes('IN_PROGRESS') ? 2 : undefined),
    )
    const response = await PATCH(request(), context)
    expect(response.status).toBe(status)
  })

  it('rejects unsupported media, keys, JSON, and oversized bodies', async () => {
    expect((await PATCH(request('{}', { 'Content-Type': 'text/plain' }), context)).status).toBe(415)
    expect((await PATCH(request('{}', { 'Idempotency-Key': 'bad' }), context)).status).toBe(400)
    expect((await PATCH(request('{'), context)).status).toBe(400)
    expect((await PATCH(request('x'.repeat(4097)), context)).status).toBe(413)
    expect((await PATCH(request('{}', { 'Content-Length': '4097' }), context)).status).toBe(413)
    const broken = request()
    vi.spyOn(broken, 'text').mockRejectedValue(new Error('read'))
    expect((await PATCH(broken, context)).status).toBe(400)
  })

  it('hides unknown composition failures', async () => {
    vi.mocked(resolveApplicationOutcomeActor).mockRejectedValue(
      new Error('private'),
    )
    expect((await PATCH(request(), context)).status).toBe(500)
  })
})
