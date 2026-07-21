import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

import { GET } from '@/app/api/v1/submissions/[receiptId]/route'
import { getServerIntakeEnvironment } from '@/lib/env/server'
import { IntakeServiceError } from '@/lib/intake/errors'
import { resolveActiveAccount } from '@/lib/server/auth/session'
import { createSupabaseIntakeRepository } from '@/lib/server/intake/repository'
import { createIntakeService } from '@/lib/server/intake/service'

vi.mock('@/lib/env/server', () => ({ getServerIntakeEnvironment: vi.fn() }))
vi.mock('@/lib/server/auth/session', () => ({ resolveActiveAccount: vi.fn() }))
vi.mock('@/lib/server/intake/repository', () => ({
  createSupabaseIntakeRepository: vi.fn(),
}))
vi.mock('@/lib/server/intake/service', () => ({ createIntakeService: vi.fn() }))

const receiptId = '11111111-1111-4111-8111-111111111111'
const subjectId = '22222222-2222-4222-8222-222222222222'
const repository = {
  resolveAuthenticatedSubject: vi.fn(),
}
const getSubmissionReceipt = vi.fn()

function request(authorization?: string) {
  return new NextRequest(`http://localhost:3000/api/v1/submissions/${receiptId}`, {
    headers: authorization ? { authorization } : undefined,
  })
}

function context() {
  return { params: Promise.resolve({ receiptId }) }
}

beforeEach(() => {
  vi.mocked(getServerIntakeEnvironment).mockReturnValue({
    capabilityKeys: {
      active: { version: 1, secret: Buffer.alloc(32, 1).toString('base64url') },
      previous: null,
    },
  })
  vi.mocked(createSupabaseIntakeRepository).mockReturnValue(repository as never)
  vi.mocked(createIntakeService).mockReturnValue({ getSubmissionReceipt })
  vi.mocked(resolveActiveAccount).mockResolvedValue(null)
  repository.resolveAuthenticatedSubject.mockResolvedValue(subjectId)
  getSubmissionReceipt.mockResolvedValue({ receiptId })
})

describe('GET submission receipt contract', () => {
  it('returns a private successful capability response', async () => {
    const response = await GET(
      request(`SubmissionCapability ${Buffer.alloc(32, 2).toString('base64url')}`),
      context(),
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('no-store')
    await expect(response.json()).resolves.toEqual({ data: { receiptId } })
  })

  it('resolves an authenticated account to a trusted data subject', async () => {
    vi.mocked(resolveActiveAccount).mockResolvedValue({ userId: subjectId } as never)
    await GET(request(), context())
    expect(repository.resolveAuthenticatedSubject).toHaveBeenCalledWith(subjectId)
    expect(getSubmissionReceipt).toHaveBeenCalledWith(
      expect.objectContaining({ requesterDataSubjectId: subjectId }),
    )
  })

  it('returns 401 when session resolution fails without a capability', async () => {
    vi.mocked(resolveActiveAccount).mockRejectedValue(new Error('private'))
    const response = await GET(request(), context())
    expect(response.status).toBe(401)
  })

  it.each([
    ['SUBMISSION_AUTHORIZATION_INVALID', 401],
    ['SUBMISSION_RECEIPT_NOT_FOUND', 404],
    ['SUBMISSION_RECEIPT_READ_FAILED', 500],
  ] as const)('maps %s to HTTP %s', async (code, status) => {
    getSubmissionReceipt.mockRejectedValue(new IntakeServiceError(code))
    const response = await GET(
      request(`SubmissionCapability ${Buffer.alloc(32, 2).toString('base64url')}`),
      context(),
    )
    expect(response.status).toBe(status)
    expect(response.headers.get('cache-control')).toContain('no-store')
  })
})
