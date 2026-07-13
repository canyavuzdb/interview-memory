import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, LogIn, Search } from 'lucide-react'
import CommunityStats from '@/components/CommunityStats'
import HeroAnalyticsPanel from '@/components/HeroAnalyticsPanel'
import PreferenceControls from '@/components/PreferenceControls'
import SiteFooter from '@/components/SiteFooter'
import StableLocalizedText from '@/components/StableLocalizedText'
import SurveyLaunchBanner from '@/components/SurveyLaunchBanner'
import { getMessages, isSupportedLocale } from '@/data/i18n'

export async function generateMetadata({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) return {}

  const metadata = getMessages(locale).metadata.home

  return {
    ...metadata,
    title: { absolute: metadata.title },
  }
}

export default async function HomePage({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) notFound()

  const messages = getMessages(locale)
  const alternateMessages = getMessages(locale === 'tr' ? 'en' : 'tr')

  return (
    <main className="landing-grid min-h-screen text-ink">
      <header className="sticky top-0 z-30 border-b border-[var(--line-strong)] bg-transparent">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center px-5 py-3 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
          <Link href={`/${locale}`} className="flex items-center gap-3 justify-self-start" aria-label={messages.common.homeAria}>
            <div className="brand-logo-mark grid h-9 w-9 place-items-center border bg-surfaceMuted font-mono text-[11px] font-bold tracking-[-0.08em] text-ink">
              IM
            </div>
            <div>
              <p className="text-xs font-bold uppercase leading-none tracking-[0.08em]">
                <span className="text-accent">I</span>nterview
              </p>
              <p className="mt-1 text-xs font-bold uppercase leading-none tracking-[0.08em]">
                <span className="text-accent">M</span>emory
              </p>
            </div>
          </Link>

          <nav
            aria-label={messages.header.navLabel}
            className="hidden justify-self-center divide-x divide-[var(--line-strong)] border border-[var(--line-strong)] bg-[var(--nav-surface)] font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-soft)] lg:flex"
          >
            <Link href={`/${locale}/surveys`} className="brand-nav-item inline-flex items-center justify-center whitespace-nowrap px-5 py-2.5 transition hover:bg-[var(--surface-hover)] hover:text-accentDark">
              <span className="mr-2 text-muted">01/</span>
              <StableLocalizedText reserve={alternateMessages.header.surveys}>
                {messages.header.surveys}
              </StableLocalizedText>
            </Link>
            <a href="#stats" className="brand-nav-item inline-flex items-center justify-center whitespace-nowrap px-5 py-2.5 transition hover:bg-[var(--surface-hover)] hover:text-accentDark">
              <span className="mr-2 text-muted">02/</span>
              <StableLocalizedText reserve={alternateMessages.header.community}>
                {messages.header.community}
              </StableLocalizedText>
            </a>
          </nav>

          <PreferenceControls
            locale={locale}
            languageLabel={messages.common.languageLabel}
            themeLabel={messages.common.themeToggle}
            themeTitle={messages.common.themeTitle}
            className="justify-self-end"
          >
            <Link
              href={`/${locale}/login`}
              aria-label={messages.header.signIn}
              className="inline-flex h-9 min-w-9 items-center justify-center gap-2 border border-ink bg-ink px-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-surface transition hover:-translate-y-px hover:bg-accentDark hover:text-surface md:px-4"
            >
              <LogIn size={15} aria-hidden="true" />
              <StableLocalizedText
                reserve={alternateMessages.header.signIn}
                className="hidden md:grid"
              >
                {messages.header.signIn}
              </StableLocalizedText>
            </Link>
          </PreferenceControls>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-stretch gap-12 px-5 py-16 sm:px-6 md:py-20 lg:px-8 lg:py-24 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="min-w-0 flex flex-col justify-center">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
            {messages.home.hero.eyebrow}
          </p>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-ink sm:text-6xl lg:text-7xl">
            {messages.home.hero.title}{' '}
            <span className="font-mono text-[0.82em] tracking-[-0.075em] text-accentDark">
              {messages.home.hero.titleHighlight}
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-xl font-semibold leading-8 tracking-tight text-ink">
            {messages.home.hero.subtitle}
          </p>

          <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
            {messages.home.hero.descriptionParts.pre}
            <span className="hero-body-highlight whitespace-nowrap font-mono">
              {messages.home.hero.descriptionParts.highlight}
            </span>
            {messages.home.hero.descriptionParts.post}
          </p>

          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2" aria-label={messages.home.hero.detailsLabel}>
            {messages.home.hero.details.map((detail) => (
              <li key={detail} className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
                <span className="h-1.5 w-1.5 bg-accent" aria-hidden="true" />
                {detail}
              </li>
            ))}
          </ul>

          <div className="mt-9 grid gap-3 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <Link
              href={`/${locale}/surveys/application-benchmark`}
              className="hero-color-sweep-cta group relative flex h-16 w-full items-center justify-between gap-4 px-7 text-sm font-semibold"
            >
              <StableLocalizedText reserve={alternateMessages.home.hero.explore}>
                {messages.home.hero.explore}
              </StableLocalizedText>
              <ArrowRight size={17} className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </Link>

            <a
              href="#stats"
              className="group inline-flex h-16 w-full items-center justify-center gap-3 rounded-sm border border-[var(--line-strong)] bg-surface px-5 py-3 text-center text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent-border)]"
            >
              <StableLocalizedText reserve={alternateMessages.home.hero.benchmark}>
                {messages.home.hero.benchmark}
              </StableLocalizedText>
              <Search size={17} className="text-accentDark transition-transform group-hover:scale-110" />
            </a>
          </div>
        </div>

        <div className="relative min-w-0">
          <HeroAnalyticsPanel copy={messages.home.signal} locale={locale} />
        </div>
      </section>

      <div className="landing-puzzle-flow">
        <div className="landing-survey-zone">
          <SurveyLaunchBanner
            copy={messages.home.surveyPrompt}
            href={`/${locale}/surveys`}
          />
        </div>

        <div id="stats" className="landing-data-zone scroll-mt-16">
          <CommunityStats copy={messages.community} locale={locale} />
        </div>

        <div className="landing-footer-zone">
          <SiteFooter copy={{ ...messages.footer, homeAria: messages.common.homeAria }} locale={locale} />
        </div>
      </div>

      <a
        href="https://github.com/canyavuzdb/interview-memory/tree/master"
        target="_blank"
        rel="noreferrer"
        aria-label="Can Yavuz — Interview Memory GitHub repository"
        className="brand-text-link fixed bottom-5 left-5 z-40 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted sm:bottom-6 sm:left-6"
      >
        Can Yavuz
      </a>
    </main>
  )
}
