import 'server-only'

import { z } from 'zod'

import type { AuthenticatedSubjectRecord } from '@/lib/database/database.types'
import { IntakePersistenceError } from '@/lib/intake/errors'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

const postgresSha256Schema = z.string().regex(/^\\x[0-9a-f]{64}$/u)
const receiptRecordSchema = z.strictObject({
  receipt_id: z.uuid(),
  survey_type: z.string(),
  lifecycle_status: z.string(),
  quality_status: z.string(),
  submitted_at: z.iso.datetime({ offset: true }),
  withdrawn_at: z.iso.datetime({ offset: true }).nullable(),
  capability_rotated: z.boolean(),
})
export type SubmissionReceiptRecord = z.infer<typeof receiptRecordSchema>
const subjectRecordSchema: z.ZodType<AuthenticatedSubjectRecord> = z.strictObject({
  data_subject_id: z.uuid(),
})
const subjectMergeRecordSchema = z.strictObject({
  data_subject_id: z.uuid(),
  merged: z.boolean(),
})
export type SubjectMergeRecord = z.infer<typeof subjectMergeRecordSchema>

export interface IntakeRepository {
  getSubmissionReceipt(input: {
    receiptId: string
    requesterDataSubjectId: string | null
    activeCapabilityHmac: string | null
    activeCapabilityKeyVersion: number | null
    previousCapabilityHmac: string | null
    previousCapabilityKeyVersion: number | null
  }): Promise<SubmissionReceiptRecord | null>
  resolveAuthenticatedSubject(authUserId: string): Promise<string | null>
  mergeAnonymousSubject(input: {
    authUserId: string
    activeAnonymousHmac: string
    previousAnonymousHmac: string | null
    anonymousQuotaSubjectHmac: string
    authenticatedQuotaSubjectHmac: string
  }): Promise<SubjectMergeRecord>
}

function checkedHash(
  value: string | null,
  errorCode: 'SUBMISSION_RECEIPT_READ_FAILED' | 'ANONYMOUS_SUBJECT_MERGE_FAILED' =
    'SUBMISSION_RECEIPT_READ_FAILED',
) {
  if (value === null) return undefined
  const result = postgresSha256Schema.safeParse(value)
  if (!result.success) {
    throw new IntakePersistenceError(errorCode)
  }
  return result.data
}

export function createSupabaseIntakeRepository(): IntakeRepository {
  const client = createAdminSupabaseClient()

  return {
    async getSubmissionReceipt(input) {
      const { data, error } = await client.rpc('get_submission_receipt_v1', {
        p_receipt_id: input.receiptId,
        p_requester_data_subject_id: input.requesterDataSubjectId ?? undefined,
        p_active_capability_hmac: checkedHash(input.activeCapabilityHmac),
        p_active_capability_key_version:
          input.activeCapabilityKeyVersion ?? undefined,
        p_previous_capability_hmac: checkedHash(
          input.previousCapabilityHmac,
        ),
        p_previous_capability_key_version:
          input.previousCapabilityKeyVersion ?? undefined,
      })

      if (error) {
        throw new IntakePersistenceError('SUBMISSION_RECEIPT_READ_FAILED')
      }

      if (!data[0]) return null
      const result = receiptRecordSchema.safeParse(data[0])
      if (!result.success) {
        throw new IntakePersistenceError(
          'SUBMISSION_RECEIPT_RESPONSE_INVALID',
        )
      }
      return result.data
    },

    async resolveAuthenticatedSubject(authUserId) {
      const { data, error } = await client.rpc(
        'resolve_authenticated_subject_v1',
        { p_auth_user_id: authUserId },
      )
      if (error) {
        throw new IntakePersistenceError('SUBMISSION_RECEIPT_READ_FAILED')
      }
      if (!data[0]) return null
      const result = subjectRecordSchema.safeParse(data[0])
      if (!result.success) {
        throw new IntakePersistenceError(
          'SUBMISSION_RECEIPT_RESPONSE_INVALID',
        )
      }
      return result.data.data_subject_id
    },

    async mergeAnonymousSubject(input) {
      const activeAnonymousHmac = checkedHash(
        input.activeAnonymousHmac,
        'ANONYMOUS_SUBJECT_MERGE_FAILED',
      )
      const { data, error } = await client.rpc('merge_anonymous_subject_v1', {
        p_auth_user_id: input.authUserId,
        p_active_anonymous_hmac: activeAnonymousHmac!,
        p_previous_anonymous_hmac:
          checkedHash(
            input.previousAnonymousHmac,
            'ANONYMOUS_SUBJECT_MERGE_FAILED',
          ) ?? activeAnonymousHmac!,
        p_anonymous_quota_subject_hmac:
          checkedHash(
            input.anonymousQuotaSubjectHmac,
            'ANONYMOUS_SUBJECT_MERGE_FAILED',
          )!,
        p_authenticated_quota_subject_hmac:
          checkedHash(
            input.authenticatedQuotaSubjectHmac,
            'ANONYMOUS_SUBJECT_MERGE_FAILED',
          )!,
      })

      if (error) {
        throw new IntakePersistenceError('ANONYMOUS_SUBJECT_MERGE_FAILED')
      }

      const result = subjectMergeRecordSchema.safeParse(data?.[0])
      if (!result.success) {
        throw new IntakePersistenceError(
          'ANONYMOUS_SUBJECT_MERGE_RESPONSE_INVALID',
        )
      }
      return result.data
    },
  }
}
