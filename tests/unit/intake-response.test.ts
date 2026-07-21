import { describe, expect, it } from 'vitest'

import { createPrivateJsonResponse } from '@/lib/server/intake/response'

describe('private intake response', () => {
  it('returns JSON with private no-store headers', async () => {
    const response = createPrivateJsonResponse({ data: { ok: true } }, 201)

    expect(response.status).toBe(201)
    expect(response.headers.get('cache-control')).toContain('private')
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(response.headers.get('pragma')).toBe('no-cache')
    await expect(response.json()).resolves.toEqual({ data: { ok: true } })
  })

  it('defaults successful responses to 200', () => {
    expect(createPrivateJsonResponse(null).status).toBe(200)
  })
})
