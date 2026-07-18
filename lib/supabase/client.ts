import { createBrowserClient } from '@supabase/ssr'

import { getPublicSupabaseEnvironment } from '@/lib/env/public'

export function createBrowserSupabaseClient() {
  const { publishableKey, url } = getPublicSupabaseEnvironment()

  return createBrowserClient(url, publishableKey)
}
