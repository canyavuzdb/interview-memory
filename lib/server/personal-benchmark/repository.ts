import 'server-only'

import { z } from 'zod'

import type { ApiDatabase } from '@/lib/database/database.types'
import { PersonalBenchmarkPersistenceError } from '@/lib/personal-benchmark/errors'
import {
  personalBenchmarkReportSchema,
  type PersonalBenchmarkReport,
} from '@/lib/personal-benchmark/contracts'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

const jsonSchema = z.unknown()

export interface PersonalBenchmarkRepository {
  getReport(authUserId: string): Promise<PersonalBenchmarkReport | null>
}

export function createSupabasePersonalBenchmarkRepository(): PersonalBenchmarkRepository {
  const client = createAdminSupabaseClient()

  return {
    async getReport(authUserId) {
      const { data, error } = await client.rpc('get_my_personal_report_v1', {
        p_auth_user_id: authUserId,
      })

      if (error) {
        throw new PersonalBenchmarkPersistenceError('REPORT_READ_FAILED')
      }

      if (data === null) return null

      const raw = jsonSchema.safeParse(data)
      const result = raw.success
        ? personalBenchmarkReportSchema.safeParse(raw.data)
        : null

      if (!result || !result.success) {
        throw new PersonalBenchmarkPersistenceError('REPORT_RESPONSE_INVALID')
      }

      return result.data
    },
  }
}
