import 'server-only'

import { preparationContributionSchema, type PreparationReport } from '@/lib/interview-preparation/contracts'
import type { CompanyExperienceActor } from '@/lib/server/company-experience/actor'
import { getServerSecurityEnvironment } from '@/lib/env/server'
import { createSupabaseSecurityRepository } from '@/lib/server/security/repository'
import { createSecurityService, type PreparedQuota } from '@/lib/server/security/service'
import {
  createSupabaseInterviewPreparationRepository,
  type InterviewPreparationRepository,
} from '@/lib/server/interview-preparation/repository'

type SecurityService = ReturnType<typeof createSecurityService>

export function createInterviewPreparationService(
  repository: InterviewPreparationRepository,
  security: Pick<SecurityService, 'prepareQuota'>,
) {
  return {
    async contribute(actor: CompanyExperienceActor, body: unknown) {
      const contribution = preparationContributionSchema.safeParse(body)
      if (!contribution.success) throw new Error('PREPARATION_BODY_INVALID')
      if (contribution.data.processYear > new Date().getUTCFullYear()) {
        throw new Error('PREPARATION_BODY_INVALID')
      }
      let quota: PreparedQuota
      try {
        quota = security.prepareQuota({
          policy: 'anonymousInterviewPreparation',
          windowKind: 'accepted_day',
          counter: 'accepted',
          subjectId: actor.dataSubjectId,
        })
      } catch {
        throw new Error('PREPARATION_WRITE_FAILED')
      }
      return repository.create({
        ...contribution.data,
        dataSubjectId: actor.dataSubjectId,
        quotaSubjectHmac: quota.subjectHmac,
        quotaWindowStart: quota.windowStart,
        quotaLimit: actor.kind === 'anonymous' ? quota.limit : 0,
        quotaPolicyVersion: quota.policyVersion,
        quotaPolicyHash: quota.policyHash,
        quotaExpiresAt: quota.expiresAt,
      })
    },
    async getReport(input: {
      companyName: string
      appliedRole: string
      seniority: string | null
    }): Promise<PreparationReport> {
      return repository.getReport(input)
    },
  }
}

export function createDefaultInterviewPreparationService() {
  const environment = getServerSecurityEnvironment()
  return createInterviewPreparationService(
    createSupabaseInterviewPreparationRepository(),
    createSecurityService({
      repository: createSupabaseSecurityRepository(),
      quotaSubjectKey: environment.quotaSubjectKey,
      idempotencyKey: environment.idempotencyKey,
    }),
  )
}
