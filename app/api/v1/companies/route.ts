import { NextResponse } from 'next/server'

import { createAdminSupabaseClient } from '@/lib/supabase/admin'

type CompanyRecord = {
  slug: string
  display_name: string
}

const responseHeaders = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('query')?.trim() ?? ''

  if (query.length < 2) {
    return NextResponse.json({ data: { items: [] } }, { headers: responseHeaders })
  }

  try {
    const client = createAdminSupabaseClient()
    const response = await client.rpc('search_published_companies_v1', {
      p_query: query,
      p_limit: 12,
    })
    const data = response.data as CompanyRecord[] | null

    if (response.error || !data) throw new Error('COMPANY_SEARCH_FAILED')

    return NextResponse.json({
      data: {
        items: data.map((company) => ({
          value: company.slug,
          label: company.display_name,
        })),
      },
    }, { headers: responseHeaders })
  } catch {
    return NextResponse.json(
      { error: { code: 'COMPANY_SEARCH_UNAVAILABLE' } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
