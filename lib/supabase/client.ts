import { createBrowserClient } from '@supabase/ssr'

import type { ApiDatabase } from '@/lib/database/database.types'
import { getPublicSupabaseEnvironment } from '@/lib/env/public'

export function createBrowserSupabaseClient() {
  const { publishableKey, url } = getPublicSupabaseEnvironment()

  return createBrowserClient<ApiDatabase, 'api'>(url, publishableKey, {
    db: {
      schema: 'api',
    },
  })
}
