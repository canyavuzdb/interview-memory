import 'server-only'

import { z } from 'zod'

import { getServerIntakeEnvironment, getServerSecurityEnvironment } from '@/lib/env/server'
import {
  searchBenchmarkCreateBodySchema,
  searchBenchmarkCreateResultSchema,
  searchBenchmarkIdempotencyKeySchema,
  type SearchBenchmarkCreateResult,
} from '@/lib/search-benchmark/contracts'
import {
  SearchBenchmarkPersistenceError,
  SearchBenchmarkServiceError,
} from '@/lib/search-benchmark/errors'
import { PrivacyServiceError, createPrivacyService } from '@/lib/server/privacy/service'
import { createSupabasePrivacyRepository } from '@/lib/server/privacy/repository'
import {
  deriveOpaqueToken,
  findKeyMaterial,
  hmacValue,
  sha256Value,
  submissionCapabilityHmacs,
  type RespondentKeyRing,
} from '@/lib/server/security/crypto'
import { createSupabaseSecurityRepository } from '@/lib/server/security/repository'
import {
  createSecurityService,
  type PreparedQuota,
} from '@/lib/server/security/service'
import { SecurityServiceError } from '@/lib/security/errors'
import type { SearchBenchmarkActor } from '@/lib/server/search-benchmark/actor'
import {
  createSupabaseSearchBenchmarkRepository,
  type SearchBenchmarkRepository,
} from '@/lib/server/search-benchmark/repository'

const OPERATION_CODE = 'survey.search-benchmark.create'
const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60
const CAPABILITY_TTL_MILLISECONDS = 30 * 24 * 60 * 60 * 1000

type SecurityService = ReturnType<typeof createSecurityService>

type SearchBenchmarkServiceDependencies = {
  repository: SearchBenchmarkRepository
  security: Pick<
    SecurityService,
    'claimIdempotency' | 'consumeQuota' | 'failIdempotency' | 'prepareQuota'
  >
  getCurrentSurveyNotice: (locale: 'tr' | 'en') => Promise<{ id: string }>
  capabilityKeys: RespondentKeyRing
  subjectProofKeys: RespondentKeyRing
  now?: () => Date
}

function monthStart(month: string) {
  return `${month}-01`
}

function currentMonth(now: Date) {
  return now.toISOString().slice(0, 7)
}

function observedThrough(now: Date) {
  return now.toISOString().slice(0, 10)
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
    throw new SearchBenchmarkServiceError('SEARCH_BENCHMARK_REPLAY_FAILED')
  }

  return deriveOpaqueToken(
    key.secret,
    'submission-capability-token:v1',
    capabilityInput(dataSubjectId, idempotencyKey),
  )
}

function mapSecurityError(error: SecurityServiceError): never {
  if (error.code === 'QUOTA_EXCEEDED') {
    throw new SearchBenchmarkServiceError(
      'SEARCH_BENCHMARK_QUOTA_EXCEEDED',
      error.retryAfterSeconds,
    )
  }
  if (error.code === 'IDEMPOTENCY_CONFLICT') {
    throw new SearchBenchmarkServiceError(
      'SEARCH_BENCHMARK_IDEMPOTENCY_CONFLICT',
    )
  }
  if (error.code === 'IDEMPOTENCY_IN_PROGRESS') {
    throw new SearchBenchmarkServiceError(
      'SEARCH_BENCHMARK_IDEMPOTENCY_IN_PROGRESS',
      1,
    )
  }
  throw new SearchBenchmarkServiceError('SEARCH_BENCHMARK_WRITE_FAILED')
}

function mapPersistenceError(
  error: SearchBenchmarkPersistenceError,
  acceptedQuota: PreparedQuota,
): never {
  if (error.code === 'SEARCH_BENCHMARK_QUOTA_EXCEEDED') {
    throw new SearchBenchmarkServiceError(
      error.code,
      acceptedQuota.retryAfterSeconds,
    )
  }
  throw new SearchBenchmarkServiceError(error.code)
}

export function createSearchBenchmarkService(
  dependencies: SearchBenchmarkServiceDependencies,
) {
  const now = dependencies.now ?? (() => new Date())

  async function failClaim(
    claim: Awaited<ReturnType<SecurityService['claimIdempotency']>>['identity'],
    responseCode: number,
  ) {
    try {
      await dependencies.security.failIdempotency({ claim, responseCode })
    } catch {
      // Preserve the primary error. Processing claims also expire after 24h.
    }
  }

  return {
    async create(input: {
      actor: SearchBenchmarkActor
      idempotencyKey: unknown
      body: unknown
    }): Promise<SearchBenchmarkCreateResult> {
      const idempotencyKey = searchBenchmarkIdempotencyKeySchema.safeParse(
        input.idempotencyKey,
      )
      if (!idempotencyKey.success) {
        throw new SearchBenchmarkServiceError(
          'SEARCH_BENCHMARK_BODY_INVALID',
        )
      }

      const commandTime = now()

      try {
        await dependencies.security.consumeQuota({
          policy: 'singleResponse',
          windowKind: 'attempt_10m',
          counter: 'attempt',
          subjectId: input.actor.dataSubjectId,
          now: commandTime,
        })
      } catch (error) {
        if (error instanceof SecurityServiceError) mapSecurityError(error)
        throw new SearchBenchmarkServiceError('SEARCH_BENCHMARK_WRITE_FAILED')
      }

      const parsedBody = searchBenchmarkCreateBodySchema.safeParse(input.body)
      if (!parsedBody.success) {
        throw new SearchBenchmarkServiceError(
          'SEARCH_BENCHMARK_BODY_INVALID',
        )
      }
      const body = parsedBody.data
      const maximumMonth = currentMonth(commandTime)
      if (
        body.searchStartedAt > maximumMonth ||
        (body.searchEndedAt !== null && body.searchEndedAt > maximumMonth)
      ) {
        throw new SearchBenchmarkServiceError(
          'SEARCH_BENCHMARK_BODY_INVALID',
        )
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
        throw new SearchBenchmarkServiceError('SEARCH_BENCHMARK_WRITE_FAILED')
      }

      if (claim.record.outcome === 'replay') {
        if (
          claim.record.resource_type !== 'survey_submission' ||
          !claim.record.resource_id
        ) {
          throw new SearchBenchmarkServiceError(
            'SEARCH_BENCHMARK_REPLAY_FAILED',
          )
        }

        let replay
        try {
          replay = await dependencies.repository.getCreateResult({
            submissionId: claim.record.resource_id,
            dataSubjectId: input.actor.dataSubjectId,
          })
        } catch (error) {
          if (error instanceof SearchBenchmarkPersistenceError) {
            throw new SearchBenchmarkServiceError(error.code)
          }
          throw new SearchBenchmarkServiceError(
            'SEARCH_BENCHMARK_REPLAY_FAILED',
          )
        }

        if (!replay) {
          throw new SearchBenchmarkServiceError(
            'SEARCH_BENCHMARK_REPLAY_FAILED',
          )
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

        return searchBenchmarkCreateResultSchema.parse({
          receiptId: replay.receipt_id,
          searchEpisodeId: replay.search_episode_id,
          submissionCapability,
          replayed: true,
        })
      }

      let acceptedQuota: PreparedQuota
      try {
        acceptedQuota = dependencies.security.prepareQuota({
          policy: 'singleResponse',
          windowKind: 'accepted_period',
          counter: 'accepted',
          subjectId: input.actor.dataSubjectId,
          now: commandTime,
        })
      } catch (error) {
        await failClaim(claim.identity, 500)
        if (error instanceof SecurityServiceError) mapSecurityError(error)
        throw new SearchBenchmarkServiceError('SEARCH_BENCHMARK_WRITE_FAILED')
      }

      let notice
      try {
        notice = await dependencies.getCurrentSurveyNotice(body.locale)
      } catch (error) {
        await failClaim(claim.identity, 503)
        if (
          error instanceof PrivacyServiceError &&
          error.code === 'NOTICE_NOT_FOUND'
        ) {
          throw new SearchBenchmarkServiceError(
            'SEARCH_BENCHMARK_NOTICE_NOT_FOUND',
          )
        }
        throw new SearchBenchmarkServiceError(
          'SEARCH_BENCHMARK_NOTICE_READ_FAILED',
        )
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
        ? submissionCapabilityHmacs(
            submissionCapability,
            dependencies.capabilityKeys,
          ).active.hmac
        : null
      const capabilityExpiresAt = anonymous
        ? new Date(
            commandTime.getTime() + CAPABILITY_TTL_MILLISECONDS,
          ).toISOString()
        : null
      const subjectProofKey = dependencies.subjectProofKeys.active

      try {
        const created = await dependencies.repository.createSearchEpisode({
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
          idempotencyRequestFingerprint:
            claim.identity.requestFingerprint,
          quotaSubjectHmac: acceptedQuota.subjectHmac,
          quotaWindowStart: acceptedQuota.windowStart,
          quotaLimit: acceptedQuota.limit,
          quotaPolicyVersion: acceptedQuota.policyVersion,
          quotaPolicyHash: acceptedQuota.policyHash,
          quotaExpiresAt: acceptedQuota.expiresAt,
          roleSlug: body.role.replaceAll('_', '-'),
          sectorSlug: body.sector?.replaceAll('_', '-') ?? null,
          roleLevel: body.roleLevel,
          experienceBand: body.experienceBand,
          targetRegion: body.targetRegion,
          employmentType: body.employmentType,
          workMode: body.workMode,
          startedMonth: monthStart(body.searchStartedAt),
          endedMonth:
            body.searchEndedAt === null
              ? null
              : monthStart(body.searchEndedAt),
          status: body.searchStatus,
          currentlyEmployed: body.isCurrentlyEmployed,
          countsAreEstimated: body.countsAreEstimated,
          observedThrough: observedThrough(commandTime),
          applicationsCount: body.applicationsCount,
          humanResponsesCount: body.humanResponsesCount,
          anyInterviewsCount: body.anyInterviewsCount,
          hrInterviewsCount: body.hrInterviewsCount,
          technicalInterviewsCount: body.technicalInterviewsCount,
          offersCount: body.offersCount,
          acceptedOffersCount: body.acceptedOffersCount,
          employmentStartedCount: body.employmentStartedCount,
        })

        return searchBenchmarkCreateResultSchema.parse({
          receiptId: created.receipt_id,
          searchEpisodeId: created.search_episode_id,
          submissionCapability,
          replayed: false,
        })
      } catch (error) {
        const responseCode =
          error instanceof SearchBenchmarkPersistenceError
            ? error.code === 'SEARCH_BENCHMARK_QUOTA_EXCEEDED'
              ? 429
              : error.code === 'SEARCH_BENCHMARK_CATALOG_INVALID' ||
                  error.code === 'SEARCH_BENCHMARK_BODY_INVALID'
                ? 422
                : error.code === 'SEARCH_BENCHMARK_DUPLICATE'
                  ? 409
                  : error.code === 'SEARCH_BENCHMARK_NOTICE_NOT_FOUND'
                    ? 503
                    : 500
            : 500
        await failClaim(claim.identity, responseCode)

        if (error instanceof SearchBenchmarkPersistenceError) {
          mapPersistenceError(error, acceptedQuota)
        }
        if (error instanceof z.ZodError) {
          throw new SearchBenchmarkServiceError(
            'SEARCH_BENCHMARK_RESPONSE_INVALID',
          )
        }
        throw new SearchBenchmarkServiceError(
          'SEARCH_BENCHMARK_WRITE_FAILED',
        )
      }
    },
  }
}

/* v8 ignore start -- production composition root; route and adapters are tested separately */
export function createDefaultSearchBenchmarkService() {
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

  return createSearchBenchmarkService({
    repository: createSupabaseSearchBenchmarkRepository(),
    security,
    capabilityKeys: intakeEnvironment.capabilityKeys,
    subjectProofKeys: securityEnvironment.respondentKeys,
    getCurrentSurveyNotice(locale) {
      return privacy.getCurrentNotice({
        documentType: 'survey_notice',
        locale,
      })
    },
  })
}
/* v8 ignore stop */
