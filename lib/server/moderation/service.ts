import 'server-only'

import { z } from 'zod'

import {
  moderationDecisionBodySchema,
  moderationDecisionIdSchema,
  moderationDecisionResultSchema,
  moderationCompanyCreateBodySchema,
  moderationCompanyQuerySchema,
  moderationCompanySchema,
  moderationQueueItemSchema,
  moderationQueueQuerySchema,
  moderationQueueResultSchema,
  type ModerationDecisionResult,
  type ModerationQueueResult,
} from '@/lib/moderation/contracts'
import {
  ModerationPersistenceError,
  ModerationServiceError,
} from '@/lib/moderation/errors'
import type { ModerationActor } from '@/lib/server/moderation/actor'
import {
  createSupabaseModerationRepository,
  type ModerationRepository,
} from '@/lib/server/moderation/repository'

const submissionIdSchema = z.uuid()

function mapPersistenceError(error: ModerationPersistenceError): never {
  throw new ModerationServiceError(error.code)
}

export function createModerationService(repository: ModerationRepository) {
  return {
    async list(input: {
      actor: ModerationActor
      query: unknown
    }): Promise<ModerationQueueResult> {
      const query = moderationQueueQuerySchema.safeParse(input.query)
      if (!query.success) {
        throw new ModerationServiceError('MODERATION_QUERY_INVALID')
      }

      let records
      try {
        records = await repository.listQueue({
          reviewerUserId: input.actor.userId,
          qualityStatus: query.data.qualityStatus,
          surveyType: query.data.surveyType,
          limit: query.data.limit,
          beforeSubmittedAt: query.data.beforeSubmittedAt,
          beforeSubmissionId: query.data.beforeSubmissionId,
        })
      } catch (error) {
        if (error instanceof ModerationPersistenceError) {
          mapPersistenceError(error)
        }
        throw new ModerationServiceError('MODERATION_READ_FAILED')
      }

      const items = records.map((record) =>
        moderationQueueItemSchema.parse({
          submissionId: record.submission_id,
          receiptId: record.receipt_id,
          surveyType: record.survey_type,
          schemaVersion: record.schema_version,
          locale: record.locale,
          qualityStatus: record.quality_status,
          submittedAt: record.submitted_at,
          companyName: record.company_name,
          appliedRole: record.applied_role,
          freeNote: record.free_note,
          canonicalCompanyId: record.canonical_company_id,
          roleId: record.role_id,
          roleLevel: record.role_level,
          targetRegion: record.target_region,
          startedMonth: record.started_month,
          endedMonth: record.ended_month,
          applicationsCount: record.applications_count,
          humanResponsesCount: record.human_responses_count,
          anyInterviewsCount: record.any_interviews_count,
          offersCount: record.offers_count,
          qualitySignals: record.quality_signals,
          lastReasonCode: record.last_reason_code,
        }),
      )
      const last = items.at(-1)
      return moderationQueueResultSchema.parse({
        items,
        nextCursor:
          items.length === query.data.limit && last
            ? {
                beforeSubmittedAt: last.submittedAt,
                beforeSubmissionId: last.submissionId,
              }
            : null,
      })
    },

    async decide(input: {
      actor: ModerationActor
      submissionId: unknown
      decisionId: unknown
      body: unknown
    }): Promise<ModerationDecisionResult> {
      const submissionId = submissionIdSchema.safeParse(input.submissionId)
      const decisionId = moderationDecisionIdSchema.safeParse(input.decisionId)
      const body = moderationDecisionBodySchema.safeParse(input.body)
      if (!submissionId.success || !decisionId.success || !body.success) {
        throw new ModerationServiceError('MODERATION_BODY_INVALID')
      }

      let record
      try {
        record = await repository.decide({
          reviewerUserId: input.actor.userId,
          submissionId: submissionId.data,
          decisionId: decisionId.data,
          decision: body.data.decision,
          reasonCode: body.data.reasonCode,
          reviewerNote: body.data.reviewerNote,
          companyId: body.data.companyId,
        })
      } catch (error) {
        if (error instanceof ModerationPersistenceError) {
          mapPersistenceError(error)
        }
        throw new ModerationServiceError('MODERATION_WRITE_FAILED')
      }

      try {
        return moderationDecisionResultSchema.parse({
          decisionId: record.decision_id,
          submissionId: record.submission_id,
          qualityStatus: record.quality_status,
          decidedAt: record.decided_at,
        })
      } catch {
        throw new ModerationServiceError('MODERATION_RESPONSE_INVALID')
      }
    },

    async listCompanies(input: {
      actor: ModerationActor
      query: unknown
    }) {
      const query = moderationCompanyQuerySchema.safeParse(input.query)
      if (!query.success) {
        throw new ModerationServiceError('MODERATION_COMPANY_QUERY_INVALID')
      }
      let records
      try {
        records = await repository.listCompanies({
          reviewerUserId: input.actor.userId,
          query: query.data.query,
          limit: query.data.limit,
        })
      } catch (error) {
        if (error instanceof ModerationPersistenceError) {
          mapPersistenceError(error)
        }
        throw new ModerationServiceError('MODERATION_READ_FAILED')
      }
      return {
        items: records.map((record) =>
          moderationCompanySchema.parse({
            companyId: record.company_id,
            slug: record.slug,
            displayName: record.display_name,
            countryCode: record.country_code,
            verificationStatus: record.verification_status,
            publicationStatus: record.publication_status,
          }),
        ),
      }
    },

    async createCompany(input: {
      actor: ModerationActor
      companyId: unknown
      body: unknown
    }) {
      const companyId = moderationDecisionIdSchema.safeParse(input.companyId)
      const body = moderationCompanyCreateBodySchema.safeParse(input.body)
      if (!companyId.success || !body.success) {
        throw new ModerationServiceError('MODERATION_BODY_INVALID')
      }
      let record
      try {
        record = await repository.createCompany({
          reviewerUserId: input.actor.userId,
          companyId: companyId.data,
          slug: body.data.slug,
          displayName: body.data.displayName,
          countryCode: body.data.countryCode,
        })
      } catch (error) {
        if (error instanceof ModerationPersistenceError) {
          mapPersistenceError(error)
        }
        throw new ModerationServiceError('MODERATION_WRITE_FAILED')
      }
      try {
        return moderationCompanySchema.parse({
          companyId: record.company_id,
          slug: record.slug,
          displayName: record.display_name,
          countryCode: record.country_code,
          verificationStatus: record.verification_status,
          publicationStatus: record.publication_status,
        })
      } catch {
        throw new ModerationServiceError('MODERATION_RESPONSE_INVALID')
      }
    },
  }
}

/* v8 ignore start -- production composition root */
export function createDefaultModerationService() {
  return createModerationService(createSupabaseModerationRepository())
}
/* v8 ignore stop */
