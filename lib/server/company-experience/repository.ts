import 'server-only'

import { z } from 'zod'

import { CompanyExperiencePersistenceError } from '@/lib/company-experience/errors'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

const postgresSha256Schema = z.string().regex(/^\\x[0-9a-f]{64}$/u)
const createResultSchema = z.strictObject({
  submission_id: z.uuid(),
  receipt_id: z.uuid(),
  company_experience_id: z.uuid(),
  job_application_id: z.uuid(),
})
const replayResultSchema = createResultSchema.extend({
  capability_key_version: z.number().int().positive().nullable(),
})

export type CompanyExperienceCreateRecord = z.infer<typeof createResultSchema>
export type CompanyExperienceReplayRecord = z.infer<typeof replayResultSchema>

type HashFields = {
  payloadHash: string
  commandFingerprint: string
  capabilityHmac: string | null
  consentSubjectProofHmac: string
  idempotencySubjectHmac: string
  idempotencyKeyHmac: string
  idempotencyRequestFingerprint: string
  quotaSubjectHmac: string
  quotaPolicyHash: string
}

export type CreateCompanyExperienceInput = HashFields & {
  dataSubjectId: string
  schemaVersion: number
  locale: 'tr' | 'en'
  noticeVersionId: string
  supersedesSubmissionId: string | null
  capabilityKeyVersion: number | null
  capabilityExpiresAt: string | null
  consentSubjectProofKeyVersion: number
  consentIdempotencyKey: string
  quota24hWindowStart: string
  quota24hLimit: number
  quota24hExpiresAt: string
  quota30dWindowStart: string
  quota30dLimit: number
  quota30dExpiresAt: string
  quotaPolicyVersion: string
  companyName: string
  appliedRole: string
  processYear: number
  promisedTimeline: string
  promisedDays: number | null
  actualDays: number | null
  wasGhosted: boolean
  ghostedAfterStage: string | null
  interviewerPrepared: number | null
  wasAskedIrrelevant: boolean
  irrelevantTypes: string[]
  rejectionShared: string
  feedbackUseful: number | null
  processTransparency: number
  hrProfessionalism: number
  wouldRecommendProcess: string
  freeNote: string | null
  applicationMonth: string
  applicationChannel: string
  hadReferral: boolean
  lastStage: string
  currentOutcome: string
  outcomeMonth: string | null
  plannedStartMonth: string | null
}

export interface CompanyExperienceRepository {
  createCompanyExperience(
    input: CreateCompanyExperienceInput,
  ): Promise<CompanyExperienceCreateRecord>
  getCreateResult(input: {
    submissionId: string
    dataSubjectId: string
  }): Promise<CompanyExperienceReplayRecord | null>
}

function checkedHash(value: string) {
  const result = postgresSha256Schema.safeParse(value)
  if (!result.success) {
    throw new CompanyExperiencePersistenceError(
      'COMPANY_EXPERIENCE_WRITE_FAILED',
    )
  }
  return result.data
}

function nullableHash(value: string | null) {
  return value === null ? null : checkedHash(value)
}

function nullableRpcArgument<T>(value: T | null): T {
  return value as T
}

function mapCreateError(error: { message?: string }) {
  const message = error.message ?? ''
  if (message.includes('accepted_quota_exceeded')) {
    return 'COMPANY_EXPERIENCE_QUOTA_EXCEEDED' as const
  }
  if (message.includes('survey_notice_not_effective')) {
    return 'COMPANY_EXPERIENCE_NOTICE_NOT_FOUND' as const
  }
  if (message.includes('survey_submissions_command_unique')) {
    return 'COMPANY_EXPERIENCE_DUPLICATE' as const
  }
  if (
    message.includes('company_experiences_') ||
    message.includes('job_applications_') ||
    message.includes('application_context_invalid') ||
    message.includes('application_stage_outcome_invalid')
  ) {
    return 'COMPANY_EXPERIENCE_BODY_INVALID' as const
  }
  return 'COMPANY_EXPERIENCE_WRITE_FAILED' as const
}

export function createSupabaseCompanyExperienceRepository(): CompanyExperienceRepository {
  const client = createAdminSupabaseClient()

  return {
    async createCompanyExperience(input) {
      const { data, error } = await client.rpc('create_company_experience_with_application_v1', {
        p_data_subject_id: input.dataSubjectId,
        p_schema_version: input.schemaVersion,
        p_locale: input.locale,
        p_notice_version_id: input.noticeVersionId,
        p_payload_hash: checkedHash(input.payloadHash),
        p_command_fingerprint: checkedHash(input.commandFingerprint),
        p_supersedes_submission_id: nullableRpcArgument(input.supersedesSubmissionId),
        p_capability_hmac: nullableRpcArgument(nullableHash(input.capabilityHmac)),
        p_capability_key_version: nullableRpcArgument(input.capabilityKeyVersion),
        p_capability_expires_at: nullableRpcArgument(input.capabilityExpiresAt),
        p_consent_subject_proof_hmac: checkedHash(input.consentSubjectProofHmac),
        p_consent_subject_proof_key_version: input.consentSubjectProofKeyVersion,
        p_consent_idempotency_key: input.consentIdempotencyKey,
        p_idempotency_subject_hmac: checkedHash(input.idempotencySubjectHmac),
        p_idempotency_key_hmac: checkedHash(input.idempotencyKeyHmac),
        p_idempotency_request_fingerprint: checkedHash(input.idempotencyRequestFingerprint),
        p_quota_subject_hmac: checkedHash(input.quotaSubjectHmac),
        p_quota_24h_window_start: input.quota24hWindowStart,
        p_quota_24h_limit: input.quota24hLimit,
        p_quota_24h_expires_at: input.quota24hExpiresAt,
        p_quota_30d_window_start: input.quota30dWindowStart,
        p_quota_30d_limit: input.quota30dLimit,
        p_quota_30d_expires_at: input.quota30dExpiresAt,
        p_quota_policy_version: input.quotaPolicyVersion,
        p_quota_policy_hash: checkedHash(input.quotaPolicyHash),
        p_company_name: input.companyName,
        p_applied_role: input.appliedRole,
        p_process_year: input.processYear,
        p_promised_timeline: input.promisedTimeline,
        p_promised_days: nullableRpcArgument(input.promisedDays),
        p_actual_days: nullableRpcArgument(input.actualDays),
        p_was_ghosted: input.wasGhosted,
        p_ghosted_after_stage: nullableRpcArgument(input.ghostedAfterStage),
        p_interviewer_prepared: nullableRpcArgument(input.interviewerPrepared),
        p_was_asked_irrelevant: input.wasAskedIrrelevant,
        p_irrelevant_types: input.irrelevantTypes,
        p_rejection_shared: input.rejectionShared,
        p_feedback_useful: nullableRpcArgument(input.feedbackUseful),
        p_process_transparency: input.processTransparency,
        p_hr_professionalism: input.hrProfessionalism,
        p_would_recommend_process: input.wouldRecommendProcess,
        p_free_note: nullableRpcArgument(input.freeNote),
        p_application_month: input.applicationMonth,
        p_application_channel: input.applicationChannel,
        p_had_referral: input.hadReferral,
        p_last_stage: input.lastStage,
        p_current_outcome: input.currentOutcome,
        p_outcome_month: nullableRpcArgument(input.outcomeMonth),
        p_planned_start_month: nullableRpcArgument(input.plannedStartMonth),
      })

      if (error) throw new CompanyExperiencePersistenceError(mapCreateError(error))
      const result = createResultSchema.safeParse(data?.[0])
      if (!result.success) {
        throw new CompanyExperiencePersistenceError(
          'COMPANY_EXPERIENCE_RESPONSE_INVALID',
        )
      }
      return result.data
    },

    async getCreateResult(input) {
      const { data, error } = await client.rpc(
        'get_company_application_create_result_v1',
        {
          p_submission_id: input.submissionId,
          p_data_subject_id: input.dataSubjectId,
        },
      )
      if (error) {
        throw new CompanyExperiencePersistenceError(
          'COMPANY_EXPERIENCE_REPLAY_FAILED',
        )
      }
      if (!data?.[0]) return null
      const result = replayResultSchema.safeParse(data[0])
      if (!result.success) {
        throw new CompanyExperiencePersistenceError(
          'COMPANY_EXPERIENCE_RESPONSE_INVALID',
        )
      }
      return result.data
    },
  }
}
