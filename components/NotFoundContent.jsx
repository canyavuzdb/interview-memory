'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import PreferenceControls from '@/components/PreferenceControls'
import { getMessages, isSupportedLocale } from '@/data/i18n'

export default function NotFoundContent() {
  const pathname = usePathname()
  const pathLocale = pathname.split('/')[1]
  const locale = isSupportedLocale(pathLocale) ? pathLocale : 'tr'
  const messages = getMessages(locale)
  const copy = messages.notFound

  return (
    <main className="landing-grid flex min-h-screen flex-col text-ink">
      <header className="border-b border-[var(--line-strong)] bg-transparent">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3"
            aria-label={messages.common.homeAria}
          >
            <span className="grid h-9 w-9 place-items-center border border-[var(--ink-soft)] bg-surfaceMuted font-mono text-[11px] font-bold tracking-[-0.08em] text-ink">
              IM
            </span>
            <span className="hidden sm:block">
              <span className="block text-xs font-bold uppercase leading-none tracking-[0.08em]">
                <span className="text-accent">I</span>nterview
              </span>
              <span className="mt-1 block text-xs font-bold uppercase leading-none tracking-[0.08em]">
                <span className="text-accent">M</span>emory
              </span>
            </span>
          </Link>

          <PreferenceControls
            locale={locale}
            path="/404"
            languageLabel={messages.common.languageLabel}
            themeLabel={messages.common.themeToggle}
            themeTitle={messages.common.themeTitle}
          />
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-7xl flex-1 items-center px-5 py-6 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="grid w-full items-center gap-6 sm:gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-0">
          <div className="relative flex min-h-[220px] items-center justify-center py-4 sm:min-h-[300px] sm:py-8 lg:min-h-[520px] lg:justify-start lg:pr-14">
            <div className="absolute left-0 top-0 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
              ERR / 04
            </div>
            <div className="absolute bottom-0 right-0 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted lg:right-14">
              NO SIGNAL
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-1/2 h-px w-[calc(100%+2rem)] bg-[var(--line-strong)] sm:-left-8 sm:w-[calc(100%+4rem)]" />
              <div className="absolute left-1/2 -top-7 h-[calc(100%+3.5rem)] w-px bg-[var(--line-strong)]" />

              <p className="relative flex items-baseline font-mono text-[clamp(6.5rem,25vw,13rem)] font-bold leading-[0.72] tracking-[-0.14em] text-ink">
                <span>4</span>
                <span className="translate-y-[0.04em] text-transparent [-webkit-text-stroke:1.5px_var(--ink)]">
                  0
                </span>
                <span>4</span>
              </p>

              <div className="relative mt-6 flex items-center justify-center sm:mt-9">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                  {copy.codeLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center border-t border-[var(--line-strong)] pt-7 sm:pt-10 lg:min-h-[520px] lg:border-l lg:border-t-0 lg:py-10 lg:pl-14 xl:pl-20">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-accent">
              04/ {copy.eyebrow}
            </p>
            <h1 className="mt-4 max-w-2xl text-[2.35rem] font-semibold leading-[1.05] tracking-[-0.05em] sm:mt-5 sm:text-5xl lg:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:mt-6 sm:leading-8">
              {copy.description}
            </p>

            <div className="mt-7 flex flex-col items-start gap-3 sm:mt-9 sm:flex-row">
              <Link
                href={`/${locale}`}
                className="group inline-flex h-10 items-stretch border border-ink bg-ink text-surface transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] sm:h-12"
              >
                <span className="grid w-10 shrink-0 place-items-center border-r border-[var(--inverse-line)] bg-[var(--inverse-overlay)] transition group-hover:bg-[var(--inverse-line)] sm:w-12">
                  <ArrowLeft
                    size={16}
                    aria-hidden="true"
                    className="transition-transform group-hover:-translate-x-0.5"
                  />
                </span>
                <span className="flex flex-1 items-center whitespace-nowrap px-4 font-mono text-[10px] font-bold uppercase tracking-[0.08em] sm:px-5 sm:text-[11px]">
                  {copy.homeCta}
                </span>
              </Link>
              <Link
                href={`/${locale}/surveys`}
                className="group inline-flex h-10 items-stretch border border-[var(--line-strong)] bg-[var(--nav-surface)] text-ink transition hover:-translate-y-0.5 hover:border-ink hover:shadow-[var(--shadow-card)] sm:h-12"
              >
                <span className="flex flex-1 items-center whitespace-nowrap px-4 font-mono text-[10px] font-bold uppercase tracking-[0.08em] sm:px-5 sm:text-[11px]">
                  {copy.surveysCta}
                </span>
                <span className="grid w-10 shrink-0 place-items-center border-l border-[var(--line-strong)] transition group-hover:border-ink group-hover:bg-ink group-hover:text-surface sm:w-12">
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
