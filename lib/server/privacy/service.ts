import 'server-only'

import { z } from 'zod'

import type {
  ConsentReceiptRecord,
  CurrentNoticeRecord,
} from '@/lib/database/database.types'
import {
  consentReceiptDtoSchema,
  currentNoticeDtoSchema,
  currentNoticeQuerySchema,
  recordConsentCommandSchema,
  type ConsentReceiptDto,
  type CurrentNoticeDto,
} from '@/lib/privacy/contracts'
import { PrivacyPersistenceError } from '@/lib/privacy/errors'

const postgresSha256Schema = z
  .string()
  .regex(/^\\x[0-9a-f]{64}$/u, 'Expected a PostgreSQL SHA-256 bytea value')

const trustedConsentActorSchema = z.strictObject({
  authUserId: z.uuid(),
  eventSource: z.enum(['account', 'survey']),
  subjectProofHmac: postgresSha256Schema,
  subjectProofKeyVersion: z.int().positive(),
})

export type RecordConsentPersistenceCommand = {
  authUserId: string
  noticeVersionId: string
  purposeCode: string
  decision: string
  eventSource: string
  subjectProofHmac: string
  subjectProofKeyVersion: number
  idempotencyKey: string
}

export interface PrivacyRepository {
  getCurrentNotice(input: {
    documentType: string
    locale: string
  }): Promise<CurrentNoticeRecord | null>
  recordAuthenticatedConsent(
    input: RecordConsentPersistenceCommand,
  ): Promise<ConsentReceiptRecord>
}

export class PrivacyServiceError extends Error {
  constructor(
    public readonly code:
      | 'NOTICE_NOT_FOUND'
      | 'NOTICE_READ_FAILED'
      | 'NOTICE_RESPONSE_INVALID'
      | 'CONSENT_ACTOR_RESOLUTION_FAILED'
      | 'CONSENT_SUBJECT_NOT_FOUND'
      | 'CONSENT_NOTICE_NOT_EFFECTIVE'
      | 'CONSENT_NOTICE_PURPOSE_MISMATCH'
      | 'CONSENT_IDEMPOTENCY_CONFLICT'
      | 'CONSENT_WRITE_FAILED'
      | 'CONSENT_RESPONSE_INVALID',
  ) {
    super(code)
    this.name = 'PrivacyServiceError'
  }
}

type PrivacyServiceDependencies = {
  repository: PrivacyRepository
  // This resolver belongs in a server-only composition root and must derive
  // identity/proof fields from the verified session, never from request data.
  resolveTrustedConsentActor: () => Promise<unknown>
}

export function createPrivacyService({
  repository,
  resolveTrustedConsentActor,
}: PrivacyServiceDependencies) {
  return {
    async getCurrentNotice(input: unknown): Promise<CurrentNoticeDto> {
      const query = currentNoticeQuerySchema.parse(input)
      let record: CurrentNoticeRecord | null

      try {
        record = await repository.getCurrentNotice(query)
      } catch (error) {
        if (
          error instanceof PrivacyPersistenceError &&
          error.code === 'NOTICE_RESPONSE_INVALID'
        ) {
          throw new PrivacyServiceError('NOTICE_RESPONSE_INVALID')
        }

        throw new PrivacyServiceError('NOTICE_READ_FAILED')
      }

      if (!record) {
        throw new PrivacyServiceError('NOTICE_NOT_FOUND')
      }

      const result = currentNoticeDtoSchema.safeParse({
        id: record.id,
        documentType: record.document_type,
        locale: record.locale,
        version: record.version,
        contentSha256: record.content_sha256,
        contentUri: record.content_uri,
        effectiveFrom: record.effective_from,
      })

      if (!result.success) {
        throw new PrivacyServiceError('NOTICE_RESPONSE_INVALID')
      }

      return result.data
    },

    async recordConsent(
      input: unknown,
    ): Promise<ConsentReceiptDto> {
      const command = recordConsentCommandSchema.parse(input)
      let actorPayload: unknown

      try {
        actorPayload = await resolveTrustedConsentActor()
      } catch {
        throw new PrivacyServiceError('CONSENT_ACTOR_RESOLUTION_FAILED')
      }

      const actor = trustedConsentActorSchema.safeParse(actorPayload)

      if (!actor.success) {
        throw new PrivacyServiceError('CONSENT_ACTOR_RESOLUTION_FAILED')
      }

      let record: ConsentReceiptRecord

      try {
        record = await repository.recordAuthenticatedConsent({
          authUserId: actor.data.authUserId,
          noticeVersionId: command.noticeVersionId,
          purposeCode: command.purposeCode,
          decision: command.decision,
          eventSource: actor.data.eventSource,
          subjectProofHmac: actor.data.subjectProofHmac,
          subjectProofKeyVersion: actor.data.subjectProofKeyVersion,
          idempotencyKey: command.idempotencyKey,
        })
      } catch (error) {
        if (error instanceof PrivacyPersistenceError) {
          const errorMap = {
            CONSENT_SUBJECT_NOT_FOUND: 'CONSENT_SUBJECT_NOT_FOUND',
            CONSENT_NOTICE_NOT_EFFECTIVE: 'CONSENT_NOTICE_NOT_EFFECTIVE',
            CONSENT_NOTICE_PURPOSE_MISMATCH:
              'CONSENT_NOTICE_PURPOSE_MISMATCH',
            CONSENT_IDEMPOTENCY_CONFLICT: 'CONSENT_IDEMPOTENCY_CONFLICT',
            CONSENT_RESPONSE_INVALID: 'CONSENT_RESPONSE_INVALID',
          } as const
          const mappedCode =
            error.code in errorMap
              ? errorMap[error.code as keyof typeof errorMap]
              : 'CONSENT_WRITE_FAILED'

          throw new PrivacyServiceError(mappedCode)
        }

        throw new PrivacyServiceError('CONSENT_WRITE_FAILED')
      }
      const result = consentReceiptDtoSchema.safeParse({
        eventId: record.event_id,
        createdAt: record.event_created_at,
        replayed: record.replayed,
      })

      if (!result.success) {
        throw new PrivacyServiceError('CONSENT_RESPONSE_INVALID')
      }

      return result.data
    },
  }
}
