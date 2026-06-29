'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, LogIn } from 'lucide-react'

export default function LoginPreview({ copy, anonymousHref }) {
  const [showPreviewNotice, setShowPreviewNotice] = useState(false)

  return (
    <div className="border border-line bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <div className="mb-6 flex h-11 w-11 items-center justify-center border border-[var(--line-strong)] bg-surfaceMuted text-ink">
        <LogIn size={20} />
      </div>

      <h2 className="text-2xl font-semibold tracking-[-0.035em] text-ink">
        {copy.accessTitle}
      </h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        {copy.accessDescription}
      </p>

      <button
        type="button"
        onClick={() => setShowPreviewNotice(true)}
        className="mt-7 inline-flex h-12 w-full items-center justify-center gap-3 bg-ink px-5 text-sm font-semibold text-surface transition hover:bg-accentDark"
      >
        <span
          aria-hidden="true"
          className="grid h-6 w-6 place-items-center bg-surface font-mono text-xs font-bold text-ink"
        >
          G
        </span>
        {copy.googleCta}
      </button>

      {showPreviewNotice && (
        <p role="status" className="mt-4 border border-line bg-canvas p-4 text-sm leading-6 text-muted">
          {copy.previewNotice}
        </p>
      )}

      <div className="my-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
          {copy.alternative}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <Link
        href={anonymousHref}
        className="inline-flex h-12 w-full items-center justify-center gap-2 border border-[var(--line-strong)] bg-canvas px-5 text-sm font-semibold text-ink transition hover:bg-[var(--surface-hover)]"
      >
        {copy.anonymousCta}
        <ArrowRight size={16} />
      </Link>

      <p className="mt-5 text-xs leading-5 text-muted">
        {copy.privacyNote}
      </p>
    </div>
  )
}
