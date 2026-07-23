import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

import { PATCH } from '@/app/api/v1/moderation/submissions/[submissionId]/route'
import { GET } from '@/app/api/v1/moderation/submissions/route'
import { ModerationServiceError } from '@/lib/moderation/errors'
import { resolveModerationActor } from '@/lib/server/moderation/actor'
import { createDefaultModerationService } from '@/lib/server/moderation/service'

vi.mock('@/lib/server/moderation/actor', () => ({
  resolveModerationActor: vi.fn(),
}))
vi.mock('@/lib/server/moderation/service', () => ({
  createDefaultModerationService: vi.fn(),
}))

const id = '11111111-1111-4111-8111-111111111111'
const list = vi.fn()
const decide = vi.fn()
const context = { params: Promise.resolve({ submissionId: id }) }

function patchRequest(body = '{}', headers: Record<string, string> = {}) {
  return new NextRequest(
    `http://localhost:3000/api/v1/moderation/submissions/${id}`,
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
  vi.mocked(resolveModerationActor).mockResolvedValue({ userId: id })
  vi.mocked(createDefaultModerationService).mockReturnValue({
    list,
    decide,
  } as never)
  list.mockResolvedValue({ items: [], nextCursor: null })
  decide.mockResolvedValue({
    decisionId: id,
    submissionId: id,
    qualityStatus: 'eligible',
    decidedAt: '2026-07-24T11:00:00.000Z',
  })
})

describe('moderation route contracts', () => {
  it('returns a private moderation queue', async () => {
    const response = await GET(new NextRequest(
      'http://localhost:3000/api/v1/moderation/submissions?limit=10',
    ))
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ query: expect.objectContaining({ limit: '10' }) }),
    )
  })

  it.each([
    ['MODERATION_AUTHENTICATION_REQUIRED', 401],
    ['MODERATION_FORBIDDEN', 403],
    ['MODERATION_QUERY_INVALID', 400],
    ['MODERATION_READ_FAILED', 500],
  ] as const)('maps queue error %s', async (code, status) => {
    list.mockRejectedValue(new ModerationServiceError(code))
    expect((await GET(new NextRequest(
      'http://localhost:3000/api/v1/moderation/submissions',
    ))).status).toBe(status)
  })

  it('writes an idempotent private moderation decision', async () => {
    const response = await PATCH(patchRequest(), context)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      data: { qualityStatus: 'eligible' },
    })
  })

  it.each([
    ['MODERATION_AUTHENTICATION_REQUIRED', 401],
    ['MODERATION_FORBIDDEN', 403],
    ['MODERATION_SELF_REVIEW_FORBIDDEN', 403],
    ['MODERATION_NOT_FOUND', 404],
    ['MODERATION_DECISION_CONFLICT', 409],
    ['MODERATION_COMPANY_RESOLUTION_CONFLICT', 409],
    ['MODERATION_BODY_INVALID', 422],
    ['MODERATION_COMPANY_RESOLUTION_REQUIRED', 422],
    ['MODERATION_WRITE_FAILED', 500],
  ] as const)('maps decision error %s', async (code, status) => {
    decide.mockRejectedValue(new ModerationServiceError(code))
    expect((await PATCH(patchRequest(), context)).status).toBe(status)
  })

  it('rejects unsupported media, keys, JSON, reads, and large bodies', async () => {
    expect((await PATCH(patchRequest('{}', {
      'Content-Type': 'text/plain',
    }), context)).status).toBe(415)
    expect((await PATCH(patchRequest('{}', {
      'Idempotency-Key': 'bad',
    }), context)).status).toBe(400)
    expect((await PATCH(patchRequest('{'), context)).status).toBe(400)
    expect((await PATCH(patchRequest('x'.repeat(4097)), context)).status).toBe(413)
    expect((await PATCH(patchRequest('{}', {
      'Content-Length': '4097',
    }), context)).status).toBe(413)
    const broken = patchRequest()
    vi.spyOn(broken, 'text').mockRejectedValue(new Error('read'))
    expect((await PATCH(broken, context)).status).toBe(400)
  })

  it('hides unknown composition failures', async () => {
    vi.mocked(resolveModerationActor).mockRejectedValue(new Error('private'))
    expect((await GET(new NextRequest(
      'http://localhost:3000/api/v1/moderation/submissions',
    ))).status).toBe(500)
    expect((await PATCH(patchRequest(), context)).status).toBe(500)
  })
})
