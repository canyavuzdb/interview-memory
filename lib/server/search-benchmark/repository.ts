import 'server-only'

import { z } from 'zod'

import { SearchBenchmarkPersistenceError } from '@/lib/search-benchmark/errors'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

const postgresSha256Schema = z.string().regex(/^\\x[0-9a-f]{64}$/u)
const createResultSchema = z.strictObject({
  submission_id: z.uuid(),
  receipt_id: z.uuid(),
  search_episode_id: z.uuid(),
})
const replayResultSchema = createResultSchema.extend({
  capability_key_version: z.number().int().positive().nullable(),
})

export type SearchEpisodeCreateRecord = z.infer<typeof createResultSchema>
export type SearchEpisodeReplayRecord = z.infer<typeof replayResultSchema>

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

export type CreateSearchEpisodeInput = HashFields & {
  dataSubjectId: string
  schemaVersion: number
  locale: 'tr' | 'en'
  noticeVersionId: string
  supersedesSubmissionId: string | null
  capabilityKeyVersion: number | null
  capabilityExpiresAt: string | null
  consentSubjectProofKeyVersion: number
  consentIdempotencyKey: string
  quotaWindowStart: string
  quotaLimit: number
  quotaPolicyVersion: string
  quotaExpiresAt: string
  roleSlug: string
  sectorSlug: string | null
  roleLevel: string
  experienceBand: string
  targetRegion: string
  employmentType: string | null
  workMode: string | null
  startedMonth: string
  endedMonth: string | null
  status: string
  currentlyEmployed: boolean
  countsAreEstimated: boolean
  observedThrough: string
  applicationsCount: number
  humanResponsesCount: number
  anyInterviewsCount: number
  hrInterviewsCount: number
  technicalInterviewsCount: number
  offersCount: number
  acceptedOffersCount: number
  employmentStartedCount: number
}

export interface SearchBenchmarkRepository {
  createSearchEpisode(
    input: CreateSearchEpisodeInput,
  ): Promise<SearchEpisodeCreateRecord>
  getCreateResult(input: {
    submissionId: string
    dataSubjectId: string
  }): Promise<SearchEpisodeReplayRecord | null>
}

function checkedHash(value: string) {
  const result = postgresSha256Schema.safeParse(value)
  if (!result.success) {
    throw new SearchBenchmarkPersistenceError(
      'SEARCH_BENCHMARK_WRITE_FAILED',
    )
  }
  return result.data
}

function nullableHash(value: string | null) {
  return value === null ? null : checkedHash(value)
}

// Supabase's generated RPC input types do not preserve nullable PostgreSQL
// parameters unless they also have defaults. The database function validates
// these nullable tuples, so keep the runtime null while narrowing only here.
function nullableRpcArgument<T>(value: T | null): T {
  return value as T
}

function mapCreateError(error: { message?: string }) {
  const message = error.message ?? ''

  if (message.includes('accepted_quota_exceeded')) {
    return 'SEARCH_BENCHMARK_QUOTA_EXCEEDED' as const
  }
  if (
    message.includes('search_episode_role_not_active') ||
    message.includes('search_episode_sector_not_active')
  ) {
    return 'SEARCH_BENCHMARK_CATALOG_INVALID' as const
  }
  if (message.includes('survey_notice_not_effective')) {
    return 'SEARCH_BENCHMARK_NOTICE_NOT_FOUND' as const
  }
  if (message.includes('survey_submissions_command_unique')) {
    return 'SEARCH_BENCHMARK_DUPLICATE' as const
  }
  if (message.includes('search_episode_status_count_mismatch')) {
    return 'SEARCH_BENCHMARK_BODY_INVALID' as const
  }
  return 'SEARCH_BENCHMARK_WRITE_FAILED' as const
}

export function createSupabaseSearchBenchmarkRepository(): SearchBenchmarkRepository {
  const client = createAdminSupabaseClient()

  return {
    async createSearchEpisode(input) {
      const { data, error } = await client.rpc('create_search_episode_v1', {
        p_data_subject_id: input.dataSubjectId,
        p_schema_version: input.schemaVersion,
        p_locale: input.locale,
        p_notice_version_id: input.noticeVersionId,
        p_payload_hash: checkedHash(input.payloadHash),
        p_command_fingerprint: checkedHash(input.commandFingerprint),
        p_supersedes_submission_id: nullableRpcArgument(
          input.supersedesSubmissionId,
        ),
        p_capability_hmac: nullableRpcArgument(
          nullableHash(input.capabilityHmac),
        ),
        p_capability_key_version: nullableRpcArgument(
          input.capabilityKeyVersion,
        ),
        p_capability_expires_at: nullableRpcArgument(
          input.capabilityExpiresAt,
        ),
        p_consent_subject_proof_hmac: checkedHash(
          input.consentSubjectProofHmac,
        ),
        p_consent_subject_proof_key_version:
          input.consentSubjectProofKeyVersion,
        p_consent_idempotency_key: input.consentIdempotencyKey,
        p_idempotency_subject_hmac: checkedHash(
          input.idempotencySubjectHmac,
        ),
        p_idempotency_key_hmac: checkedHash(input.idempotencyKeyHmac),
        p_idempotency_request_fingerprint: checkedHash(
          input.idempotencyRequestFingerprint,
        ),
        p_quota_subject_hmac: checkedHash(input.quotaSubjectHmac),
        p_quota_window_start: input.quotaWindowStart,
        p_quota_limit: input.quotaLimit,
        p_quota_policy_version: input.quotaPolicyVersion,
        p_quota_policy_hash: checkedHash(input.quotaPolicyHash),
        p_quota_expires_at: input.quotaExpiresAt,
        p_role_slug: input.roleSlug,
        p_sector_slug: nullableRpcArgument(input.sectorSlug),
        p_role_level: input.roleLevel,
        p_experience_band: input.experienceBand,
        p_target_region: input.targetRegion,
        p_employment_type: nullableRpcArgument(input.employmentType),
        p_work_mode: nullableRpcArgument(input.workMode),
        p_started_month: input.startedMonth,
        p_ended_month: nullableRpcArgument(input.endedMonth),
        p_status: input.status,
        p_currently_employed: input.currentlyEmployed,
        p_counts_are_estimated: input.countsAreEstimated,
        p_observed_through: input.observedThrough,
        p_applications_count: input.applicationsCount,
        p_human_responses_count: input.humanResponsesCount,
        p_any_interviews_count: input.anyInterviewsCount,
        p_hr_interviews_count: input.hrInterviewsCount,
        p_technical_interviews_count: input.technicalInterviewsCount,
        p_offers_count: input.offersCount,
        p_accepted_offers_count: input.acceptedOffersCount,
        p_employment_started_count: input.employmentStartedCount,
      })

      if (error) {
        throw new SearchBenchmarkPersistenceError(mapCreateError(error))
      }

      const result = createResultSchema.safeParse(data?.[0])
      if (!result.success) {
        throw new SearchBenchmarkPersistenceError(
          'SEARCH_BENCHMARK_RESPONSE_INVALID',
        )
      }
      return result.data
    },

    async getCreateResult(input) {
      const { data, error } = await client.rpc(
        'get_search_episode_create_result_v1',
        {
          p_submission_id: input.submissionId,
          p_data_subject_id: input.dataSubjectId,
        },
      )

      if (error) {
        throw new SearchBenchmarkPersistenceError(
          'SEARCH_BENCHMARK_REPLAY_FAILED',
        )
      }
      if (!data?.[0]) return null

      const result = replayResultSchema.safeParse(data[0])
      if (!result.success) {
        throw new SearchBenchmarkPersistenceError(
          'SEARCH_BENCHMARK_RESPONSE_INVALID',
        )
      }
      return result.data
    },
  }
}
