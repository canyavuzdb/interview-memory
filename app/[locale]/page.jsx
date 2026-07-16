import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Search } from 'lucide-react'
import CommunityStats from '@/components/CommunityStats'
import HeroAnalyticsPanel from '@/components/HeroAnalyticsPanel'
import LandingStory, { LandingStoryChapter } from '@/components/LandingStory'
import PlatformGuide from '@/components/PlatformGuide'
import PublicHeader from '@/components/PublicHeader'
import SiteFooter from '@/components/SiteFooter'
import StableLocalizedText from '@/components/StableLocalizedText'
import SurveyLaunchBanner from '@/components/SurveyLaunchBanner'
import TabTitleTicker from '@/components/TabTitleTicker'
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
      <TabTitleTicker
        baseTitle={messages.metadata.home.title}
        suffix={messages.home.tabTitleSuffix}
      />

      <PublicHeader
        alternateCopy={alternateMessages.header}
        common={messages.common}
        copy={messages.header}
        locale={locale}
      />

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
            {messages.home.hero.subtitleParts.pre}
            <span className="hero-anonymous-mark whitespace-nowrap">
              <span className="relative z-10">{messages.home.hero.subtitleParts.highlight}</span>
              <svg
                className="hero-anonymous-scribble"
                viewBox="0 0 160 24"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  className="hero-anonymous-stroke hero-anonymous-stroke-primary"
                  pathLength="100"
                  d="M4 13 C28 5 48 17 72 10 C95 3 119 14 156 7"
                />
                <path
                  className="hero-anonymous-stroke hero-anonymous-stroke-secondary"
                  pathLength="100"
                  d="M13 18 C37 12 57 20 82 14 C106 9 128 17 150 12"
                />
              </svg>
            </span>
            {messages.home.hero.subtitleParts.post}
          </p>

          <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
            {messages.home.hero.description}
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
        <LandingStory>
          <LandingStoryChapter id="surveys" tone="survey">
            <SurveyLaunchBanner
              copy={messages.home.surveyPrompt}
              href={`/${locale}/surveys`}
            />
          </LandingStoryChapter>

          <LandingStoryChapter id="stats" tone="data">
            <CommunityStats copy={messages.community} locale={locale} />
          </LandingStoryChapter>

          <LandingStoryChapter id="how-it-works" tone="info">
            <PlatformGuide copy={messages.platformGuide} />
          </LandingStoryChapter>

          <div className="landing-footer-zone">
            <SiteFooter copy={{ ...messages.footer, homeAria: messages.common.homeAria }} locale={locale} />
          </div>
        </LandingStory>
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
