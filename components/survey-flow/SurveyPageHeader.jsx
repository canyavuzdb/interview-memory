import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BrandHomeLink from '@/components/brand/BrandHomeLink'
import PreferenceControls from '@/components/PreferenceControls'

export default function SurveyPageHeader({ copy, locale, path }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line-strong)] bg-transparent">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 sm:px-6 lg:px-8">
        <BrandHomeLink
          href={`/${locale}`}
          label={copy.homeAria}
          className="justify-self-start"
        />

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
