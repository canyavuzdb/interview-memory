import 'server-only'

import { createClient } from '@supabase/supabase-js'

import { getPublicSupabaseEnvironment } from '@/lib/env/public'
import { getServerSupabaseEnvironment } from '@/lib/env/server'

export function createAdminSupabaseClient() {
  const { url } = getPublicSupabaseEnvironment()
  const { secretKey } = getServerSupabaseEnvironment()

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })
}
