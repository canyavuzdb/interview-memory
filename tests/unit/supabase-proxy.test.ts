import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

import {
  applySupabaseResponseHeaders,
  updateSupabaseSession,
} from '@/lib/supabase/proxy'

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  getClaims: vi.fn(),
  getEnvironment: vi.fn(),
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: mocks.createServerClient,
}))

vi.mock('@/lib/env/public', () => ({
  getPublicSupabaseEnvironment: mocks.getEnvironment,
}))

describe('Supabase session proxy', () => {
  beforeEach(() => {
    mocks.createServerClient.mockReset()
    mocks.getClaims.mockReset()
    mocks.getEnvironment.mockReset()
    mocks.getEnvironment.mockReturnValue({
      url: 'https://project.supabase.co',
      publishableKey: 'sb_publishable_test',
    })
  })

  it('copies every required no-cache response header', () => {
    const response = NextResponse.next()

    applySupabaseResponseHeaders(response, {
      'Cache-Control': 'private, no-store',
      Expires: '0',
      Pragma: 'no-cache',
    })

    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(response.headers.get('expires')).toBe('0')
    expect(response.headers.get('pragma')).toBe('no-cache')
  })

  it('refreshes claims and propagates cookies to request and response', async () => {
    let cookieAdapter!: {
      getAll: () => Array<{ name: string; value: string }>
      setAll: (
        cookies: Array<{
          name: string
          value: string
          options: Record<string, unknown>
        }>,
        headers: Record<string, string>,
      ) => void
    }
    mocks.createServerClient.mockImplementation((_url, _key, options) => {
      cookieAdapter = options.cookies

      return { auth: { getClaims: mocks.getClaims } }
    })
    mocks.getClaims.mockImplementation(async () => {
      cookieAdapter.setAll(
        [
          {
            name: 'sb-session',
            value: 'refreshed-token',
            options: { httpOnly: false, path: '/', sameSite: 'lax' },
          },
        ],
        {
          'Cache-Control': 'private, no-cache, no-store',
          Expires: '0',
          Pragma: 'no-cache',
        },
      )

      return { data: { claims: { sub: 'user-id' } }, error: null }
    })
    const request = new NextRequest('https://app.example/tr/account', {
      headers: { cookie: 'existing=value' },
    })

    const response = await updateSupabaseSession(request)

    expect(mocks.createServerClient).toHaveBeenCalledWith(
      'https://project.supabase.co',
      'sb_publishable_test',
      expect.objectContaining({ db: { schema: 'api' } }),
    )
    expect(mocks.getClaims).toHaveBeenCalledOnce()
    expect(cookieAdapter.getAll()).toEqual(
      expect.arrayContaining([
        { name: 'existing', value: 'value' },
        { name: 'sb-session', value: 'refreshed-token' },
      ]),
    )
    expect(response.cookies.get('sb-session')?.value).toBe('refreshed-token')
    expect(response.headers.get('cache-control')).toBe(
      'private, no-cache, no-store',
    )
    expect(response.headers.get('expires')).toBe('0')
    expect(response.headers.get('pragma')).toBe('no-cache')
  })

  it('returns a pass-through response when no cookie refresh is needed', async () => {
    mocks.createServerClient.mockReturnValue({
      auth: { getClaims: mocks.getClaims },
    })
    mocks.getClaims.mockResolvedValue({ data: { claims: null }, error: null })

    const response = await updateSupabaseSession(
      new NextRequest('https://app.example/tr'),
    )

    expect(response.status).toBe(200)
    expect(response.cookies.getAll()).toEqual([])
  })
})
