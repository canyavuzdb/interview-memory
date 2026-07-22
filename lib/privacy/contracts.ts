import { z } from 'zod'

export const supportedLocales = ['tr', 'en'] as const
export const noticeDocumentTypes = [
  'account_notice',
  'survey_notice',
  'company_experience_notice',
  'cookie_notice',
  'publication_consent',
] as const
export const consentPurposeCodes = [
  'account_service',
  'survey_contribution',
  'benchmark_publication',
  'experience_follow_up',
] as const
export const consentDecisions = ['granted', 'denied', 'withdrawn'] as const
export const recordConsentDecisions = ['granted', 'denied'] as const

const sha256HexSchema = z
  .string()
  .regex(/^\\x[0-9a-f]{64}$/u, 'Expected a PostgreSQL SHA-256 bytea value')

export const currentNoticeQuerySchema = z.strictObject({
  documentType: z.enum(noticeDocumentTypes),
  locale: z.enum(supportedLocales),
})

export const currentNoticeDtoSchema = z.strictObject({
  id: z.uuid(),
  documentType: z.enum(noticeDocumentTypes),
  locale: z.enum(supportedLocales),
  version: z.string().trim().min(1).max(50),
  contentSha256: sha256HexSchema,
  contentUri: z.string().trim().min(1).max(2048),
  effectiveFrom: z.iso.datetime({ offset: true }),
})

export const recordConsentCommandSchema = z.strictObject({
  noticeVersionId: z.uuid(),
  purposeCode: z.enum(consentPurposeCodes),
  decision: z.enum(recordConsentDecisions),
  idempotencyKey: z.uuid(),
})

export const consentReceiptDtoSchema = z.strictObject({
  eventId: z.uuid(),
  createdAt: z.iso.datetime({ offset: true }),
  replayed: z.boolean(),
})

export type CurrentNoticeQuery = z.infer<typeof currentNoticeQuerySchema>
export type CurrentNoticeDto = z.infer<typeof currentNoticeDtoSchema>
export type RecordConsentCommand = z.infer<typeof recordConsentCommandSchema>
export type ConsentReceiptDto = z.infer<typeof consentReceiptDtoSchema>
