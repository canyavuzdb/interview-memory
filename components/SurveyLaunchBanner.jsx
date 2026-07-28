'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useDashboardCycle } from './dashboard-cycle/DashboardCycleProvider'

export default function SurveyLaunchBanner({ copy, href }) {
  const dashboardCycle = useDashboardCycle()
  const activeIndex = dashboardCycle % copy.items.length
  const previousIndex = dashboardCycle > 0
    ? (dashboardCycle - 1) % copy.items.length
    : null
  const item = copy.items[activeIndex]

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
      <Link
        href={href}
        className="survey-launch-banner group relative grid overflow-hidden py-7 md:grid-cols-[11rem_minmax(0,1fr)_auto] md:items-center md:gap-10 lg:gap-14"
      >
        <span className="relative grid min-h-10 overflow-hidden font-mono text-[10px] font-bold uppercase leading-5 tracking-[0.12em] text-accent md:min-h-0">
          {copy.items.map((candidate) => (
            <span
              key={`eyebrow-measure-${candidate.eyebrow}`}
              aria-hidden="true"
              className="invisible col-start-1 row-start-1 block"
            >
              {candidate.eyebrow}
            </span>
          ))}
          {previousIndex !== null && (
            <span
              aria-hidden="true"
              className="analytics-view-out absolute inset-0 block"
            >
              {copy.items[previousIndex].eyebrow}
            </span>
          )}
          <span key={`eyebrow-${activeIndex}-${dashboardCycle}`} className="analytics-view-in col-start-1 row-start-1 block">
            {item.eyebrow}
          </span>
        </span>

        <span className="relative mt-3 grid min-h-[5.25rem] overflow-hidden md:mt-0">
          {copy.items.map((candidate) => (
            <span
              key={`content-measure-${candidate.eyebrow}`}
              aria-hidden="true"
              className="invisible col-start-1 row-start-1 block"
            >
              <span className="block text-lg font-semibold tracking-[-0.025em] text-ink">
                {candidate.title}
              </span>
              <span className="mt-2.5 block max-w-3xl text-sm leading-6 text-muted">
                {candidate.description}
              </span>
            </span>
          ))}
          {previousIndex !== null && (
            <span aria-hidden="true" className="analytics-view-out absolute inset-0 block">
              <span className="block text-lg font-semibold tracking-[-0.025em] text-ink">
                {copy.items[previousIndex].title}
              </span>
              <span className="mt-2.5 block max-w-3xl text-sm leading-6 text-muted">
                {copy.items[previousIndex].description}
              </span>
            </span>
          )}
          <span
            key={`content-${activeIndex}-${dashboardCycle}`}
            aria-live="polite"
            className="analytics-view-in col-start-1 row-start-1 block"
          >
            <span className="block text-lg font-semibold tracking-[-0.025em] text-ink">
              {item.title}
            </span>
            <span className="mt-2.5 block max-w-3xl text-sm leading-6 text-muted">
              {item.description}
            </span>
          </span>
        </span>

        <span className="mt-5 flex flex-col items-start gap-2.5 md:mt-0 md:items-end">
          <span className="inline-flex items-center gap-3 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-ink transition-colors duration-300 group-hover:text-accentDark">
            {copy.cta}
            <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </span>
          <span className="whitespace-nowrap font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted">
            {copy.meta}
          </span>
          <span
            aria-hidden="true"
            className="relative mt-0.5 block h-px w-24 overflow-hidden bg-[var(--line-strong)]"
          >
            <span
              key={`progress-${activeIndex}-${dashboardCycle}`}
              className="survey-launch-progress absolute inset-y-0 left-0 w-full bg-accent"
            />
          </span>
        </span>
      </Link>
    </section>
  )
}
