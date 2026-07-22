import 'server-only'

import { z } from 'zod'

import {
  companyExperienceCreateBodySchema,
  companyExperienceCreateResultSchema,
  companyExperienceIdempotencyKeySchema,
  type CompanyExperienceCreateResult,
} from '@/lib/company-experience/contracts'
import {
  CompanyExperiencePersistenceError,
  CompanyExperienceServiceError,
} from '@/lib/company-experience/errors'
import { getServerIntakeEnvironment, getServerSecurityEnvironment } from '@/lib/env/server'
import type { CompanyExperienceActor } from '@/lib/server/company-experience/actor'
import {
  createSupabaseCompanyExperienceRepository,
  type CompanyExperienceRepository,
} from '@/lib/server/company-experience/repository'
import { createSupabasePrivacyRepository } from '@/lib/server/privacy/repository'
import { createPrivacyService, PrivacyServiceError } from '@/lib/server/privacy/service'
import {
  deriveOpaqueToken,
  findKeyMaterial,
  hmacValue,
  sha256Value,
  submissionCapabilityHmacs,
  type RespondentKeyRing,
} from '@/lib/server/security/crypto'
import { createSupabaseSecurityRepository } from '@/lib/server/security/repository'
import { createSecurityService, type PreparedQuota } from '@/lib/server/security/service'
import { SecurityServiceError } from '@/lib/security/errors'

const OPERATION_CODE = 'survey.company-experience.create'
const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60
const CAPABILITY_TTL_MILLISECONDS = 30 * 24 * 60 * 60 * 1000
type SecurityService = ReturnType<typeof createSecurityService>

type CompanyExperienceServiceDependencies = {
  repository: CompanyExperienceRepository
  security: Pick<SecurityService, 'claimIdempotency' | 'failIdempotency' | 'prepareQuota'>
  getCurrentSurveyNotice: (locale: 'tr' | 'en') => Promise<{ id: string }>
  capabilityKeys: RespondentKeyRing
  subjectProofKeys: RespondentKeyRing
  now?: () => Date
}

function capabilityInput(dataSubjectId: string, idempotencyKey: string) {
  return `${dataSubjectId}\u0000${idempotencyKey}`
}

function deriveCapability(
  keyRing: RespondentKeyRing,
  version: number,
  dataSubjectId: string,
  idempotencyKey: string,
) {
  const key = findKeyMaterial(keyRing, version)
  if (!key) {
    throw new CompanyExperienceServiceError('COMPANY_EXPERIENCE_REPLAY_FAILED')
  }
  return deriveOpaqueToken(
    key.secret,
    'submission-capability-token:v1',
    capabilityInput(dataSubjectId, idempotencyKey),
  )
}

function mapSecurityError(error: SecurityServiceError): never {
  if (error.code === 'IDEMPOTENCY_CONFLICT') {
    throw new CompanyExperienceServiceError(
      'COMPANY_EXPERIENCE_IDEMPOTENCY_CONFLICT',
    )
  }
  if (error.code === 'IDEMPOTENCY_IN_PROGRESS') {
    throw new CompanyExperienceServiceError(
      'COMPANY_EXPERIENCE_IDEMPOTENCY_IN_PROGRESS',
      1,
    )
  }
  throw new CompanyExperienceServiceError('COMPANY_EXPERIENCE_WRITE_FAILED')
}

function quotaRetryAfter(first: PreparedQuota, second: PreparedQuota) {
  return Math.max(first.retryAfterSeconds, second.retryAfterSeconds)
}

export function createCompanyExperienceService(
  dependencies: CompanyExperienceServiceDependencies,
) {
  const now = dependencies.now ?? (() => new Date())

  async function failClaim(
    claim: Awaited<ReturnType<SecurityService['claimIdempotency']>>['identity'],
    responseCode: number,
  ) {
    try {
      await dependencies.security.failIdempotency({ claim, responseCode })
    } catch {
      // Preserve the domain failure. Processing claims expire automatically.
    }
  }

  return {
    async create(input: {
      actor: CompanyExperienceActor
      idempotencyKey: unknown
      body: unknown
    }): Promise<CompanyExperienceCreateResult> {
      const idempotencyKey = companyExperienceIdempotencyKeySchema.safeParse(
        input.idempotencyKey,
      )
      const parsedBody = companyExperienceCreateBodySchema.safeParse(input.body)
      if (!idempotencyKey.success || !parsedBody.success) {
        throw new CompanyExperienceServiceError('COMPANY_EXPERIENCE_BODY_INVALID')
      }
      const body = parsedBody.data
      const commandTime = now()
      if (body.processYear > commandTime.getUTCFullYear()) {
        throw new CompanyExperienceServiceError('COMPANY_EXPERIENCE_BODY_INVALID')
      }

      let claim: Awaited<ReturnType<SecurityService['claimIdempotency']>>
      try {
        claim = await dependencies.security.claimIdempotency({
          subjectType: 'data_subject',
          subjectId: input.actor.dataSubjectId,
          operationCode: OPERATION_CODE,
          idempotencyKey: idempotencyKey.data,
          requestBody: body,
          ttlSeconds: IDEMPOTENCY_TTL_SECONDS,
          now: commandTime,
        })
      } catch (error) {
        if (error instanceof SecurityServiceError) mapSecurityError(error)
        throw new CompanyExperienceServiceError('COMPANY_EXPERIENCE_WRITE_FAILED')
      }

      if (claim.record.outcome === 'replay') {
        if (
          claim.record.resource_type !== 'survey_submission' ||
          !claim.record.resource_id
        ) {
          throw new CompanyExperienceServiceError('COMPANY_EXPERIENCE_REPLAY_FAILED')
        }
        let replay
        try {
          replay = await dependencies.repository.getCreateResult({
            submissionId: claim.record.resource_id,
            dataSubjectId: input.actor.dataSubjectId,
          })
        } catch (error) {
          if (error instanceof CompanyExperiencePersistenceError) {
            throw new CompanyExperienceServiceError(error.code)
          }
          throw new CompanyExperienceServiceError('COMPANY_EXPERIENCE_REPLAY_FAILED')
        }
        if (!replay) {
          throw new CompanyExperienceServiceError('COMPANY_EXPERIENCE_REPLAY_FAILED')
        }
        const submissionCapability =
          input.actor.kind === 'anonymous'
            ? deriveCapability(
                dependencies.capabilityKeys,
                replay.capability_key_version ?? -1,
                input.actor.dataSubjectId,
                idempotencyKey.data,
              )
            : null
        return companyExperienceCreateResultSchema.parse({
          receiptId: replay.receipt_id,
          companyExperienceId: replay.company_experience_id,
          submissionCapability,
          replayed: true,
        })
      }

      let quota24h: PreparedQuota
      let quota30d: PreparedQuota
      try {
        quota24h = dependencies.security.prepareQuota({
          policy: 'repeatableExperience', windowKind: 'accepted_24h',
          counter: 'accepted', subjectId: input.actor.dataSubjectId, now: commandTime,
        })
        quota30d = dependencies.security.prepareQuota({
          policy: 'repeatableExperience', windowKind: 'accepted_30d',
          counter: 'accepted', subjectId: input.actor.dataSubjectId, now: commandTime,
        })
      } catch (error) {
        await failClaim(claim.identity, 500)
        if (error instanceof SecurityServiceError) mapSecurityError(error)
        throw new CompanyExperienceServiceError('COMPANY_EXPERIENCE_WRITE_FAILED')
      }

      let notice
      try {
        notice = await dependencies.getCurrentSurveyNotice(body.locale)
      } catch (error) {
        await failClaim(claim.identity, 503)
        if (error instanceof PrivacyServiceError && error.code === 'NOTICE_NOT_FOUND') {
          throw new CompanyExperienceServiceError('COMPANY_EXPERIENCE_NOTICE_NOT_FOUND')
        }
        throw new CompanyExperienceServiceError('COMPANY_EXPERIENCE_NOTICE_READ_FAILED')
      }

      const anonymous = input.actor.kind === 'anonymous'
      const capabilityKeyVersion = anonymous
        ? dependencies.capabilityKeys.active.version
        : null
      const submissionCapability = anonymous
        ? deriveCapability(
            dependencies.capabilityKeys,
            capabilityKeyVersion!,
            input.actor.dataSubjectId,
            idempotencyKey.data,
          )
        : null
      const capabilityHmac = submissionCapability
        ? submissionCapabilityHmacs(submissionCapability, dependencies.capabilityKeys).active.hmac
        : null
      const capabilityExpiresAt = anonymous
        ? new Date(commandTime.getTime() + CAPABILITY_TTL_MILLISECONDS).toISOString()
        : null
      const subjectProofKey = dependencies.subjectProofKeys.active

      try {
        const created = await dependencies.repository.createCompanyExperience({
          dataSubjectId: input.actor.dataSubjectId,
          schemaVersion: 1,
          locale: body.locale,
          noticeVersionId: notice.id,
          payloadHash: sha256Value(body),
          commandFingerprint: claim.identity.requestFingerprint,
          supersedesSubmissionId: null,
          capabilityHmac,
          capabilityKeyVersion,
          capabilityExpiresAt,
          consentSubjectProofHmac: hmacValue(
            subjectProofKey.secret,
            'consent-subject:data-subject:v1',
            input.actor.dataSubjectId,
          ),
          consentSubjectProofKeyVersion: subjectProofKey.version,
          consentIdempotencyKey: idempotencyKey.data,
          idempotencySubjectHmac: claim.identity.subjectHmac,
          idempotencyKeyHmac: claim.identity.idempotencyKeyHmac,
          idempotencyRequestFingerprint: claim.identity.requestFingerprint,
          quotaSubjectHmac: quota24h.subjectHmac,
          quota24hWindowStart: quota24h.windowStart,
          quota24hLimit: quota24h.limit,
          quota24hExpiresAt: quota24h.expiresAt,
          quota30dWindowStart: quota30d.windowStart,
          quota30dLimit: quota30d.limit,
          quota30dExpiresAt: quota30d.expiresAt,
          quotaPolicyVersion: quota24h.policyVersion,
          quotaPolicyHash: quota24h.policyHash,
          companyName: body.companyName,
          appliedRole: body.appliedRole,
          processYear: body.processYear,
          promisedTimeline: body.promisedTimeline,
          promisedDays: body.promisedDays,
          actualDays: body.actualDays,
          wasGhosted: body.wasGhosted,
          ghostedAfterStage: body.ghostedAfterStage,
          interviewerPrepared: body.interviewerPrepared,
          wasAskedIrrelevant: body.wasAskedIrrelevant,
          irrelevantTypes: [...new Set(body.irrelevantTypes)],
          rejectionShared: body.rejectionShared,
          feedbackUseful: body.feedbackUseful,
          processTransparency: body.processTransparency,
          hrProfessionalism: body.hrProfessionalism,
          wouldRecommendProcess: body.wouldRecommendProcess,
          freeNote: body.freeNote || null,
        })
        return companyExperienceCreateResultSchema.parse({
          receiptId: created.receipt_id,
          companyExperienceId: created.company_experience_id,
          submissionCapability,
          replayed: false,
        })
      } catch (error) {
        const responseCode =
          error instanceof CompanyExperiencePersistenceError
            ? error.code === 'COMPANY_EXPERIENCE_QUOTA_EXCEEDED' ? 429
              : error.code === 'COMPANY_EXPERIENCE_BODY_INVALID' ? 422
                : error.code === 'COMPANY_EXPERIENCE_DUPLICATE' ? 409
                  : error.code === 'COMPANY_EXPERIENCE_NOTICE_NOT_FOUND' ? 503 : 500
            : 500
        await failClaim(claim.identity, responseCode)
        if (error instanceof CompanyExperiencePersistenceError) {
          if (error.code === 'COMPANY_EXPERIENCE_QUOTA_EXCEEDED') {
            throw new CompanyExperienceServiceError(
              error.code,
              quotaRetryAfter(quota24h, quota30d),
            )
          }
          throw new CompanyExperienceServiceError(error.code)
        }
        if (error instanceof z.ZodError) {
          throw new CompanyExperienceServiceError('COMPANY_EXPERIENCE_RESPONSE_INVALID')
        }
        throw new CompanyExperienceServiceError('COMPANY_EXPERIENCE_WRITE_FAILED')
      }
    },
  }
}

/* v8 ignore start -- production composition root */
export function createDefaultCompanyExperienceService() {
  const securityEnvironment = getServerSecurityEnvironment()
  const intakeEnvironment = getServerIntakeEnvironment()
  const security = createSecurityService({
    repository: createSupabaseSecurityRepository(),
    quotaSubjectKey: securityEnvironment.quotaSubjectKey,
    idempotencyKey: securityEnvironment.idempotencyKey,
  })
  const privacy = createPrivacyService({
    repository: createSupabasePrivacyRepository(),
    async resolveTrustedConsentActor() {
      throw new Error('Survey consent is recorded by the domain transaction')
    },
  })
  return createCompanyExperienceService({
    repository: createSupabaseCompanyExperienceRepository(),
    security,
    getCurrentSurveyNotice: (locale) =>
      privacy.getCurrentNotice({ documentType: 'company_experience_notice', locale }),
    capabilityKeys: intakeEnvironment.capabilityKeys,
    subjectProofKeys: securityEnvironment.respondentKeys,
  })
}
/* v8 ignore stop */
