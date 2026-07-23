import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSupabaseApplicationOutcomeRepository } from '@/lib/server/application-outcome/repository'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({ createAdminSupabaseClient: vi.fn() }))

const rpc = vi.fn()
const id = '11111111-1111-4111-8111-111111111111'
const hash = `\\x${'ab'.repeat(32)}`
const authorization = {
  requesterDataSubjectId: id,
  activeCapabilityHmac: null,
  activeCapabilityKeyVersion: null,
  previousCapabilityHmac: null,
  previousCapabilityKeyVersion: null,
}
const row = {
  application_id: id,
  outcome_event_id: id,
  outcome_code: 'manual_rejection',
}

beforeEach(() => {
  rpc.mockReset()
  vi.mocked(createAdminSupabaseClient).mockReturnValue({ rpc } as never)
})

describe('application outcome repository', () => {
  it('appends and replays through server-only RPCs', async () => {
    rpc
      .mockResolvedValueOnce({ data: [row], error: null })
      .mockResolvedValueOnce({ data: [row], error: null })
    const repository = createSupabaseApplicationOutcomeRepository()
    await expect(repository.appendOutcome({
      ...authorization,
      applicationId: id,
      idempotencySubjectType: 'data_subject',
      idempotencySubjectHmac: hash,
      idempotencyKeyHmac: hash,
      idempotencyRequestFingerprint: hash,
      outcome: 'manual_rejection',
      occurredMonth: '2026-07-01',
      plannedStartMonth: null,
    })).resolves.toEqual(row)
    await expect(repository.getOutcomeResult({
      ...authorization,
      outcomeEventId: id,
    })).resolves.toEqual(row)
    expect(rpc).toHaveBeenNthCalledWith(
      1,
      'append_application_outcome_v1',
      expect.objectContaining({ p_application_id: id }),
    )
  })

  it.each([
    ['application_not_found', 'APPLICATION_OUTCOME_NOT_FOUND'],
    ['application_owner_required', 'APPLICATION_OUTCOME_AUTHORIZATION_INVALID'],
    ['application_outcome_transition_invalid', 'APPLICATION_OUTCOME_TRANSITION_INVALID'],
    ['application_outcome_payload_invalid', 'APPLICATION_OUTCOME_BODY_INVALID'],
    ['private', 'APPLICATION_OUTCOME_WRITE_FAILED'],
  ])('maps append failure %s', async (message, code) => {
    rpc.mockResolvedValue({ data: null, error: { message } })
    await expect(createSupabaseApplicationOutcomeRepository().appendOutcome({
      ...authorization,
      applicationId: id,
      idempotencySubjectType: 'data_subject',
      idempotencySubjectHmac: hash,
      idempotencyKeyHmac: hash,
      idempotencyRequestFingerprint: hash,
      outcome: 'manual_rejection',
      occurredMonth: '2026-07-01',
      plannedStartMonth: null,
    })).rejects.toMatchObject({ code })
  })

  it('rejects malformed results, missing replay, replay errors, and hashes', async () => {
    const repository = createSupabaseApplicationOutcomeRepository()
    rpc
      .mockResolvedValueOnce({ data: [{}], error: null })
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'private' } })
    await expect(repository.appendOutcome({
      ...authorization,
      applicationId: id,
      idempotencySubjectType: 'data_subject',
      idempotencySubjectHmac: hash,
      idempotencyKeyHmac: hash,
      idempotencyRequestFingerprint: hash,
      outcome: 'manual_rejection',
      occurredMonth: '2026-07-01',
      plannedStartMonth: null,
    })).rejects.toMatchObject({ code: 'APPLICATION_OUTCOME_RESPONSE_INVALID' })
    await expect(repository.getOutcomeResult({
      ...authorization, outcomeEventId: id,
    })).resolves.toBeNull()
    await expect(repository.getOutcomeResult({
      ...authorization, outcomeEventId: id,
    })).rejects.toMatchObject({ code: 'APPLICATION_OUTCOME_REPLAY_FAILED' })
  })
})
