import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { getPublicSupabaseEnvironment } from '@/lib/env/public'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  const { publishableKey, url } = getPublicSupabaseEnvironment()

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet, responseHeaders) {
        // B02 has no response object. The auth proxy must apply these cache
        // headers to its NextResponse before it owns session refreshes.
        void responseHeaders

        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components cannot write cookies. The auth proxy will own refresh writes.
        }
      },
    },
  })
}
