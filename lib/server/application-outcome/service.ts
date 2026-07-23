import 'server-only'

import { z } from 'zod'

import {
  applicationOutcomeFollowUpBodySchema,
  applicationOutcomeFollowUpResultSchema,
  applicationOutcomeIdempotencyKeySchema,
  type ApplicationOutcomeFollowUpResult,
} from '@/lib/application-outcome/contracts'
import {
  ApplicationOutcomePersistenceError,
  ApplicationOutcomeServiceError,
} from '@/lib/application-outcome/errors'
import { getServerIntakeEnvironment, getServerSecurityEnvironment } from '@/lib/env/server'
import type { ApplicationOutcomeActor } from '@/lib/server/application-outcome/actor'
import {
  createSupabaseApplicationOutcomeRepository,
  type ApplicationOutcomeRepository,
} from '@/lib/server/application-outcome/repository'
import { submissionCapabilityHmacs } from '@/lib/server/security/crypto'
import type { RespondentKeyRing } from '@/lib/server/security/crypto'
import { createSupabaseSecurityRepository } from '@/lib/server/security/repository'
import { createSecurityService } from '@/lib/server/security/service'
import { SecurityServiceError } from '@/lib/security/errors'

const OPERATION_CODE = 'application.outcome.append'
const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60
const applicationIdSchema = z.uuid()
type SecurityService = ReturnType<typeof createSecurityService>

type Dependencies = {
  repository: ApplicationOutcomeRepository
  security: Pick<SecurityService, 'claimIdempotency' | 'failIdempotency'>
  capabilityKeys: RespondentKeyRing
  now?: () => Date
}

function mapSecurityError(error: SecurityServiceError): never {
  if (error.code === 'IDEMPOTENCY_CONFLICT') {
    throw new ApplicationOutcomeServiceError(
      'APPLICATION_OUTCOME_IDEMPOTENCY_CONFLICT',
    )
  }
  if (error.code === 'IDEMPOTENCY_IN_PROGRESS') {
    throw new ApplicationOutcomeServiceError(
      'APPLICATION_OUTCOME_IDEMPOTENCY_IN_PROGRESS',
      1,
    )
  }
  throw new ApplicationOutcomeServiceError('APPLICATION_OUTCOME_WRITE_FAILED')
}

function mapPersistenceError(error: ApplicationOutcomePersistenceError): never {
  throw new ApplicationOutcomeServiceError(error.code)
}

export function createApplicationOutcomeService(dependencies: Dependencies) {
  const now = dependencies.now ?? (() => new Date())

  return {
    async append(input: {
      actor: ApplicationOutcomeActor
      applicationId: unknown
      idempotencyKey: unknown
      body: unknown
    }): Promise<ApplicationOutcomeFollowUpResult> {
      const applicationId = applicationIdSchema.safeParse(input.applicationId)
      const idempotencyKey = applicationOutcomeIdempotencyKeySchema.safeParse(
        input.idempotencyKey,
      )
      const body = applicationOutcomeFollowUpBodySchema.safeParse(input.body)
      if (!applicationId.success || !idempotencyKey.success || !body.success) {
        throw new ApplicationOutcomeServiceError(
          'APPLICATION_OUTCOME_BODY_INVALID',
        )
      }

      const commandTime = now()
      const currentMonth = commandTime.toISOString().slice(0, 7)
      if (
        body.data.occurredMonth !== null &&
        body.data.occurredMonth > currentMonth
      ) {
        throw new ApplicationOutcomeServiceError(
          'APPLICATION_OUTCOME_BODY_INVALID',
        )
      }

      const subjectType =
        input.actor.kind === 'authenticated' ? 'data_subject' : 'capability'
      const subjectId =
        input.actor.kind === 'authenticated'
          ? input.actor.dataSubjectId
          : input.actor.capabilityToken

      let claim: Awaited<ReturnType<SecurityService['claimIdempotency']>>
      try {
        claim = await dependencies.security.claimIdempotency({
          subjectType,
          subjectId,
          operationCode: OPERATION_CODE,
          idempotencyKey: idempotencyKey.data,
          requestBody: {
            applicationId: applicationId.data,
            ...body.data,
          },
          ttlSeconds: IDEMPOTENCY_TTL_SECONDS,
          now: commandTime,
        })
      } catch (error) {
        if (error instanceof SecurityServiceError) mapSecurityError(error)
        throw new ApplicationOutcomeServiceError(
          'APPLICATION_OUTCOME_WRITE_FAILED',
        )
      }

      const capabilityHmacs =
        input.actor.kind === 'capability'
          ? submissionCapabilityHmacs(
              input.actor.capabilityToken,
              dependencies.capabilityKeys,
            )
          : null
      const authorization = {
        requesterDataSubjectId:
          input.actor.kind === 'authenticated'
            ? input.actor.dataSubjectId
            : null,
        activeCapabilityHmac: capabilityHmacs?.active.hmac ?? null,
        activeCapabilityKeyVersion: capabilityHmacs?.active.version ?? null,
        previousCapabilityHmac: capabilityHmacs?.previous?.hmac ?? null,
        previousCapabilityKeyVersion:
          capabilityHmacs?.previous?.version ?? null,
      }

      if (claim.record.outcome === 'replay') {
        if (
          claim.record.resource_type !== 'application_outcome' ||
          !claim.record.resource_id
        ) {
          throw new ApplicationOutcomeServiceError(
            'APPLICATION_OUTCOME_REPLAY_FAILED',
          )
        }
        let replay
        try {
          replay = await dependencies.repository.getOutcomeResult({
            ...authorization,
            outcomeEventId: claim.record.resource_id,
          })
        } catch (error) {
          if (error instanceof ApplicationOutcomePersistenceError) {
            mapPersistenceError(error)
          }
          throw new ApplicationOutcomeServiceError(
            'APPLICATION_OUTCOME_REPLAY_FAILED',
          )
        }
        if (!replay) {
          throw new ApplicationOutcomeServiceError(
            'APPLICATION_OUTCOME_REPLAY_FAILED',
          )
        }
        return applicationOutcomeFollowUpResultSchema.parse({
          applicationId: replay.application_id,
          outcomeEventId: replay.outcome_event_id,
          outcome: replay.outcome_code,
          replayed: true,
        })
      }

      try {
        const record = await dependencies.repository.appendOutcome({
          ...authorization,
          applicationId: applicationId.data,
          idempotencySubjectType: subjectType,
          idempotencySubjectHmac: claim.identity.subjectHmac,
          idempotencyKeyHmac: claim.identity.idempotencyKeyHmac,
          idempotencyRequestFingerprint: claim.identity.requestFingerprint,
          outcome: body.data.outcome,
          occurredMonth:
            body.data.occurredMonth === null
              ? null
              : `${body.data.occurredMonth}-01`,
          plannedStartMonth:
            body.data.plannedStartMonth === null
              ? null
              : `${body.data.plannedStartMonth}-01`,
        })
        return applicationOutcomeFollowUpResultSchema.parse({
          applicationId: record.application_id,
          outcomeEventId: record.outcome_event_id,
          outcome: record.outcome_code,
          replayed: false,
        })
      } catch (error) {
        const responseCode =
          error instanceof ApplicationOutcomePersistenceError
            ? error.code === 'APPLICATION_OUTCOME_AUTHORIZATION_INVALID'
              ? 401
              : error.code === 'APPLICATION_OUTCOME_NOT_FOUND'
                ? 404
                : error.code === 'APPLICATION_OUTCOME_BODY_INVALID' ||
                    error.code === 'APPLICATION_OUTCOME_TRANSITION_INVALID'
                  ? 422
                  : 500
            : 500
        try {
          await dependencies.security.failIdempotency({
            claim: claim.identity,
            responseCode,
          })
        } catch {
          // Preserve the domain error; stale processing claims expire.
        }
        if (error instanceof ApplicationOutcomePersistenceError) {
          mapPersistenceError(error)
        }
        if (error instanceof z.ZodError) {
          throw new ApplicationOutcomeServiceError(
            'APPLICATION_OUTCOME_RESPONSE_INVALID',
          )
        }
        throw new ApplicationOutcomeServiceError(
          'APPLICATION_OUTCOME_WRITE_FAILED',
        )
      }
    },
  }
}

/* v8 ignore start -- production composition root */
export function createDefaultApplicationOutcomeService() {
  const securityEnvironment = getServerSecurityEnvironment()
  const intakeEnvironment = getServerIntakeEnvironment()
  return createApplicationOutcomeService({
    repository: createSupabaseApplicationOutcomeRepository(),
    security: createSecurityService({
      repository: createSupabaseSecurityRepository(),
      quotaSubjectKey: securityEnvironment.quotaSubjectKey,
      idempotencyKey: securityEnvironment.idempotencyKey,
    }),
    capabilityKeys: intakeEnvironment.capabilityKeys,
  })
}
/* v8 ignore stop */
