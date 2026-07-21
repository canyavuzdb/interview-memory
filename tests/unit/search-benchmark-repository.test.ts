import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSupabaseSearchBenchmarkRepository } from '@/lib/server/search-benchmark/repository'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({ createAdminSupabaseClient: vi.fn() }))

const rpc = vi.fn()
const id = '11111111-1111-4111-8111-111111111111'
const hash = `\\x${'ab'.repeat(32)}`
const input = {
  dataSubjectId: id, schemaVersion: 1, locale: 'tr' as const,
  noticeVersionId: id, payloadHash: hash, commandFingerprint: hash,
  supersedesSubmissionId: null, capabilityHmac: hash, capabilityKeyVersion: 1,
  capabilityExpiresAt: '2026-08-20T00:00:00.000Z',
  consentSubjectProofHmac: hash, consentSubjectProofKeyVersion: 1,
  consentIdempotencyKey: id, idempotencySubjectHmac: hash,
  idempotencyKeyHmac: hash, idempotencyRequestFingerprint: hash,
  quotaSubjectHmac: hash, quotaWindowStart: '2026-07-20T00:00:00.000Z',
  quotaLimit: 1, quotaPolicyVersion: 'v1', quotaPolicyHash: hash,
  quotaExpiresAt: '2026-08-20T00:00:00.000Z', roleSlug: 'frontend-developer',
  sectorSlug: null, roleLevel: 'senior', experienceBand: '5-8',
  targetRegion: 'turkiye', employmentType: null, workMode: null,
  startedMonth: '2026-01-01', endedMonth: null, status: 'ongoing',
  currentlyEmployed: true, countsAreEstimated: true,
  observedThrough: '2026-07-20', applicationsCount: 10,
  humanResponsesCount: 5, anyInterviewsCount: 3, hrInterviewsCount: 2,
  technicalInterviewsCount: 2, offersCount: 1, acceptedOffersCount: 0,
  employmentStartedCount: 0,
}

beforeEach(() => {
  rpc.mockReset()
  vi.mocked(createAdminSupabaseClient).mockReturnValue({ rpc } as never)
})

describe('search benchmark repository', () => {
  it('writes and replays through narrow RPCs', async () => {
    const row = { submission_id: id, receipt_id: id, search_episode_id: id }
    rpc
      .mockResolvedValueOnce({ data: [row], error: null })
      .mockResolvedValueOnce({ data: [{ ...row, capability_key_version: 1 }], error: null })
    const repository = createSupabaseSearchBenchmarkRepository()
    await expect(repository.createSearchEpisode(input)).resolves.toEqual(row)
    await expect(repository.getCreateResult({ submissionId: id, dataSubjectId: id }))
      .resolves.toMatchObject({ capability_key_version: 1 })
    expect(rpc).toHaveBeenNthCalledWith(1, 'create_search_episode_v1', expect.objectContaining({
      p_role_slug: 'frontend-developer', p_sector_slug: null,
    }))
  })

  it('returns null for a missing replay and rejects malformed responses', async () => {
    rpc
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: [{}], error: null })
      .mockResolvedValueOnce({ data: [{}], error: null })
    const repository = createSupabaseSearchBenchmarkRepository()
    await expect(repository.getCreateResult({ submissionId: id, dataSubjectId: id })).resolves.toBeNull()
    await expect(repository.createSearchEpisode(input)).rejects.toMatchObject({
      code: 'SEARCH_BENCHMARK_RESPONSE_INVALID',
    })
    await expect(repository.getCreateResult({ submissionId: id, dataSubjectId: id })).rejects.toMatchObject({
      code: 'SEARCH_BENCHMARK_RESPONSE_INVALID',
    })
  })

  it('maps replay database failures and accepts nullable capability metadata', async () => {
    rpc
      .mockResolvedValueOnce({ data: null, error: { message: 'private replay failure' } })
      .mockResolvedValueOnce({
        data: [{ submission_id: id, receipt_id: id, search_episode_id: id }],
        error: null,
      })
    const repository = createSupabaseSearchBenchmarkRepository()
    await expect(repository.getCreateResult({ submissionId: id, dataSubjectId: id })).rejects.toMatchObject({
      code: 'SEARCH_BENCHMARK_REPLAY_FAILED',
    })
    await expect(repository.createSearchEpisode({
      ...input,
      capabilityHmac: null,
      capabilityKeyVersion: null,
      capabilityExpiresAt: null,
    })).resolves.toMatchObject({ submission_id: id })
  })

  it.each([
    ['accepted_quota_exceeded', 'SEARCH_BENCHMARK_QUOTA_EXCEEDED'],
    ['search_episode_role_not_active', 'SEARCH_BENCHMARK_CATALOG_INVALID'],
    ['survey_notice_not_effective', 'SEARCH_BENCHMARK_NOTICE_NOT_FOUND'],
    ['survey_submissions_command_unique', 'SEARCH_BENCHMARK_DUPLICATE'],
    ['search_episode_status_count_mismatch', 'SEARCH_BENCHMARK_BODY_INVALID'],
    ['private database failure', 'SEARCH_BENCHMARK_WRITE_FAILED'],
    [undefined, 'SEARCH_BENCHMARK_WRITE_FAILED'],
  ])('maps %s safely', async (message, code) => {
    rpc.mockResolvedValue({ data: null, error: { message } })
    await expect(createSupabaseSearchBenchmarkRepository().createSearchEpisode(input))
      .rejects.toMatchObject({ code })
  })

  it('rejects malformed hashes before calling the database', async () => {
    await expect(createSupabaseSearchBenchmarkRepository().createSearchEpisode({
      ...input, payloadHash: 'raw',
    })).rejects.toMatchObject({ code: 'SEARCH_BENCHMARK_WRITE_FAILED' })
    expect(rpc).not.toHaveBeenCalled()
  })
})
