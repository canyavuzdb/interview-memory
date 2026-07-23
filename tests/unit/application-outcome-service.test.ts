import { describe, expect, it, vi } from 'vitest'

import { ApplicationOutcomePersistenceError } from '@/lib/application-outcome/errors'
import { createApplicationOutcomeService } from '@/lib/server/application-outcome/service'
import { SecurityServiceError } from '@/lib/security/errors'

const applicationId = '11111111-1111-4111-8111-111111111111'
const eventId = '22222222-2222-4222-8222-222222222222'
const subjectId = '33333333-3333-4333-8333-333333333333'
const idempotencyKey = '44444444-4444-4444-8444-444444444444'
const hash = `\\x${'ab'.repeat(32)}`
const capability = 'a'.repeat(43)
const secret = Buffer.alloc(32, 1).toString('base64url')
const body = {
  outcome: 'manual_rejection',
  occurredMonth: '2026-07',
  plannedStartMonth: null,
} as const

function setup(outcome: 'claimed' | 'replay' = 'claimed') {
  const identity = {
    subjectType: 'data_subject' as const,
    subjectHmac: hash,
    operationCode: 'application.outcome.append',
    idempotencyKeyHmac: hash,
    requestFingerprint: hash,
  }
  const repository = {
    appendOutcome: vi.fn().mockResolvedValue({
      application_id: applicationId,
      outcome_event_id: eventId,
      outcome_code: body.outcome,
    }),
    getOutcomeResult: vi.fn().mockResolvedValue({
      application_id: applicationId,
      outcome_event_id: eventId,
      outcome_code: body.outcome,
    }),
  }
  const security = {
    claimIdempotency: vi.fn().mockResolvedValue({
      identity,
      record: {
        outcome,
        record_status: outcome === 'replay' ? 'completed' : 'processing',
        resource_type: outcome === 'replay' ? 'application_outcome' : null,
        resource_id: outcome === 'replay' ? eventId : null,
        response_code: outcome === 'replay' ? 200 : null,
      },
    }),
    failIdempotency: vi.fn().mockResolvedValue(undefined),
  }
  const service = createApplicationOutcomeService({
    repository,
    security: security as never,
    capabilityKeys: {
      active: { version: 2, secret },
      previous: { version: 1, secret: Buffer.alloc(32, 2).toString('base64url') },
    },
    now: () => new Date('2026-07-23T12:00:00.000Z'),
  })
  return { repository, security, service }
}

const authenticatedInput = {
  actor: { kind: 'authenticated' as const, dataSubjectId: subjectId },
  applicationId,
  idempotencyKey,
  body,
}

describe('application outcome service', () => {
  it('appends an authenticated result and completes inside the RPC', async () => {
    const value = setup()
    await expect(value.service.append(authenticatedInput)).resolves.toEqual({
      applicationId,
      outcomeEventId: eventId,
      outcome: body.outcome,
      replayed: false,
    })
    expect(value.repository.appendOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        requesterDataSubjectId: subjectId,
        occurredMonth: '2026-07-01',
        idempotencySubjectType: 'data_subject',
      }),
    )
  })

  it('authorizes anonymous updates with active and previous capability HMACs', async () => {
    const value = setup()
    await value.service.append({
      ...authenticatedInput,
      actor: { kind: 'capability', capabilityToken: capability },
    })
    expect(value.repository.appendOutcome).toHaveBeenCalledWith(
      expect.objectContaining({
        requesterDataSubjectId: null,
        idempotencySubjectType: 'capability',
        activeCapabilityKeyVersion: 2,
        previousCapabilityKeyVersion: 1,
      }),
    )
  })

  it('replays an authorized durable outcome', async () => {
    const value = setup('replay')
    await expect(value.service.append(authenticatedInput)).resolves.toMatchObject({
      replayed: true,
      outcomeEventId: eventId,
    })
    expect(value.repository.appendOutcome).not.toHaveBeenCalled()
  })

  it.each([
    { ...authenticatedInput, applicationId: 'bad' },
    { ...authenticatedInput, idempotencyKey: 'bad' },
    { ...authenticatedInput, body: { ...body, occurredMonth: '2026-08' } },
    { ...authenticatedInput, body: { ...body, extra: true } },
  ])('rejects invalid input before claiming %#', async (input) => {
    const value = setup()
    await expect(value.service.append(input)).rejects.toMatchObject({
      code: 'APPLICATION_OUTCOME_BODY_INVALID',
    })
    expect(value.security.claimIdempotency).not.toHaveBeenCalled()
  })

  it.each([
    ['IDEMPOTENCY_CONFLICT', 'APPLICATION_OUTCOME_IDEMPOTENCY_CONFLICT'],
    ['IDEMPOTENCY_IN_PROGRESS', 'APPLICATION_OUTCOME_IDEMPOTENCY_IN_PROGRESS'],
    ['SECURITY_WRITE_FAILED', 'APPLICATION_OUTCOME_WRITE_FAILED'],
  ] as const)('maps security error %s', async (source, target) => {
    const value = setup()
    value.security.claimIdempotency.mockRejectedValue(
      new SecurityServiceError(source),
    )
    await expect(value.service.append(authenticatedInput)).rejects.toMatchObject({
      code: target,
    })
  })

  it('maps persistence failures and releases the claim', async () => {
    const value = setup()
    value.repository.appendOutcome.mockRejectedValue(
      new ApplicationOutcomePersistenceError(
        'APPLICATION_OUTCOME_TRANSITION_INVALID',
      ),
    )
    await expect(value.service.append(authenticatedInput)).rejects.toMatchObject({
      code: 'APPLICATION_OUTCOME_TRANSITION_INVALID',
    })
    expect(value.security.failIdempotency).toHaveBeenCalled()
  })

  it('fails closed for invalid replay records', async () => {
    const value = setup('replay')
    value.repository.getOutcomeResult.mockResolvedValue(null)
    await expect(value.service.append(authenticatedInput)).rejects.toMatchObject({
      code: 'APPLICATION_OUTCOME_REPLAY_FAILED',
    })
  })
})
