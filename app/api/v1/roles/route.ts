import { NextResponse } from 'next/server'

import { createAdminSupabaseClient } from '@/lib/supabase/admin'

const ROLE_FAMILY_ID = 'b8000000-0000-4000-8100-000000000007'
const TAXONOMY_VERSION = '2026.1'
const PAGE_SIZE = 101

type RoleRecord = {
  id: string
  slug: string
  display_name: string
  sort_order: number
}

const publicHeaders = {
  'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  'Content-Type': 'application/json; charset=utf-8',
}

export async function GET(request: Request) {
  const client = createAdminSupabaseClient()
  const locale = new URL(request.url).searchParams.get('locale') === 'en' ? 'en' : 'tr'
  const items: Array<{ value: string; label: string }> = []
  let cursor: { id: string; sortOrder: number } | null = null

  try {
    do {
      const response = await client.rpc('list_active_localized_roles_v1', {
        p_role_family_id: ROLE_FAMILY_ID,
        p_taxonomy_version: TAXONOMY_VERSION,
        p_locale: locale ?? 'tr',
        p_after_sort_order: cursor?.sortOrder,
        p_after_id: cursor?.id,
        p_limit: PAGE_SIZE,
      })

      const data = response.data as RoleRecord[] | null
      if (response.error || !data) throw new Error('ROLE_LIST_FAILED')

      items.push(...data.map((role) => ({ value: role.slug, label: role.display_name })))
      const last = data.at(-1)
      cursor = data.length === PAGE_SIZE && last
        ? { id: last.id, sortOrder: last.sort_order }
        : null
    } while (cursor)

    const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' })
    items.sort((left, right) => {
      if (left.value === 'diger') return 1
      if (right.value === 'diger') return -1
      return collator.compare(left.label, right.label)
    })

    return NextResponse.json({ data: { items } }, { headers: publicHeaders })
  } catch {
    return NextResponse.json(
      { error: { code: 'ROLE_LIST_UNAVAILABLE' } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
