import 'server-only'

import { z } from 'zod'

import type {
  ConsentReceiptRecord,
  CurrentNoticeRecord,
} from '@/lib/database/database.types'
import { PrivacyPersistenceError } from '@/lib/privacy/errors'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import type {
  PrivacyRepository,
  RecordConsentPersistenceCommand,
} from '@/lib/server/privacy/service'

const currentNoticeRecordSchema: z.ZodType<CurrentNoticeRecord> = z.strictObject({
  id: z.uuid(),
  document_type: z.string(),
  locale: z.string(),
  version: z.string(),
  content_sha256: z.string(),
  content_uri: z.string(),
  effective_from: z.string(),
})

const consentReceiptRecordSchema: z.ZodType<ConsentReceiptRecord> =
  z.strictObject({
    event_id: z.uuid(),
    event_created_at: z.string(),
    replayed: z.boolean(),
  })

function mapConsentWriteError(message: string) {
  switch (message) {
    case 'active_data_subject_not_found':
    case 'auth_user_required':
      return 'CONSENT_SUBJECT_NOT_FOUND'
    case 'notice_version_not_effective':
      return 'CONSENT_NOTICE_NOT_EFFECTIVE'
    case 'notice_purpose_mismatch':
      return 'CONSENT_NOTICE_PURPOSE_MISMATCH'
    case 'idempotency_key_reused':
      return 'CONSENT_IDEMPOTENCY_CONFLICT'
    default:
      return 'CONSENT_WRITE_FAILED'
  }
}

export function createSupabasePrivacyRepository(): PrivacyRepository {
  const client = createAdminSupabaseClient()

  return {
    async getCurrentNotice({ documentType, locale }) {
      const { data, error } = await client.rpc('get_current_notice_v1', {
        p_document_type: documentType,
        p_locale: locale,
      })

      if (error) {
        throw new PrivacyPersistenceError('NOTICE_READ_FAILED')
      }

      if (!data[0]) {
        return null
      }

      const result = currentNoticeRecordSchema.safeParse(data[0])

      if (!result.success) {
        throw new PrivacyPersistenceError('NOTICE_RESPONSE_INVALID')
      }

      return result.data
    },

    async recordAuthenticatedConsent(
      command: RecordConsentPersistenceCommand,
    ) {
      const { data, error } = await client.rpc(
        'record_authenticated_consent_v1',
        {
          p_auth_user_id: command.authUserId,
          p_decision: command.decision,
          p_event_source: command.eventSource,
          p_idempotency_key: command.idempotencyKey,
          p_notice_version_id: command.noticeVersionId,
          p_purpose_code: command.purposeCode,
          p_subject_proof_hmac: command.subjectProofHmac,
          p_subject_proof_key_version: command.subjectProofKeyVersion,
        },
      )

      if (error) {
        throw new PrivacyPersistenceError(
          mapConsentWriteError(error.message),
        )
      }

      const result = consentReceiptRecordSchema.safeParse(data[0])

      if (!result.success) {
        throw new PrivacyPersistenceError('CONSENT_RESPONSE_INVALID')
      }

      return result.data
    },
  }
}
