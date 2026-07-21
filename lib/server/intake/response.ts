import 'server-only'

import { NextResponse } from 'next/server'

const privateHeaders = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
  Expires: '0',
  Pragma: 'no-cache',
}

export function createPrivateJsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: privateHeaders })
}
