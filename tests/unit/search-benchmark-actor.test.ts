import { describe, expect, it, vi } from 'vitest'

import { resolveSearchBenchmarkActor } from '@/lib/server/search-benchmark/actor'

const userId = '11111111-1111-4111-8111-111111111111'
const subjectId = '22222222-2222-4222-8222-222222222222'

function dependencies(account: object | null) {
  return {
    resolveAccount: vi.fn().mockResolvedValue(account),
    intakeRepository: {
      resolveAuthenticatedSubject: vi.fn().mockResolvedValue(subjectId),
    },
    resolveAnonymous: vi.fn().mockResolvedValue({ dataSubjectId: subjectId }),
  }
}

describe('search benchmark actor resolution', () => {
  it('prefers a verified authenticated data subject', async () => {
    const deps = dependencies({ userId })
    await expect(resolveSearchBenchmarkActor(deps as never)).resolves.toEqual({
      kind: 'authenticated', dataSubjectId: subjectId,
    })
    expect(deps.resolveAnonymous).not.toHaveBeenCalled()
  })

  it('uses the hardened anonymous respondent when there is no session', async () => {
    await expect(resolveSearchBenchmarkActor(dependencies(null) as never)).resolves.toEqual({
      kind: 'anonymous', dataSubjectId: subjectId,
    })
  })

  it('fails closed for account, subject, and anonymous resolution errors', async () => {
    const cases = [
      { ...dependencies(null), resolveAccount: vi.fn().mockRejectedValue(new Error('auth')) },
      { ...dependencies({ userId }), intakeRepository: { resolveAuthenticatedSubject: vi.fn().mockRejectedValue(new Error('db')) } },
      { ...dependencies({ userId }), intakeRepository: { resolveAuthenticatedSubject: vi.fn().mockResolvedValue(null) } },
      { ...dependencies(null), resolveAnonymous: vi.fn().mockRejectedValue(new Error('db')) },
    ]
    for (const deps of cases) {
      await expect(resolveSearchBenchmarkActor(deps as never)).rejects.toMatchObject({
        code: expect.stringMatching(/^SEARCH_BENCHMARK_/u),
      })
    }
  })
})
