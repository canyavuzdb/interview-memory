import 'server-only'

import {
  idempotencyClaimCommandSchema,
  idempotencyCompletionCommandSchema,
  quotaConsumeCommandSchema,
} from '@/lib/security/contracts'
import {
  SecurityPersistenceError,
  SecurityServiceError,
} from '@/lib/security/errors'
import { hmacValue, sha256Value } from '@/lib/server/security/crypto'
import { loadQuotaPolicy } from '@/lib/server/security/policy'
import type { SecurityRepository } from '@/lib/server/security/repository'

type SecurityServiceDependencies = {
  repository: SecurityRepository
  quotaSubjectKey: string
  idempotencyKey: string
}

export type PreparedQuota = {
  scope: string
  subjectType: 'data_subject'
  subjectHmac: string
  windowStart: string
  windowKind: string
  limit: number
  counterKind: 'attempt' | 'accepted'
  policyVersion: string
  policyHash: string
  expiresAt: string
  retryAfterSeconds: number
}

function mapPersistenceError(error: unknown): never {
  if (error instanceof SecurityPersistenceError) {
    throw new SecurityServiceError(error.code)
  }

  throw new SecurityServiceError('SECURITY_WRITE_FAILED')
}

function windowBounds(now: Date, durationSeconds: number) {
  const durationMilliseconds = durationSeconds * 1000
  const startMilliseconds =
    Math.floor(now.getTime() / durationMilliseconds) * durationMilliseconds

  return {
    start: new Date(startMilliseconds),
    expiresAt: new Date(startMilliseconds + durationMilliseconds),
  }
}

function prepareQuota(
  input: unknown,
  quotaSubjectKey: string,
): PreparedQuota {
  const command = quotaConsumeCommandSchema.parse(input)
  const policy = loadQuotaPolicy()
  const selectedPolicy = policy.document.policies[command.policy]
  const selectedWindow = selectedPolicy?.windows.find(
    (window) =>
      window.kind === command.windowKind &&
      window.counter === command.counter,
  )

  if (!selectedPolicy || !selectedWindow) {
    throw new SecurityServiceError('QUOTA_POLICY_INVALID')
  }

  const now = command.now ?? new Date()
  const bounds = windowBounds(now, selectedWindow.durationSeconds)

  return {
    scope: selectedPolicy.scope,
    subjectType: 'data_subject',
    subjectHmac: hmacValue(
      quotaSubjectKey,
      'quota-subject:data-subject:v1',
      command.subjectId,
    ),
    windowStart: bounds.start.toISOString(),
    windowKind: selectedWindow.kind,
    limit: selectedWindow.limit,
    counterKind: selectedWindow.counter,
    policyVersion: policy.document.version,
    policyHash: policy.hash,
    expiresAt: bounds.expiresAt.toISOString(),
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((bounds.expiresAt.getTime() - now.getTime()) / 1000),
    ),
  }
}

export function createSecurityService({
  repository,
  quotaSubjectKey,
  idempotencyKey,
}: SecurityServiceDependencies) {
  return {
    prepareQuota(input: unknown) {
      return prepareQuota(input, quotaSubjectKey)
    },

    async consumeQuota(input: unknown) {
      const prepared = prepareQuota(input, quotaSubjectKey)

      try {
        const result = await repository.consumeQuota({
          scope: prepared.scope,
          subjectType: prepared.subjectType,
          subjectHmac: prepared.subjectHmac,
          windowStart: prepared.windowStart,
          windowKind: prepared.windowKind,
          limit: prepared.limit,
          counterKind: prepared.counterKind,
          policyVersion: prepared.policyVersion,
          policyHash: prepared.policyHash,
          expiresAt: prepared.expiresAt,
        })

        if (!result.allowed) {
          throw new SecurityServiceError(
            'QUOTA_EXCEEDED',
            prepared.retryAfterSeconds,
          )
        }

        return result
      } catch (error) {
        if (error instanceof SecurityServiceError) throw error
        mapPersistenceError(error)
      }
    },

    async claimIdempotency(input: unknown) {
      const command = idempotencyClaimCommandSchema.parse(input)
      const now = command.now ?? new Date()
      const identity = {
        subjectType: command.subjectType,
        subjectHmac: hmacValue(
          idempotencyKey,
          `idempotency-subject:${command.subjectType}:v1`,
          command.subjectId,
        ),
        operationCode: command.operationCode,
        idempotencyKeyHmac: hmacValue(
          idempotencyKey,
          `idempotency-key:${command.operationCode}:v1`,
          command.idempotencyKey,
        ),
        requestFingerprint: sha256Value({
          operationCode: command.operationCode,
          body: command.requestBody,
        }),
      }

      try {
        const record = await repository.claimIdempotency({
          ...identity,
          expiresAt: new Date(
            now.getTime() + command.ttlSeconds * 1000,
          ).toISOString(),
        })

        if (record.outcome === 'conflict') {
          throw new SecurityServiceError('IDEMPOTENCY_CONFLICT')
        }

        if (record.outcome === 'in_progress') {
          throw new SecurityServiceError('IDEMPOTENCY_IN_PROGRESS')
        }

        return { identity, record }
      } catch (error) {
        if (error instanceof SecurityServiceError) throw error
        mapPersistenceError(error)
      }
    },

    async completeIdempotency(input: unknown) {
      const command = idempotencyCompletionCommandSchema.parse(input)

      try {
        await repository.completeIdempotency({
          ...command.claim,
          resourceType: command.resourceType,
          resourceId: command.resourceId,
          responseCode: command.responseCode,
        })
      } catch (error) {
        mapPersistenceError(error)
      }
    },

    async failIdempotency(input: {
      claim: {
        subjectType: 'data_subject' | 'auth_user' | 'capability'
        subjectHmac: string
        operationCode: string
        idempotencyKeyHmac: string
        requestFingerprint: string
      }
      responseCode: number
    }) {
      try {
        await repository.failIdempotency({
          ...input.claim,
          responseCode: input.responseCode,
        })
      } catch (error) {
        mapPersistenceError(error)
      }
    },
  }
}
