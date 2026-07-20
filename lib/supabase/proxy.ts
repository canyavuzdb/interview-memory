import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import type { ApiDatabase } from '@/lib/database/database.types'
import { getPublicSupabaseEnvironment } from '@/lib/env/public'

export function applySupabaseResponseHeaders(
  response: NextResponse,
  headers: Record<string, string>,
): void {
  Object.entries(headers).forEach(([name, value]) => {
    response.headers.set(name, value)
  })
}

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { publishableKey, url } = getPublicSupabaseEnvironment()
  const client = createServerClient<ApiDatabase, 'api'>(url, publishableKey, {
    db: {
      schema: 'api',
    },
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, responseHeaders) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        response = NextResponse.next({ request })

        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options)
        })
        applySupabaseResponseHeaders(response, responseHeaders)
      },
    },
  })

  await client.auth.getClaims()

  return response
}
