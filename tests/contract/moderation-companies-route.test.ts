import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

import {
  GET,
  POST,
} from '@/app/api/v1/moderation/companies/route'
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
const listCompanies = vi.fn()
const createCompany = vi.fn()

function postRequest(body = '{}', headers: Record<string, string> = {}) {
  return new NextRequest(
    'http://localhost:3000/api/v1/moderation/companies',
    {
      method: 'POST',
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
    listCompanies,
    createCompany,
  } as never)
  listCompanies.mockResolvedValue({ items: [] })
  createCompany.mockResolvedValue({
    companyId: id,
    slug: 'example',
    displayName: 'Example',
    countryCode: 'TR',
    verificationStatus: 'unverified',
    publicationStatus: 'hidden',
  })
})

describe('moderation company routes', () => {
  it('searches private canonical companies', async () => {
    const response = await GET(new NextRequest(
      'http://localhost:3000/api/v1/moderation/companies?query=Example',
    ))
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('no-store')
  })

  it('creates an idempotent hidden company', async () => {
    const response = await POST(postRequest())
    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toMatchObject({
      data: { companyId: id, publicationStatus: 'hidden' },
    })
  })

  it.each([
    ['MODERATION_AUTHENTICATION_REQUIRED', 401],
    ['MODERATION_FORBIDDEN', 403],
    ['MODERATION_COMPANY_QUERY_INVALID', 400],
    ['MODERATION_COMPANY_CONFLICT', 409],
    ['MODERATION_BODY_INVALID', 422],
    ['MODERATION_WRITE_FAILED', 500],
  ] as const)('maps company error %s', async (code, status) => {
    createCompany.mockRejectedValue(new ModerationServiceError(code))
    expect((await POST(postRequest())).status).toBe(status)
  })

  it('rejects invalid create requests', async () => {
    expect((await POST(postRequest('{}', {
      'Content-Type': 'text/plain',
    }))).status).toBe(415)
    expect((await POST(postRequest('{}', {
      'Idempotency-Key': 'bad',
    }))).status).toBe(400)
    expect((await POST(postRequest('{'))).status).toBe(400)
    expect((await POST(postRequest('x'.repeat(2049)))).status).toBe(413)
    expect((await POST(postRequest('{}', {
      'Content-Length': '2049',
    }))).status).toBe(413)
    const broken = postRequest()
    vi.spyOn(broken, 'text').mockRejectedValue(new Error('read'))
    expect((await POST(broken)).status).toBe(400)
  })

  it('hides unknown read and write failures', async () => {
    vi.mocked(resolveModerationActor).mockRejectedValue(new Error('private'))
    expect((await GET(new NextRequest(
      'http://localhost:3000/api/v1/moderation/companies?query=Example',
    ))).status).toBe(500)
    expect((await POST(postRequest())).status).toBe(500)
  })
})
