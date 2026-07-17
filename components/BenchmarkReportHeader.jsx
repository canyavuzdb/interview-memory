import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function BenchmarkReportHeader({
  copy,
  headingId,
  locale,
  path,
  showAction = true,
}) {
  return (
    <header className="mb-9 grid gap-7 border-t border-[var(--line-strong)] pt-9 sm:mb-11 sm:pt-11 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.62fr)] lg:items-end">
      <div>
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-accentDark">
          {copy.eyebrow}
        </p>
        <h2
          id={headingId}
          className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-ink sm:text-5xl"
        >
          {copy.title}
        </h2>
      </div>

      <div className="lg:border-l lg:border-[var(--line-strong)] lg:pl-6">
        <p className="text-sm leading-6 text-muted">{copy.description}</p>
        {showAction && (
          <Link
            href={`/${locale}${path}`}
            className="report-action mt-4"
          >
            {copy.contributeCta}
            <ArrowRight size={13} strokeWidth={1.7} aria-hidden="true" />
          </Link>
        )}
      </div>
    </header>
  )
}
