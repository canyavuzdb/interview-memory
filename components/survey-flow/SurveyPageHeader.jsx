import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PreferenceControls from '@/components/PreferenceControls'

export default function SurveyPageHeader({ copy, locale, path }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line-strong)] bg-[var(--nav-surface)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <Link
          href={`/${locale}`}
          aria-label={copy.homeAria}
          className="flex items-center gap-3 justify-self-start"
        >
          <span className="brand-logo-mark grid h-9 w-9 place-items-center border bg-surfaceMuted font-mono text-[11px] font-bold tracking-[-0.08em] text-ink">
            IM
          </span>
          <span className="hidden sm:block">
            <span className="block text-xs font-bold uppercase leading-none tracking-[0.08em] text-ink">
              <span className="text-accent">I</span>nterview
            </span>
            <span className="mt-1 block text-xs font-bold uppercase leading-none tracking-[0.08em] text-ink">
              <span className="text-accent">M</span>emory
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted lg:flex">
          <span className="h-1.5 w-1.5 bg-accent" aria-hidden="true" />
          {copy.surveyContext}
          <span aria-hidden="true">·</span>
          {copy.threeSteps}
        </div>

        <PreferenceControls
          locale={locale}
          path={path}
          languageLabel={copy.languageLabel}
          themeLabel={copy.themeToggle}
          themeTitle={copy.themeTitle}
          className="justify-self-end"
        >
          <Link
            href={`/${locale}`}
            title={copy.backHome}
            aria-label={copy.backHome}
            className="grid min-h-9 min-w-9 place-items-center border border-[var(--line-strong)] bg-[var(--nav-surface)] text-ink transition hover:bg-[var(--surface-hover)] hover:text-accentDark"
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </Link>
        </PreferenceControls>
      </div>
    </header>
  )
}
