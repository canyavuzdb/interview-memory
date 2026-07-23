import 'server-only'

import { z } from 'zod'

import { ModerationPersistenceError } from '@/lib/moderation/errors'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

const queueRecordSchema = z.strictObject({
  submission_id: z.uuid(),
  receipt_id: z.uuid(),
  survey_type: z.string(),
  schema_version: z.number().int(),
  locale: z.string(),
  quality_status: z.string(),
  submitted_at: z.string(),
  company_name: z.string().nullable(),
  applied_role: z.string().nullable(),
  free_note: z.string().nullable(),
  canonical_company_id: z.uuid().nullable(),
  role_id: z.uuid().nullable(),
  role_level: z.string().nullable(),
  target_region: z.string().nullable(),
  started_month: z.string().nullable(),
  ended_month: z.string().nullable(),
  applications_count: z.number().int().nullable(),
  human_responses_count: z.number().int().nullable(),
  any_interviews_count: z.number().int().nullable(),
  offers_count: z.number().int().nullable(),
  quality_signals: z.array(z.string()),
  last_reason_code: z.string().nullable(),
})

const decisionRecordSchema = z.strictObject({
  decision_id: z.uuid(),
  submission_id: z.uuid(),
  quality_status: z.string(),
  decided_at: z.string(),
})
const companyRecordSchema = z.strictObject({
  company_id: z.uuid(),
  slug: z.string(),
  display_name: z.string(),
  country_code: z.string().nullable(),
  verification_status: z.string(),
  publication_status: z.string(),
})

export type ModerationQueueRecord = z.infer<typeof queueRecordSchema>
export type ModerationDecisionRecord = z.infer<typeof decisionRecordSchema>
export type ModerationCompanyRecord = z.infer<typeof companyRecordSchema>

export interface ModerationRepository {
  listQueue(input: {
    reviewerUserId: string
    qualityStatus: string
    surveyType: string | null
    limit: number
    beforeSubmittedAt: string | null
    beforeSubmissionId: string | null
  }): Promise<ModerationQueueRecord[]>
  decide(input: {
    reviewerUserId: string
    submissionId: string
    decisionId: string
    decision: string
    reasonCode: string
    reviewerNote: string | null
    companyId: string | null
  }): Promise<ModerationDecisionRecord>
  listCompanies(input: {
    reviewerUserId: string
    query: string
    limit: number
  }): Promise<ModerationCompanyRecord[]>
  createCompany(input: {
    reviewerUserId: string
    companyId: string
    slug: string
    displayName: string
    countryCode: string | null
  }): Promise<ModerationCompanyRecord>
}

function mapError(message = '', operation: 'read' | 'write') {
  if (message.includes('moderator_role_required')) {
    return 'MODERATION_FORBIDDEN' as const
  }
  if (message.includes('moderation_self_review_forbidden')) {
    return 'MODERATION_SELF_REVIEW_FORBIDDEN' as const
  }
  if (message.includes('moderation_submission_not_found')) {
    return 'MODERATION_NOT_FOUND' as const
  }
  if (message.includes('company_resolution_required')) {
    return 'MODERATION_COMPANY_RESOLUTION_REQUIRED' as const
  }
  if (
    message.includes('company_resolution_conflict') ||
    message.includes('company_resolution_invalid') ||
    message.includes('company_alias_resolution_conflict')
  ) {
    return 'MODERATION_COMPANY_RESOLUTION_CONFLICT' as const
  }
  if (message.includes('moderation_decision_id_conflict')) {
    return 'MODERATION_DECISION_CONFLICT' as const
  }
  if (message.includes('moderation_query_invalid')) {
    return 'MODERATION_QUERY_INVALID' as const
  }
  if (message.includes('moderation_company_query_invalid')) {
    return 'MODERATION_COMPANY_QUERY_INVALID' as const
  }
  if (
    message.includes('moderation_company_id_conflict') ||
    message.includes('moderation_company_slug_conflict') ||
    message.includes('companies_')
  ) {
    return 'MODERATION_COMPANY_CONFLICT' as const
  }
  if (message.includes('moderation_decision_invalid')) {
    return 'MODERATION_BODY_INVALID' as const
  }
  return operation === 'read'
    ? ('MODERATION_READ_FAILED' as const)
    : ('MODERATION_WRITE_FAILED' as const)
}

function nullableRpcArgument<T>(value: T | null): T {
  return value as T
}

export function createSupabaseModerationRepository(): ModerationRepository {
  const client = createAdminSupabaseClient()

  return {
    async listQueue(input) {
      const { data, error } = await client.rpc('list_moderation_queue_v1', {
        p_reviewer_user_id: input.reviewerUserId,
        p_quality_status: input.qualityStatus,
        p_survey_type: nullableRpcArgument(input.surveyType),
        p_limit: input.limit,
        p_before_submitted_at: nullableRpcArgument(input.beforeSubmittedAt),
        p_before_submission_id: nullableRpcArgument(input.beforeSubmissionId),
      })
      if (error) {
        throw new ModerationPersistenceError(mapError(error.message, 'read'))
      }
      const parsed = z.array(queueRecordSchema).safeParse(data)
      if (!parsed.success) {
        throw new ModerationPersistenceError('MODERATION_RESPONSE_INVALID')
      }
      return parsed.data
    },

    async decide(input) {
      const { data, error } = await client.rpc(
        'decide_submission_quality_v1',
        {
          p_reviewer_user_id: input.reviewerUserId,
          p_submission_id: input.submissionId,
          p_decision_id: input.decisionId,
          p_decision: input.decision,
          p_reason_code: input.reasonCode,
          p_reviewer_note: nullableRpcArgument(input.reviewerNote),
          p_company_id: nullableRpcArgument(input.companyId),
        },
      )
      if (error) {
        throw new ModerationPersistenceError(mapError(error.message, 'write'))
      }
      const parsed = decisionRecordSchema.safeParse(data?.[0])
      if (!parsed.success) {
        throw new ModerationPersistenceError('MODERATION_RESPONSE_INVALID')
      }
      return parsed.data
    },

    async listCompanies(input) {
      const { data, error } = await client.rpc(
        'list_moderation_companies_v1',
        {
          p_reviewer_user_id: input.reviewerUserId,
          p_query: input.query,
          p_limit: input.limit,
        },
      )
      if (error) {
        throw new ModerationPersistenceError(mapError(error.message, 'read'))
      }
      const parsed = z.array(companyRecordSchema).safeParse(data)
      if (!parsed.success) {
        throw new ModerationPersistenceError('MODERATION_RESPONSE_INVALID')
      }
      return parsed.data
    },

    async createCompany(input) {
      const { data, error } = await client.rpc(
        'create_moderation_company_v1',
        {
          p_reviewer_user_id: input.reviewerUserId,
          p_company_id: input.companyId,
          p_slug: input.slug,
          p_display_name: input.displayName,
          p_country_code: nullableRpcArgument(input.countryCode),
        },
      )
      if (error) {
        throw new ModerationPersistenceError(mapError(error.message, 'write'))
      }
      const parsed = companyRecordSchema.safeParse(data?.[0])
      if (!parsed.success) {
        throw new ModerationPersistenceError('MODERATION_RESPONSE_INVALID')
      }
      return parsed.data
    },
  }
}
