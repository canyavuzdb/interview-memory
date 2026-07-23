import 'server-only'

import { z } from 'zod'

import { ApplicationOutcomePersistenceError } from '@/lib/application-outcome/errors'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

const postgresSha256Schema = z.string().regex(/^\\x[0-9a-f]{64}$/u)
const outcomeRecordSchema = z.strictObject({
  application_id: z.uuid(),
  outcome_event_id: z.uuid(),
  outcome_code: z.string(),
})

export type ApplicationOutcomeRecord = z.infer<typeof outcomeRecordSchema>

type AuthorizationFields = {
  requesterDataSubjectId: string | null
  activeCapabilityHmac: string | null
  activeCapabilityKeyVersion: number | null
  previousCapabilityHmac: string | null
  previousCapabilityKeyVersion: number | null
}

export type AppendApplicationOutcomeInput = AuthorizationFields & {
  applicationId: string
  idempotencySubjectType: 'data_subject' | 'capability'
  idempotencySubjectHmac: string
  idempotencyKeyHmac: string
  idempotencyRequestFingerprint: string
  outcome: string
  occurredMonth: string | null
  plannedStartMonth: string | null
}

export interface ApplicationOutcomeRepository {
  appendOutcome(
    input: AppendApplicationOutcomeInput,
  ): Promise<ApplicationOutcomeRecord>
  getOutcomeResult(
    input: AuthorizationFields & { outcomeEventId: string },
  ): Promise<ApplicationOutcomeRecord | null>
}

function checkedHash(value: string) {
  const parsed = postgresSha256Schema.safeParse(value)
  if (!parsed.success) {
    throw new ApplicationOutcomePersistenceError(
      'APPLICATION_OUTCOME_WRITE_FAILED',
    )
  }
  return parsed.data
}

function nullableRpcArgument<T>(value: T | null): T {
  return value as T
}

function mapAppendError(message = '') {
  if (message.includes('application_not_found')) {
    return 'APPLICATION_OUTCOME_NOT_FOUND' as const
  }
  if (message.includes('application_owner_required')) {
    return 'APPLICATION_OUTCOME_AUTHORIZATION_INVALID' as const
  }
  if (
    message.includes('application_outcome_transition_invalid') ||
    message.includes('application_offer_required') ||
    message.includes('employment_outcome_required')
  ) {
    return 'APPLICATION_OUTCOME_TRANSITION_INVALID' as const
  }
  if (
    message.includes('application_outcome_payload_invalid') ||
    message.includes('application_outcome_events_')
  ) {
    return 'APPLICATION_OUTCOME_BODY_INVALID' as const
  }
  return 'APPLICATION_OUTCOME_WRITE_FAILED' as const
}

export function createSupabaseApplicationOutcomeRepository(): ApplicationOutcomeRepository {
  const client = createAdminSupabaseClient()

  return {
    async appendOutcome(input) {
      const { data, error } = await client.rpc('append_application_outcome_v1', {
        p_application_id: input.applicationId,
        p_requester_data_subject_id: nullableRpcArgument(
          input.requesterDataSubjectId,
        ),
        p_active_capability_hmac: nullableRpcArgument(
          input.activeCapabilityHmac === null
            ? null
            : checkedHash(input.activeCapabilityHmac),
        ),
        p_active_capability_key_version: nullableRpcArgument(
          input.activeCapabilityKeyVersion,
        ),
        p_previous_capability_hmac: nullableRpcArgument(
          input.previousCapabilityHmac === null
            ? null
            : checkedHash(input.previousCapabilityHmac),
        ),
        p_previous_capability_key_version: nullableRpcArgument(
          input.previousCapabilityKeyVersion,
        ),
        p_idempotency_subject_type: input.idempotencySubjectType,
        p_idempotency_subject_hmac: checkedHash(input.idempotencySubjectHmac),
        p_idempotency_key_hmac: checkedHash(input.idempotencyKeyHmac),
        p_idempotency_request_fingerprint: checkedHash(
          input.idempotencyRequestFingerprint,
        ),
        p_outcome_code: input.outcome,
        p_occurred_month: nullableRpcArgument(input.occurredMonth),
        p_planned_start_month: nullableRpcArgument(input.plannedStartMonth),
      })
      if (error) {
        throw new ApplicationOutcomePersistenceError(
          mapAppendError(error.message),
        )
      }
      const parsed = outcomeRecordSchema.safeParse(data?.[0])
      if (!parsed.success) {
        throw new ApplicationOutcomePersistenceError(
          'APPLICATION_OUTCOME_RESPONSE_INVALID',
        )
      }
      return parsed.data
    },

    async getOutcomeResult(input) {
      const { data, error } = await client.rpc(
        'get_application_outcome_result_v1',
        {
          p_outcome_event_id: input.outcomeEventId,
          p_requester_data_subject_id: nullableRpcArgument(
            input.requesterDataSubjectId,
          ),
          p_active_capability_hmac: nullableRpcArgument(
            input.activeCapabilityHmac,
          ),
          p_active_capability_key_version: nullableRpcArgument(
            input.activeCapabilityKeyVersion,
          ),
          p_previous_capability_hmac: nullableRpcArgument(
            input.previousCapabilityHmac,
          ),
          p_previous_capability_key_version: nullableRpcArgument(
            input.previousCapabilityKeyVersion,
          ),
        },
      )
      if (error) {
        throw new ApplicationOutcomePersistenceError(
          'APPLICATION_OUTCOME_REPLAY_FAILED',
        )
      }
      if (!data?.[0]) return null
      const parsed = outcomeRecordSchema.safeParse(data[0])
      if (!parsed.success) {
        throw new ApplicationOutcomePersistenceError(
          'APPLICATION_OUTCOME_RESPONSE_INVALID',
        )
      }
      return parsed.data
    },
  }
}
