import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

import { POST } from '@/app/api/v1/company-experiences/route'
import { CompanyExperienceServiceError } from '@/lib/company-experience/errors'
import { resolveCompanyExperienceActor } from '@/lib/server/company-experience/actor'
import { createDefaultCompanyExperienceService } from '@/lib/server/company-experience/service'

vi.mock('@/lib/server/company-experience/actor', () => ({ resolveCompanyExperienceActor: vi.fn() }))
vi.mock('@/lib/server/company-experience/service', () => ({ createDefaultCompanyExperienceService: vi.fn() }))

const key = '11111111-1111-4111-8111-111111111111'
const create = vi.fn()

function request(body = '{}', headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost:3000/api/v1/company-experiences', {
    method: 'POST', body,
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key, ...headers },
  })
}

beforeEach(() => {
  vi.mocked(resolveCompanyExperienceActor).mockResolvedValue({
    kind: 'anonymous', dataSubjectId: key,
  })
  vi.mocked(createDefaultCompanyExperienceService).mockReturnValue({ create } as never)
  create.mockResolvedValue({
    receiptId: key, companyExperienceId: key,
    jobApplicationId: key,
    submissionCapability: null, replayed: false,
  })
})

describe('POST company experiences contract', () => {
  it('returns a private 201 response and replay signal', async () => {
    const response = await POST(request('{"locale":"tr"}'))
    expect(response.status).toBe(201)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(response.headers.get('idempotency-replayed')).toBe('false')
    await expect(response.json()).resolves.toMatchObject({ data: { receiptId: key } })
  })

  it.each([
    [new CompanyExperienceServiceError('COMPANY_EXPERIENCE_BODY_INVALID'), 422],
    [new CompanyExperienceServiceError('COMPANY_EXPERIENCE_DUPLICATE'), 409],
    [new CompanyExperienceServiceError('COMPANY_EXPERIENCE_IDEMPOTENCY_CONFLICT'), 409],
    [new CompanyExperienceServiceError('COMPANY_EXPERIENCE_IDEMPOTENCY_IN_PROGRESS', 1), 409],
    [new CompanyExperienceServiceError('COMPANY_EXPERIENCE_QUOTA_EXCEEDED', 9), 429],
    [new CompanyExperienceServiceError('COMPANY_EXPERIENCE_NOTICE_NOT_FOUND'), 503],
    [new CompanyExperienceServiceError('COMPANY_EXPERIENCE_ACTOR_RESOLUTION_FAILED'), 503],
    [new CompanyExperienceServiceError('COMPANY_EXPERIENCE_WRITE_FAILED'), 500],
  ] as const)('maps service errors without details', async (error, status) => {
    create.mockRejectedValue(error)
    const response = await POST(request())
    expect(response.status).toBe(status)
    if (error.retryAfterSeconds) {
      expect(response.headers.get('retry-after')).toBe(String(error.retryAfterSeconds))
    }
  })

  it('rejects media, keys, malformed JSON, body reads, and oversized bodies', async () => {
    expect((await POST(request('{}', { 'Content-Type': 'text/plain' }))).status).toBe(415)
    expect((await POST(request('{}', { 'Idempotency-Key': 'bad' }))).status).toBe(400)
    expect((await POST(request('{'))).status).toBe(400)
    expect((await POST(request('x'.repeat(16 * 1024 + 1)))).status).toBe(413)
    expect((await POST(request('{}', { 'Content-Length': String(16 * 1024 + 1) }))).status).toBe(413)
    const broken = request()
    vi.spyOn(broken, 'text').mockRejectedValue(new Error('read'))
    expect((await POST(broken)).status).toBe(400)
    expect(resolveCompanyExperienceActor).not.toHaveBeenCalled()
  })

  it('hides unknown composition failures', async () => {
    vi.mocked(resolveCompanyExperienceActor).mockRejectedValue(new Error('private'))
    const response = await POST(request())
    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: { code: 'COMPANY_EXPERIENCE_WRITE_FAILED' },
    })
  })
})
