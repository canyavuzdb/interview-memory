import { NextResponse } from 'next/server'

import { createAdminSupabaseClient } from '@/lib/supabase/admin'

type CompanyRecord = {
  id: string
  slug: string
  display_name: string
}

const responseHeaders = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('query')?.trim() ?? ''

  try {
    const client = createAdminSupabaseClient()
    let data: CompanyRecord[] = []

    if (query.length >= 2) {
      const response = await client.rpc('search_published_companies_v1', {
        p_query: query,
        p_limit: 25,
      })
      if (response.error || !response.data) throw new Error('COMPANY_SEARCH_FAILED')
      data = response.data as CompanyRecord[]
    } else {
      let cursor: Pick<CompanyRecord, 'display_name' | 'id'> | null = null

      do {
        const response = await client.rpc('list_published_companies_v1', {
          p_after_display_name: cursor?.display_name,
          p_after_id: cursor?.id,
          p_limit: 101,
        })
        const page = response.data as CompanyRecord[] | null
        if (response.error || !page) throw new Error('COMPANY_LIST_FAILED')
        data.push(...page)
        cursor = page.length === 101 ? page.at(-1) ?? null : null
      } while (cursor)
    }

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
