import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, LogIn, Search, ShieldCheck } from 'lucide-react'
import AnonymousTrustSection from '@/components/AnonymousTrustSection'
import CommunityStats from '@/components/CommunityStats'
import HeroAnalyticsPanel from '@/components/HeroAnalyticsPanel'
import PreferenceControls from '@/components/PreferenceControls'
import StableLocalizedText from '@/components/StableLocalizedText'
import SurveyCarousel from '@/components/SurveyCarousel'
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
  const surveys = messages.surveyCards.map((survey) => ({
    ...survey,
    href: `/${locale}${survey.path}`,
  }))

  return (
    <main className="landing-grid min-h-screen text-ink">
      <header className="sticky top-0 z-30 border-b border-[var(--line-strong)] bg-transparent">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center px-5 py-3 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
          <Link href={`/${locale}`} className="flex items-center gap-3 justify-self-start" aria-label={messages.common.homeAria}>
            <div className="grid h-9 w-9 place-items-center border border-[var(--ink-soft)] bg-surfaceMuted font-mono text-[11px] font-bold tracking-[-0.08em] text-ink">
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
            <a href="#surveys" className="inline-flex items-center justify-center whitespace-nowrap px-5 py-2.5 transition hover:bg-[var(--surface-hover)] hover:text-ink">
              <span className="mr-2 text-muted">01/</span>
              <StableLocalizedText reserve={alternateMessages.header.surveys}>
                {messages.header.surveys}
              </StableLocalizedText>
            </a>
            <a href="#how-it-works" className="inline-flex items-center justify-center whitespace-nowrap px-5 py-2.5 transition hover:bg-[var(--surface-hover)] hover:text-ink">
              <span className="mr-2 text-muted">02/</span>
              <StableLocalizedText reserve={alternateMessages.header.howItWorks}>
                {messages.header.howItWorks}
              </StableLocalizedText>
            </a>
            <a href="#stats" className="inline-flex items-center justify-center whitespace-nowrap px-5 py-2.5 transition hover:bg-[var(--surface-hover)] hover:text-ink">
              <span className="mr-2 text-muted">03/</span>
              <StableLocalizedText reserve={alternateMessages.header.data}>
                {messages.header.data}
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
              className="inline-flex h-9 items-center justify-center gap-2 bg-transparent px-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--ink-soft)] transition hover:bg-[var(--surface-hover)] hover:text-ink md:px-3"
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
          <div className="mb-7 inline-flex w-fit items-stretch border-y border-[var(--line-strong)] font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
            <span className="grid w-10 place-items-center border-r border-[var(--line-strong)] text-accent">
              <ShieldCheck size={15} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span className="px-3 py-2.5">{messages.home.hero.badge}</span>
          </div>

          <h1 className="min-h-[200px] max-w-4xl text-5xl font-semibold tracking-[-0.055em] text-ink sm:min-h-[188px] sm:text-6xl lg:min-h-[152px] lg:text-7xl xl:min-h-[224px]">
            {messages.home.hero.title}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            {messages.home.hero.description}
          </p>

          <p className="mt-5 max-w-xl text-xl font-semibold tracking-tight text-ink">
            {messages.home.hero.slogan}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#surveys"
              className="inline-flex h-[46px] items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3 text-sm font-semibold text-surface shadow-sm transition hover:-translate-y-0.5 hover:bg-accentDark sm:h-auto sm:w-[200px]"
            >
              <StableLocalizedText reserve={alternateMessages.home.hero.explore}>
                {messages.home.hero.explore}
              </StableLocalizedText>
              <ArrowRight size={17} />
            </a>

            <Link
              href={`/${locale}/surveys/application-benchmark`}
              className="inline-flex h-[64px] items-center justify-center gap-2 rounded-sm border border-[var(--line-strong)] bg-surface px-6 py-3 text-center text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--line-emphasis)] sm:h-auto sm:w-[400px]"
            >
              <StableLocalizedText reserve={alternateMessages.home.hero.benchmark}>
                {messages.home.hero.benchmark}
              </StableLocalizedText>
              <Search size={17} />
            </Link>
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="absolute -left-6 top-10 hidden h-32 w-32 rounded-full bg-[var(--glow-primary)] blur-3xl lg:block" />
          <div className="absolute -bottom-8 right-4 hidden h-40 w-40 rounded-full bg-[var(--glow-secondary)] blur-3xl lg:block" />
          <HeroAnalyticsPanel copy={messages.home.signal} locale={locale} />
        </div>
      </section>

      <AnonymousTrustSection items={messages.trustItems} />

      <SurveyCarousel copy={messages.surveyCarousel} surveys={surveys} />

      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8"
      >
        <div className="grid gap-5 md:grid-cols-3">
          {messages.home.howItWorks.map((step, index) => (
            <div
              key={step.title}
              className="min-h-[210px] rounded-[1.75rem] border border-line bg-surface p-6 shadow-sm md:min-h-[238px] xl:min-h-[210px]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div id="stats">
        <CommunityStats copy={messages.community} />
      </div>

      <section className="mx-auto max-w-7xl px-5 py-14 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-line bg-surface p-6 text-center shadow-sm md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            {messages.home.finalCta.eyebrow}
          </p>
          <h2 className="mx-auto mt-3 min-h-[180px] max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl md:min-h-0">
            {messages.home.finalCta.title}
          </h2>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={`/${locale}/surveys/company-experience`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-surface transition hover:-translate-y-0.5 hover:bg-accentDark sm:w-[280px]"
            >
              <StableLocalizedText reserve={alternateMessages.home.finalCta.company}>
                {messages.home.finalCta.company}
              </StableLocalizedText>
              <ArrowRight size={17} />
            </Link>

            <Link
              href={`/${locale}/surveys/application-benchmark`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] bg-canvas px-6 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-[var(--line-emphasis)] sm:w-[280px]"
            >
              <StableLocalizedText reserve={alternateMessages.home.finalCta.benchmark}>
                {messages.home.finalCta.benchmark}
              </StableLocalizedText>
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
