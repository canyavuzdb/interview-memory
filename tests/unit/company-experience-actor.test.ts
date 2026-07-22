import { describe, expect, it, vi } from 'vitest'

import { CompanyExperienceServiceError } from '@/lib/company-experience/errors'
import { resolveCompanyExperienceActor } from '@/lib/server/company-experience/actor'

const id = '11111111-1111-4111-8111-111111111111'

function dependencies(account: unknown = null, subject: string | null = id) {
  return {
    resolveAccount: vi.fn().mockResolvedValue(account),
    intakeRepository: { resolveAuthenticatedSubject: vi.fn().mockResolvedValue(subject) },
    resolveAnonymous: vi.fn().mockResolvedValue({ dataSubjectId: id }),
  }
}

describe('company experience actor', () => {
  it('prefers the authenticated subject', async () => {
    const deps = dependencies({ userId: id })
    await expect(resolveCompanyExperienceActor(deps as never)).resolves.toEqual({
      kind: 'authenticated', dataSubjectId: id,
    })
    expect(deps.resolveAnonymous).not.toHaveBeenCalled()
  })

  it('resolves an anonymous respondent when signed out', async () => {
    await expect(resolveCompanyExperienceActor(dependencies() as never)).resolves.toEqual({
      kind: 'anonymous', dataSubjectId: id,
    })
  })

  it.each([
    ['account', () => ({ ...dependencies(), resolveAccount: vi.fn().mockRejectedValue(new Error()) })],
    ['subject read', () => ({ ...dependencies({ userId: id }), intakeRepository: { resolveAuthenticatedSubject: vi.fn().mockRejectedValue(new Error()) } })],
    ['missing subject', () => dependencies({ userId: id }, null)],
    ['anonymous', () => ({ ...dependencies(), resolveAnonymous: vi.fn().mockRejectedValue(new Error()) })],
  ])('maps %s failures', async (_name, factory) => {
    await expect(resolveCompanyExperienceActor(factory() as never)).rejects.toBeInstanceOf(
      CompanyExperienceServiceError,
    )
  })
})
