'use client'

import { Check } from 'lucide-react'
import { useEffect } from 'react'

export default function AccountSessionNotice({ copy, visible }) {
  useEffect(() => {
    if (!visible) return

    const url = new URL(window.location.href)

    if (url.searchParams.get('status') !== 'signedIn') return

    url.searchParams.delete('status')
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    )
  }, [visible])

  if (!visible) return null

  return (
    <div
      role="status"
      className="mb-7 flex items-start gap-3 border border-accent/30 bg-accent/5 px-4 py-3.5 text-sm text-ink"
    >
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-white">
        <Check size={12} strokeWidth={3} aria-hidden="true" />
      </span>
      <span className="leading-6">{copy}</span>
    </div>
  )
}
