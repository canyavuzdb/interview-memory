'use client'

import Link from 'next/link'
import { ChevronDown, LogIn, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import BrandHomeLink from './brand/BrandHomeLink'
import PreferenceControls from './PreferenceControls'
import StableLocalizedText from './StableLocalizedText'

export default function PublicHeader({
  alternateCopy,
  common,
  copy,
  locale,
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isSurveyOpen, setIsSurveyOpen] = useState(false)
  const closeTimerRef = useRef(null)
  const headerRef = useRef(null)
  const mobileTriggerRef = useRef(null)
  const surveyMenuRef = useRef(null)
  const surveyTriggerRef = useRef(null)

  const surveyLinks = [
    {
      description: copy.applicationBenchmarkDescription,
      href: `/${locale}/surveys/application-benchmark`,
      label: copy.applicationBenchmark,
    },
    {
      description: copy.companyExperienceDescription,
      href: `/${locale}/surveys/company-experience`,
      label: copy.companyExperience,
    },
  ]

  function openSurveyMenu() {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    setIsSurveyOpen(true)
  }

  function scheduleSurveyClose() {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => setIsSurveyOpen(false), 140)
  }

  useEffect(() => {
    function handlePointerDown(event) {
      if (!surveyMenuRef.current?.contains(event.target)) {
        setIsSurveyOpen(false)
      }

      if (!headerRef.current?.contains(event.target)) {
        setIsMobileOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key !== 'Escape') return

      const activeElement = document.activeElement
      const mobileMenu = document.getElementById('public-mobile-menu')
      const shouldRestoreSurveyFocus = surveyMenuRef.current?.contains(activeElement)
      const shouldRestoreMobileFocus = mobileMenu?.contains(activeElement)

      setIsSurveyOpen(false)
      setIsMobileOpen(false)

      if (shouldRestoreSurveyFocus) surveyTriggerRef.current?.focus()
      if (shouldRestoreMobileFocus) mobileTriggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    }
  }, [])

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 border-b border-[var(--line-strong)] bg-transparent"
    >
      <div className="relative mx-auto grid max-w-7xl grid-cols-[auto_1fr] items-center gap-4 px-5 py-3 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <BrandHomeLink
          href={`/${locale}`}
          label={common.homeAria}
          className="justify-self-start"
        />

        <nav
          aria-label={copy.navLabel}
          className="hidden items-stretch divide-x divide-[var(--line-strong)] border border-[var(--line-strong)] bg-[var(--nav-surface)] font-mono text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--ink-soft)] lg:flex"
        >
          <div
            ref={surveyMenuRef}
            className="relative"
            onMouseEnter={openSurveyMenu}
            onMouseLeave={scheduleSurveyClose}
          >
            <button
              ref={surveyTriggerRef}
              type="button"
              aria-controls="public-survey-menu"
              aria-expanded={isSurveyOpen}
              onClick={() => setIsSurveyOpen((current) => !current)}
              className="brand-nav-item inline-flex h-full items-center justify-center gap-2 whitespace-nowrap px-5 py-2.5 transition hover:bg-[var(--surface-hover)] hover:text-accentDark"
            >
              <StableLocalizedText reserve={alternateCopy.surveys}>
                {copy.surveys}
              </StableLocalizedText>
              <ChevronDown
                size={13}
                aria-hidden="true"
                className={`transition-transform duration-200 ${isSurveyOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <div
              id="public-survey-menu"
              aria-label={copy.surveyMenuLabel}
              hidden={!isSurveyOpen}
              className="absolute left-0 top-[calc(100%+12px)] w-[22rem] border border-[var(--line-strong)] bg-surface p-2 text-left normal-case tracking-normal text-ink shadow-[6px_6px_0_color-mix(in_srgb,var(--ink)_9%,transparent)]"
            >
              <div className="absolute -top-3 left-0 h-3 w-32" aria-hidden="true" />
              {surveyLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSurveyOpen(false)}
                  className="group block border-b border-[var(--line)] px-4 py-4 last:border-b-0 hover:bg-[var(--surface-hover)]"
                >
                  <span className="block text-sm font-semibold tracking-[-0.01em] text-ink group-hover:text-accentDark">
                    {item.label}
                  </span>
                  <span className="mt-1.5 block text-xs leading-5 text-muted">
                    {item.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <Link
            href={`/${locale}#stats`}
            className="brand-nav-item inline-flex items-center justify-center whitespace-nowrap px-5 py-2.5 transition hover:bg-[var(--surface-hover)] hover:text-accentDark"
          >
            <StableLocalizedText reserve={alternateCopy.community}>
              {copy.community}
            </StableLocalizedText>
          </Link>

          <Link
            href={`/${locale}#how-it-works`}
            className="brand-nav-item inline-flex items-center justify-center whitespace-nowrap px-5 py-2.5 transition hover:bg-[var(--surface-hover)] hover:text-accentDark"
          >
            <StableLocalizedText reserve={alternateCopy.howItWorks}>
              {copy.howItWorks}
            </StableLocalizedText>
          </Link>
        </nav>

        <div className="flex items-stretch justify-self-end gap-3">
          <PreferenceControls
            locale={locale}
            languageLabel={common.languageLabel}
            themeLabel={common.themeToggle}
            themeTitle={common.themeTitle}
          />

          <Link
            href={`/${locale}/login`}
            aria-label={copy.signIn}
            className="hidden h-9 items-center justify-center gap-2 border border-ink bg-ink px-4 font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-surface transition hover:bg-accentDark lg:inline-flex"
          >
            <LogIn size={14} aria-hidden="true" />
            <StableLocalizedText reserve={alternateCopy.signIn}>
              {copy.signIn}
            </StableLocalizedText>
          </Link>

          <button
            ref={mobileTriggerRef}
            type="button"
            aria-controls="public-mobile-menu"
            aria-expanded={isMobileOpen}
            aria-label={isMobileOpen ? copy.menuClose : copy.menuOpen}
            onClick={() => {
              setIsSurveyOpen(false)
              setIsMobileOpen((current) => !current)
            }}
            className="grid h-9 w-9 place-items-center border border-[var(--line-strong)] bg-[var(--nav-surface)] text-ink transition hover:bg-[var(--surface-hover)] hover:text-accentDark lg:hidden"
          >
            {isMobileOpen ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="public-mobile-menu"
        hidden={!isMobileOpen}
        className="absolute inset-x-0 top-full border-b border-[var(--line-strong)] bg-surface px-5 pb-5 pt-2 shadow-[0_14px_24px_color-mix(in_srgb,var(--ink)_10%,transparent)] sm:px-6 lg:hidden"
      >
        <nav aria-label={copy.mobileNavLabel} className="mx-auto max-w-7xl">
          <div className="grid grid-cols-3 border border-[var(--line-strong)] font-mono text-[9px] font-bold uppercase tracking-[0.05em] sm:text-[10px] sm:tracking-[0.07em]">
            <Link
              href={`/${locale}/surveys`}
              onClick={() => setIsMobileOpen(false)}
              className="flex min-w-0 items-center justify-center border-r border-[var(--line-strong)] px-2 py-3.5 text-center sm:px-4"
            >
              {copy.surveys}
            </Link>
            <Link
              href={`/${locale}#stats`}
              onClick={() => setIsMobileOpen(false)}
              className="flex min-w-0 items-center justify-center border-r border-[var(--line-strong)] px-2 py-3.5 text-center sm:px-4"
            >
              {copy.community}
            </Link>
            <Link
              href={`/${locale}#how-it-works`}
              onClick={() => setIsMobileOpen(false)}
              className="flex min-w-0 items-center justify-center px-2 py-3.5 text-center sm:px-4"
            >
              {copy.howItWorks}
            </Link>
          </div>

          <p className="mt-5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-accentDark">
            {copy.surveyTypes}
          </p>
          <div className="mt-2 divide-y divide-[var(--line)] border-y border-[var(--line-strong)]">
            {surveyLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className="block py-3.5"
              >
                <span className="block text-sm font-semibold text-ink">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-muted">{item.description}</span>
              </Link>
            ))}
          </div>

          <Link
            href={`/${locale}/login`}
            onClick={() => setIsMobileOpen(false)}
            className="mt-5 flex h-11 items-center justify-center gap-2 bg-ink px-4 font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-surface"
          >
            <LogIn size={14} aria-hidden="true" />
            {copy.signIn}
          </Link>
        </nav>
      </div>
    </header>
  )
}
