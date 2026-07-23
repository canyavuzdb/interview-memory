import { describe, expect, it, vi } from 'vitest'

import { ApplicationOutcomeServiceError } from '@/lib/application-outcome/errors'
import { resolveApplicationOutcomeActor } from '@/lib/server/application-outcome/actor'

const id = '11111111-1111-4111-8111-111111111111'
const capability = 'a'.repeat(43)

function dependencies(account: unknown = null, subject: string | null = id) {
  return {
    resolveAccount: vi.fn().mockResolvedValue(account),
    intakeRepository: {
      resolveAuthenticatedSubject: vi.fn().mockResolvedValue(subject),
    },
  }
}

describe('application outcome actor', () => {
  it('prefers an authenticated subject', async () => {
    await expect(
      resolveApplicationOutcomeActor(
        `SubmissionCapability ${capability}`,
        dependencies({ userId: id }) as never,
      ),
    ).resolves.toEqual({ kind: 'authenticated', dataSubjectId: id })
  })

  it('accepts a valid anonymous submission capability', async () => {
    await expect(
      resolveApplicationOutcomeActor(
        `SubmissionCapability ${capability}`,
        dependencies() as never,
      ),
    ).resolves.toEqual({ kind: 'capability', capabilityToken: capability })
  })

  it.each([
    () => ({ ...dependencies(), resolveAccount: vi.fn().mockRejectedValue(new Error()) }),
    () => dependencies({ userId: id }, null),
    () => ({
      ...dependencies({ userId: id }),
      intakeRepository: {
        resolveAuthenticatedSubject: vi.fn().mockRejectedValue(new Error()),
      },
    }),
  ])('fails closed for account resolution %#', async (factory) => {
    await expect(
      resolveApplicationOutcomeActor(null, factory() as never),
    ).rejects.toBeInstanceOf(ApplicationOutcomeServiceError)
  })

  it('rejects missing or malformed capabilities', async () => {
    await expect(
      resolveApplicationOutcomeActor('Bearer private', dependencies() as never),
    ).rejects.toMatchObject({
      code: 'APPLICATION_OUTCOME_AUTHORIZATION_INVALID',
    })
  })
})
