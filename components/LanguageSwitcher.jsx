'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const LOCATION_CHANGE_EVENT = 'interview-memory:location-change'

export default function LanguageSwitcher({
  locale,
  path = '',
  label,
  embedded = false,
}) {
  const nextLocale = locale === 'tr' ? 'en' : 'tr'
  const [hash, setHash] = useState('')

  useEffect(() => {
    function syncHash() {
      setHash(window.location.hash)
    }

    syncHash()
    window.addEventListener('hashchange', syncHash)
    window.addEventListener('popstate', syncHash)
    window.addEventListener(LOCATION_CHANGE_EVENT, syncHash)

    return () => {
      window.removeEventListener('hashchange', syncHash)
      window.removeEventListener('popstate', syncHash)
      window.removeEventListener(LOCATION_CHANGE_EVENT, syncHash)
    }
  }, [])

  return (
    <Link
      href={`/${nextLocale}${path}${hash}`}
      lang={nextLocale}
      hrefLang={nextLocale}
      aria-label={`${label}: ${nextLocale.toUpperCase()}`}
      title={`${label}: ${nextLocale.toUpperCase()}`}
      scroll={false}
      className={`brand-control inline-flex h-9 min-w-12 items-center justify-center px-3 font-mono text-xs font-bold uppercase tracking-[0.1em] text-ink transition ${
        embedded
          ? 'bg-transparent'
          : 'border border-[var(--line-strong)] bg-[var(--nav-surface)]'
      }`}
    >
      {locale.toUpperCase()}
    </Link>
  )
}
