import 'server-only'

import { z } from 'zod'

import type { PreparationContribution, PreparationReport } from '@/lib/interview-preparation/contracts'
import { preparationReportSchema } from '@/lib/interview-preparation/contracts'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

const createResultSchema = z.object({ contribution_id: z.uuid(), created_at: z.string() })

export interface InterviewPreparationRepository {
  create(input: PreparationContribution & {
    dataSubjectId: string
    quotaSubjectHmac: string
    quotaWindowStart: string
    quotaLimit: number
    quotaPolicyVersion: string
    quotaPolicyHash: string
    quotaExpiresAt: string
  }): Promise<{ id: string }>
  getReport(input: {
    companyName: string
    appliedRole: string
    seniority: string | null
  }): Promise<PreparationReport>
}

export function createSupabaseInterviewPreparationRepository(): InterviewPreparationRepository {
  const client = createAdminSupabaseClient()

  return {
    async create(input) {
      const { data, error } = await client.rpc('create_interview_preparation_contribution_with_quota_v1', {
        p_data_subject_id: input.dataSubjectId,
        p_company_name: input.companyName,
        p_applied_role: input.appliedRole,
        p_seniority: input.seniority,
        p_process_year: input.processYear,
        p_stage_details: input.stageDetails,
        p_quota_subject_hmac: input.quotaSubjectHmac,
        p_quota_window_start: input.quotaWindowStart,
        p_quota_limit: input.quotaLimit,
        p_quota_policy_version: input.quotaPolicyVersion,
        p_quota_policy_hash: input.quotaPolicyHash,
        p_quota_expires_at: input.quotaExpiresAt,
      })
      if (error?.message.includes('accepted_quota_exceeded')) {
        throw new Error('PREPARATION_QUOTA_EXCEEDED')
      }
      if (error) throw new Error('PREPARATION_WRITE_FAILED')
      const result = createResultSchema.safeParse(data?.[0])
      if (!result.success) throw new Error('PREPARATION_RESPONSE_INVALID')
      return { id: result.data.contribution_id }
    },

    async getReport(input) {
      const { data, error } = await client.rpc('get_interview_preparation_report_v1', {
        p_company_name: input.companyName,
        p_applied_role: input.appliedRole,
        ...(input.seniority ? { p_seniority: input.seniority } : {}),
      })
      if (error) throw new Error('PREPARATION_REPORT_FAILED')
      const result = preparationReportSchema.safeParse(data)
      if (!result.success) throw new Error('PREPARATION_REPORT_INVALID')
      return result.data
    },
  }
}
