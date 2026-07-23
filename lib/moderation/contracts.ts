import { z } from 'zod'

export const moderationQualityStatuses = [
  'pending',
  'eligible',
  'excluded',
] as const
export const moderationSurveyTypes = [
  'search_benchmark',
  'company_experience',
] as const
export const moderationDecisions = ['eligible', 'excluded'] as const
export const moderationReasonCodes = [
  'quality_review_passed',
  'duplicate',
  'incoherent',
  'out_of_scope',
  'personal_data',
  'spam',
  'other',
] as const

export const moderationQueueQuerySchema = z
  .strictObject({
    qualityStatus: z.enum(moderationQualityStatuses).default('pending'),
    surveyType: z.enum(moderationSurveyTypes).nullable().default(null),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    beforeSubmittedAt: z.iso.datetime({ offset: true }).nullable().default(null),
    beforeSubmissionId: z.uuid().nullable().default(null),
  })
  .refine(
    (value) =>
      (value.beforeSubmittedAt === null) ===
      (value.beforeSubmissionId === null),
    {
      path: ['beforeSubmissionId'],
      message: 'Both cursor fields must be provided together',
    },
  )

export const moderationQueueItemSchema = z.strictObject({
  submissionId: z.uuid(),
  receiptId: z.uuid(),
  surveyType: z.enum(moderationSurveyTypes),
  schemaVersion: z.number().int().positive(),
  locale: z.enum(['tr', 'en']),
  qualityStatus: z.enum(moderationQualityStatuses),
  submittedAt: z.iso.datetime({ offset: true }),
  companyName: z.string().nullable(),
  appliedRole: z.string().nullable(),
  freeNote: z.string().nullable(),
  canonicalCompanyId: z.uuid().nullable(),
  roleId: z.uuid().nullable(),
  roleLevel: z.string().nullable(),
  targetRegion: z.string().nullable(),
  startedMonth: z.iso.date().nullable(),
  endedMonth: z.iso.date().nullable(),
  applicationsCount: z.number().int().nonnegative().nullable(),
  humanResponsesCount: z.number().int().nonnegative().nullable(),
  anyInterviewsCount: z.number().int().nonnegative().nullable(),
  offersCount: z.number().int().nonnegative().nullable(),
  qualitySignals: z.array(
    z.enum(['contact_information_candidate', 'external_link_candidate']),
  ),
  lastReasonCode: z.enum(moderationReasonCodes).nullable(),
})

export const moderationQueueResultSchema = z.strictObject({
  items: z.array(moderationQueueItemSchema),
  nextCursor: z
    .strictObject({
      beforeSubmittedAt: z.iso.datetime({ offset: true }),
      beforeSubmissionId: z.uuid(),
    })
    .nullable(),
})

export const moderationDecisionIdSchema = z.uuid()

export const moderationDecisionBodySchema = z
  .strictObject({
    decision: z.enum(moderationDecisions),
    reasonCode: z.enum(moderationReasonCodes),
    reviewerNote: z.string().trim().min(2).max(500).nullable(),
    companyId: z.uuid().nullable(),
  })
  .superRefine((value, context) => {
    const coherent =
      (value.decision === 'eligible' &&
        value.reasonCode === 'quality_review_passed') ||
      (value.decision === 'excluded' &&
        value.reasonCode !== 'quality_review_passed')
    if (!coherent) {
      context.addIssue({
        code: 'custom',
        path: ['reasonCode'],
        message: 'Reason must match the moderation decision',
      })
    }
    if (value.decision === 'excluded' && value.companyId !== null) {
      context.addIssue({
        code: 'custom',
        path: ['companyId'],
        message: 'Excluded contributions do not create company resolutions',
      })
    }
  })

export const moderationDecisionResultSchema = z.strictObject({
  decisionId: z.uuid(),
  submissionId: z.uuid(),
  qualityStatus: z.enum(['eligible', 'excluded']),
  decidedAt: z.iso.datetime({ offset: true }),
})

export const moderationCompanyQuerySchema = z.strictObject({
  query: z.string().trim().min(2).max(100),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export const moderationCompanySchema = z.strictObject({
  companyId: z.uuid(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
  displayName: z.string().trim().min(1).max(200),
  countryCode: z
    .string()
    .regex(/^[A-Z]{2}$/u)
    .nullable(),
  verificationStatus: z.enum(['unverified', 'pending', 'verified']),
  publicationStatus: z.enum(['hidden', 'eligible', 'published']),
})

export const moderationCompanyCreateBodySchema = z.strictObject({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
  displayName: z.string().trim().min(1).max(200),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/u)
    .nullable(),
})

export type ModerationQueueResult = z.infer<
  typeof moderationQueueResultSchema
>
export type ModerationDecisionResult = z.infer<
  typeof moderationDecisionResultSchema
>
export type ModerationCompany = z.infer<typeof moderationCompanySchema>
