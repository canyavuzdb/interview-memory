import 'server-only'

import { preparationContributionSchema, type PreparationReport } from '@/lib/interview-preparation/contracts'
import {
  createSupabaseInterviewPreparationRepository,
  type InterviewPreparationRepository,
} from '@/lib/server/interview-preparation/repository'

export function createInterviewPreparationService(repository: InterviewPreparationRepository) {
  return {
    async contribute(dataSubjectId: string, body: unknown) {
      const contribution = preparationContributionSchema.safeParse(body)
      if (!contribution.success) throw new Error('PREPARATION_BODY_INVALID')
      if (contribution.data.processYear > new Date().getUTCFullYear()) {
        throw new Error('PREPARATION_BODY_INVALID')
      }
      return repository.create({ ...contribution.data, dataSubjectId })
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
  return createInterviewPreparationService(createSupabaseInterviewPreparationRepository())
}
