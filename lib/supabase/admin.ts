import 'server-only'

import { createClient } from '@supabase/supabase-js'

import type { ApiDatabase } from '@/lib/database/database.types'
import { getPublicSupabaseEnvironment } from '@/lib/env/public'
import { getServerSupabaseEnvironment } from '@/lib/env/server'

export function createAdminSupabaseClient() {
  const { url } = getPublicSupabaseEnvironment()
  const { secretKey } = getServerSupabaseEnvironment()

  return createClient<ApiDatabase, 'api'>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    db: {
      schema: 'api',
    },
  })
}
