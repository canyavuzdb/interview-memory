import 'server-only'

import { z } from 'zod'

import type {
  ConsentEventRow,
  DataSubjectRow,
  NoticeVersionRow,
  UserProfileRow,
  UserRoleAssignmentRow,
} from '@/lib/database/database.types'
import {
  consentDecisions,
  consentPurposeCodes,
  noticeDocumentTypes,
  supportedLocales,
} from '@/lib/privacy/contracts'

const uuidSchema = z.uuid()
const timestampSchema = z.iso.datetime({ offset: true })
const sha256ByteaSchema = z.string().regex(/^\\x[0-9a-f]{64}$/u)

export const userProfileRowSchema: z.ZodType<UserProfileRow> = z.strictObject({
  user_id: uuidSchema,
  display_name: z.string().min(1).max(120).nullable(),
  avatar_url: z.url({ protocol: /^https$/u }).max(2048).nullable(),
  locale: z.enum(supportedLocales),
  timezone: z.string().min(1).max(100),
  onboarding_status: z.enum(['pending', 'completed', 'skipped']),
  account_status: z.enum(['active', 'suspended', 'deletion_pending']),
  version: z.int().positive(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const dataSubjectRowSchema: z.ZodType<DataSubjectRow> = z.strictObject({
  id: uuidSchema,
  auth_user_id: uuidSchema.nullable(),
  anonymous_key_hmac: sha256ByteaSchema.nullable(),
  anonymous_key_version: z.int().positive().nullable(),
  status: z.enum(['anonymous', 'authenticated', 'anonymized', 'merged']),
  merged_into_id: uuidSchema.nullable(),
  created_at: timestampSchema,
  deleted_at: timestampSchema.nullable(),
})

export const userRoleAssignmentRowSchema: z.ZodType<UserRoleAssignmentRow> =
  z.strictObject({
    id: uuidSchema,
    user_id: uuidSchema.nullable(),
    role_code: z.enum([
      'moderator',
      'privacy_operator',
      'security_operator',
      'role_admin',
    ]),
    granted_by_user_id: uuidSchema.nullable(),
    subject_audit_principal: sha256ByteaSchema,
    grantor_role_snapshot: z
      .enum([
        'moderator',
        'privacy_operator',
        'security_operator',
        'role_admin',
        'bootstrap_operator',
      ])
      .nullable(),
    reason_code: z.enum([
      'initial_bootstrap',
      'operational_need',
      'incident_response',
      'privacy_operations',
      'role_change',
    ]),
    granted_at: timestampSchema,
    revoked_at: timestampSchema.nullable(),
  })

export const noticeVersionRowSchema: z.ZodType<NoticeVersionRow> =
  z.strictObject({
    id: uuidSchema,
    document_type: z.enum(noticeDocumentTypes),
    locale: z.enum(supportedLocales),
    version: z.string().min(1).max(50),
    content_sha256: sha256ByteaSchema,
    content_uri: z.string().min(1).max(2048),
    effective_from: timestampSchema,
    retired_at: timestampSchema.nullable(),
    created_at: timestampSchema,
  })

export const consentEventRowSchema: z.ZodType<ConsentEventRow> = z.strictObject({
  id: uuidSchema,
  data_subject_id: uuidSchema.nullable(),
  subject_proof_hmac: sha256ByteaSchema,
  subject_proof_key_version: z.int().positive(),
  notice_version_id: uuidSchema,
  submission_id: uuidSchema.nullable(),
  purpose_code: z.enum(consentPurposeCodes),
  decision: z.enum(consentDecisions),
  event_source: z.enum([
    'web',
    'account',
    'survey',
    'privacy_request',
    'system',
  ]),
  idempotency_key: uuidSchema,
  occurred_at: timestampSchema,
  created_at: timestampSchema,
})

export const updateOwnProfileCommandSchema = z
  .strictObject({
    displayName: z.string().trim().min(1).max(120).nullable().optional(),
    avatarUrl: z.url({ protocol: /^https$/u }).max(2048).nullable().optional(),
    locale: z.enum(supportedLocales).optional(),
    timezone: z.string().trim().min(1).max(100).optional(),
    onboardingStatus: z
      .enum(['pending', 'completed', 'skipped'])
      .optional(),
    expectedVersion: z.int().positive(),
  })
  .refine(
    ({ expectedVersion: _expectedVersion, ...changes }) =>
      Object.values(changes).some((value) => value !== undefined),
    'At least one profile field must be provided',
  )

export const createNoticeVersionCommandSchema = z.strictObject({
  documentType: z.enum(noticeDocumentTypes),
  locale: z.enum(supportedLocales),
  version: z.string().trim().min(1).max(50),
  contentSha256: sha256ByteaSchema,
  contentUri: z.string().trim().min(1).max(2048),
  effectiveFrom: timestampSchema,
})

// There is deliberately no generic notice update or consent update schema.
// Published notices retire through a dedicated command; consent changes append
// a new event.
