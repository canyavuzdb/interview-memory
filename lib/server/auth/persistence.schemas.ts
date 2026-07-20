import { z } from 'zod'

import type { AccountContextRecord } from '@/lib/database/database.types'

export const accountContextRecordSchema: z.ZodType<AccountContextRecord> =
  z.strictObject({
    user_id: z.uuid(),
    locale: z.enum(['tr', 'en']),
    timezone: z.string().trim().min(1).max(100),
    onboarding_status: z.enum(['pending', 'completed', 'skipped']),
    account_status: z.literal('active'),
    version: z.number().int().positive(),
  })
