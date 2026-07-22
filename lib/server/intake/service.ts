import 'server-only'

import {
  submissionReceiptDtoSchema,
  submissionReceiptQuerySchema,
  type SubmissionReceiptDto,
} from '@/lib/intake/contracts'
import {
  IntakePersistenceError,
  IntakeServiceError,
} from '@/lib/intake/errors'
import { submissionCapabilityHmacs } from '@/lib/server/security/crypto'
import type { RespondentKeyRing } from '@/lib/server/security/crypto'
import type { IntakeRepository } from '@/lib/server/intake/repository'

const capabilityAuthorizationPattern =
  /^SubmissionCapability ([A-Za-z0-9_-]{43})$/u

export function createIntakeService(dependencies: {
  repository: Pick<IntakeRepository, 'getSubmissionReceipt'>
  capabilityKeys: RespondentKeyRing
}) {
  return {
    async getSubmissionReceipt(input: unknown): Promise<SubmissionReceiptDto> {
      const query = submissionReceiptQuerySchema.parse(input)
      const capabilityMatch = query.authorization?.match(
        capabilityAuthorizationPattern,
      )

      if (!query.requesterDataSubjectId && !capabilityMatch) {
        throw new IntakeServiceError('SUBMISSION_AUTHORIZATION_INVALID')
      }

      const capabilityHmacs = capabilityMatch
        ? submissionCapabilityHmacs(
            capabilityMatch[1]!,
            dependencies.capabilityKeys,
          )
        : null

      let record
      try {
        record = await dependencies.repository.getSubmissionReceipt({
          receiptId: query.receiptId,
          requesterDataSubjectId: query.requesterDataSubjectId,
          activeCapabilityHmac: capabilityHmacs?.active.hmac ?? null,
          activeCapabilityKeyVersion:
            capabilityHmacs?.active.version ?? null,
          previousCapabilityHmac: capabilityHmacs?.previous?.hmac ?? null,
          previousCapabilityKeyVersion:
            capabilityHmacs?.previous?.version ?? null,
        })
      } catch (error) {
        if (
          error instanceof IntakePersistenceError &&
          error.code === 'SUBMISSION_RECEIPT_RESPONSE_INVALID'
        ) {
          throw new IntakeServiceError(
            'SUBMISSION_RECEIPT_RESPONSE_INVALID',
          )
        }
        throw new IntakeServiceError('SUBMISSION_RECEIPT_READ_FAILED')
      }

      if (!record) {
        throw new IntakeServiceError('SUBMISSION_RECEIPT_NOT_FOUND')
      }

      const result = submissionReceiptDtoSchema.safeParse({
        receiptId: record.receipt_id,
        surveyType: record.survey_type,
        lifecycleStatus: record.lifecycle_status,
        qualityStatus: record.quality_status,
        submittedAt: record.submitted_at,
        withdrawnAt: record.withdrawn_at,
      })
      if (!result.success) {
        throw new IntakeServiceError('SUBMISSION_RECEIPT_RESPONSE_INVALID')
      }
      return result.data
    },
  }
}
