'use client'

import Link from 'next/link'
import { CircleUserRound, LogIn } from 'lucide-react'
import { useEffect, useState } from 'react'

import { createBrowserSupabaseClient } from '@/lib/supabase/client'

const variantClasses = {
  compact:
    'relative grid min-h-9 min-w-9 place-items-center border border-[var(--line-strong)] bg-[var(--nav-surface)] transition hover:bg-[var(--surface-hover)] hover:text-accentDark',
  desktop:
    'hidden h-9 min-w-[7.5rem] items-center justify-center gap-2 border px-4 font-mono text-[10px] font-bold uppercase tracking-[0.07em] transition xl:inline-flex',
  mobile:
    'mt-5 flex h-11 w-full items-center justify-center gap-2 border px-4 font-mono text-[10px] font-bold uppercase tracking-[0.07em] transition',
}

export default function SessionAccessLink({
  accountLabel,
  locale,
  onNavigate,
  signInLabel,
  variant = 'desktop',
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const client = createBrowserSupabaseClient()
    let isMounted = true
    let authRevision = 0

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      authRevision += 1
      if (isMounted) setIsAuthenticated(Boolean(session?.user))
    })

    const initialRevision = authRevision

    // This state changes presentation only. Protected routes still validate
    // verified claims and the active application account on the server.
    void client.auth
      .getSession()
      .then(({ data }) => {
        if (isMounted && authRevision === initialRevision) {
          setIsAuthenticated(Boolean(data.session?.user))
        }
      })
      .catch(() => {
        if (isMounted && authRevision === initialRevision) {
          setIsAuthenticated(false)
        }
      })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const href = isAuthenticated ? `/${locale}/account` : `/${locale}/login`
  const label = isAuthenticated ? accountLabel : signInLabel
  const Icon = isAuthenticated ? CircleUserRound : LogIn
  const authenticatedClasses = isAuthenticated
    ? 'border-accent/35 bg-[var(--nav-surface)] text-ink hover:bg-[var(--surface-hover)]'
    : 'border-ink bg-ink text-surface hover:bg-accentDark'

  return (
    <Link
      href={href}
      aria-label={label}
      title={variant === 'compact' ? label : undefined}
      onClick={onNavigate}
      className={`${variantClasses[variant]} ${authenticatedClasses}`}
    >
      <span className="relative inline-grid place-items-center">
        <Icon size={variant === 'compact' ? 16 : 14} aria-hidden="true" />
        {isAuthenticated && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-[var(--nav-surface)]"
          />
        )}
      </span>
      {variant !== 'compact' && <span>{label}</span>}
    </Link>
  )
}
