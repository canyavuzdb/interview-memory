import 'server-only'

import { NextResponse } from 'next/server'

export function createAuthRedirect(destination: string) {
  const response = NextResponse.redirect(destination, 303)

  response.headers.set(
    'Cache-Control',
    'private, no-cache, no-store, must-revalidate, max-age=0',
  )
  response.headers.set('Expires', '0')
  response.headers.set('Pragma', 'no-cache')

  return response
}
