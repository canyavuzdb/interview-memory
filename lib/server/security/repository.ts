import 'server-only'

import { z } from 'zod'

import { SecurityPersistenceError } from '@/lib/security/errors'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

const postgresSha256Schema = z.string().regex(/^\\x[0-9a-f]{64}$/u)

const anonymousSubjectRecordSchema = z.strictObject({
  data_subject_id: z.uuid(),
  created: z.boolean(),
  key_rotated: z.boolean(),
})

const quotaRecordSchema = z.strictObject({
  allowed: z.boolean(),
  current_count: z.number().int().nonnegative(),
  remaining: z.number().int().nonnegative(),
})

const idempotencyClaimRecordSchema = z.strictObject({
  outcome: z.enum(['claimed', 'replay', 'in_progress', 'conflict']),
  record_status: z.enum(['processing', 'completed', 'failed']),
  resource_type: z.string().nullable(),
  resource_id: z.uuid().nullable(),
  response_code: z.number().int().min(100).max(599).nullable(),
})

export type AnonymousSubjectRecord = z.infer<
  typeof anonymousSubjectRecordSchema
>
export type QuotaRecord = z.infer<typeof quotaRecordSchema>
export type IdempotencyClaimRecord = z.infer<
  typeof idempotencyClaimRecordSchema
>

type IdempotencyIdentity = {
  subjectType: 'data_subject' | 'auth_user' | 'capability'
  subjectHmac: string
  operationCode: string
  idempotencyKeyHmac: string
  requestFingerprint: string
}

export interface SecurityRepository {
  resolveAnonymousSubject(input: {
    activeHmac: string
    activeKeyVersion: number
    previousHmac: string | null
    previousKeyVersion: number | null
  }): Promise<AnonymousSubjectRecord>
  consumeQuota(input: {
    scope: string
    subjectType: 'data_subject' | 'ip_hmac' | 'device_cookie'
    subjectHmac: string
    windowStart: string
    windowKind: string
    limit: number
    counterKind: 'attempt' | 'accepted'
    policyVersion: string
    policyHash: string
    expiresAt: string
  }): Promise<QuotaRecord>
  claimIdempotency(
    input: IdempotencyIdentity & { expiresAt: string },
  ): Promise<IdempotencyClaimRecord>
  completeIdempotency(
    input: IdempotencyIdentity & {
      resourceType: string
      resourceId: string
      responseCode: number
    },
  ): Promise<void>
  failIdempotency(
    input: IdempotencyIdentity & { responseCode: number },
  ): Promise<void>
}

function ensureSha256(value: string): string {
  const result = postgresSha256Schema.safeParse(value)

  if (!result.success) {
    throw new SecurityPersistenceError('SECURITY_WRITE_FAILED')
  }

  return result.data
}

export function createSupabaseSecurityRepository(): SecurityRepository {
  const client = createAdminSupabaseClient()

  return {
    async resolveAnonymousSubject(input) {
      const { data, error } = await client.rpc(
        'resolve_anonymous_subject_v1',
        {
          p_active_hmac: ensureSha256(input.activeHmac),
          p_active_key_version: input.activeKeyVersion,
          p_previous_hmac: input.previousHmac
            ? ensureSha256(input.previousHmac)
            : undefined,
          p_previous_key_version: input.previousKeyVersion ?? undefined,
        },
      )

      if (error) {
        throw new SecurityPersistenceError(
          'ANONYMOUS_SUBJECT_RESOLUTION_FAILED',
        )
      }

      const result = anonymousSubjectRecordSchema.safeParse(data[0])

      if (!result.success) {
        throw new SecurityPersistenceError('SECURITY_RESPONSE_INVALID')
      }

      return result.data
    },

    async consumeQuota(input) {
      const { data, error } = await client.rpc(
        'consume_submission_quota_v1',
        {
          p_counter_kind: input.counterKind,
          p_expires_at: input.expiresAt,
          p_limit: input.limit,
          p_policy_hash: ensureSha256(input.policyHash),
          p_policy_version: input.policyVersion,
          p_scope: input.scope,
          p_subject_hmac: ensureSha256(input.subjectHmac),
          p_subject_type: input.subjectType,
          p_window_kind: input.windowKind,
          p_window_start: input.windowStart,
        },
      )

      if (error) {
        throw new SecurityPersistenceError('SECURITY_WRITE_FAILED')
      }

      const result = quotaRecordSchema.safeParse(data[0])

      if (!result.success) {
        throw new SecurityPersistenceError('SECURITY_RESPONSE_INVALID')
      }

      return result.data
    },

    async claimIdempotency(input) {
      const { data, error } = await client.rpc('claim_idempotency_v1', {
        p_expires_at: input.expiresAt,
        p_idempotency_key_hmac: ensureSha256(input.idempotencyKeyHmac),
        p_operation_code: input.operationCode,
        p_request_fingerprint: ensureSha256(input.requestFingerprint),
        p_subject_hmac: ensureSha256(input.subjectHmac),
        p_subject_type: input.subjectType,
      })

      if (error) {
        throw new SecurityPersistenceError('SECURITY_WRITE_FAILED')
      }

      const result = idempotencyClaimRecordSchema.safeParse(data[0])

      if (!result.success) {
        throw new SecurityPersistenceError('SECURITY_RESPONSE_INVALID')
      }

      return result.data
    },

    async completeIdempotency(input) {
      const { data, error } = await client.rpc('complete_idempotency_v1', {
        p_idempotency_key_hmac: ensureSha256(input.idempotencyKeyHmac),
        p_operation_code: input.operationCode,
        p_request_fingerprint: ensureSha256(input.requestFingerprint),
        p_resource_id: input.resourceId,
        p_resource_type: input.resourceType,
        p_response_code: input.responseCode,
        p_subject_hmac: ensureSha256(input.subjectHmac),
        p_subject_type: input.subjectType,
      })

      if (error || data !== true) {
        throw new SecurityPersistenceError('IDEMPOTENCY_STATE_INVALID')
      }
    },

    async failIdempotency(input) {
      const { data, error } = await client.rpc('fail_idempotency_v1', {
        p_idempotency_key_hmac: ensureSha256(input.idempotencyKeyHmac),
        p_operation_code: input.operationCode,
        p_request_fingerprint: ensureSha256(input.requestFingerprint),
        p_response_code: input.responseCode,
        p_subject_hmac: ensureSha256(input.subjectHmac),
        p_subject_type: input.subjectType,
      })

      if (error || data !== true) {
        throw new SecurityPersistenceError('IDEMPOTENCY_STATE_INVALID')
      }
    },
  }
}
