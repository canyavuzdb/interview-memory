'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

const LOCATION_CHANGE_EVENT = 'interview-memory:location-change'

function ReportTabs({
  activeId,
  activeIndex,
  ariaLabel,
  context,
  items,
  onActivate,
  variant,
}) {
  const compact = variant === 'compact'

  function handleKeyDown(event, index) {
    let nextIndex

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % items.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + items.length) % items.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = items.length - 1
    } else {
      return
    }

    event.preventDefault()
    onActivate(items[nextIndex].id)

    const tabList = event.currentTarget.closest('[role="tablist"]')
    const tabs = tabList?.querySelectorAll('[role="tab"]')
    window.requestAnimationFrame(() => tabs?.[nextIndex]?.focus())
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={compact ? 'horizontal' : 'vertical'}
      className={
        compact
          ? 'benchmark-report-tabs benchmark-report-tabs--compact relative grid grid-cols-3'
          : 'benchmark-report-tabs benchmark-report-tabs--rail relative w-full'
      }
      style={{
        '--benchmark-active-index': activeIndex,
        '--benchmark-report-count': items.length,
      }}
    >
      {compact && (
        <span
          aria-hidden="true"
          className="benchmark-report-tab-indicator benchmark-report-tab-indicator--compact"
        />
      )}

      {items.map((item, index) => {
        const active = activeId === item.id

        return (
          <button
            key={item.id}
            id={`benchmark-report-${context}-tab-${item.id}`}
            type="button"
            role="tab"
            tabIndex={active ? 0 : -1}
            aria-controls={`benchmark-report-panel-${item.id}`}
            aria-selected={active}
            onClick={() => onActivate(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={
              compact
                ? `relative z-10 flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 px-2 text-center transition-colors duration-300 ${
                  active
                    ? 'text-ink'
                    : 'text-muted hover:text-ink'
                }`
                : `group relative z-10 grid h-16 w-full grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2 px-3 text-left transition-colors duration-300 ${
                  active
                    ? 'text-ink'
                    : 'text-muted hover:text-ink'
                }`
            }
          >
            <span
              className={`font-mono font-bold ${
                compact
                  ? 'text-[7px] tracking-[0.08em] opacity-60'
                  : 'text-[8px] tracking-[0.08em] text-accentDark'
              }`}
            >
              {item.code}
            </span>
            <span
              className={
                compact
                  ? 'max-w-full truncate text-[10px] font-semibold leading-4'
                  : `text-[12px] leading-4 tracking-[-0.01em] ${
                    active ? 'font-bold' : 'font-semibold'
                  }`
              }
            >
              {compact ? item.shortLabel : item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function BenchmarkReportSwitcher({
  children,
  copy,
  items,
  locale,
}) {
  const panels = Children.toArray(children)
  const defaultId = items[0]?.id
  const [activeId, setActiveId] = useState(defaultId)
  const [direction, setDirection] = useState('forward')
  const [previousId, setPreviousId] = useState(null)
  const activeIdRef = useRef(defaultId)
  const previousIdRef = useRef(null)
  const stageRef = useRef(null)
  const itemIds = items.map((item) => item.id).join('|')
  const activeIndex = Math.max(items.findIndex((item) => item.id === activeId), 0)

  const activateReport = useCallback((nextId, {
    scrollStage = true,
    updateUrl = true,
  } = {}) => {
    const ids = itemIds.split('|').filter(Boolean)
    if (!ids.includes(nextId) || activeIdRef.current === nextId) return

    const currentId = activeIdRef.current
    const currentIndex = ids.indexOf(currentId)
    const nextIndex = ids.indexOf(nextId)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    setDirection(nextIndex >= currentIndex ? 'forward' : 'backward')
    previousIdRef.current = reduceMotion ? null : currentId
    setPreviousId(reduceMotion ? null : currentId)
    activeIdRef.current = nextId
    setActiveId(nextId)

    if (updateUrl) {
      window.history.replaceState(window.history.state, '', `#${nextId}`)
      window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT))
    }

    if (!scrollStage) return

    window.requestAnimationFrame(() => {
      const stage = stageRef.current
      if (!stage) return

      const { top } = stage.getBoundingClientRect()
      const stageOutsideReadingArea = top < 72 || top > window.innerHeight - 120
      if (!stageOutsideReadingArea) return

      stage.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
    })
  }, [itemIds])

  useEffect(() => {
    function syncFromHash({ scrollStage = false } = {}) {
      const nextId = window.location.hash.slice(1)
      activateReport(nextId, { scrollStage, updateUrl: false })
    }

    const initialFrame = window.requestAnimationFrame(() => {
      syncFromHash({ scrollStage: true })
    })

    function handleHashChange() {
      syncFromHash()
    }

    function handlePageShow() {
      syncFromHash()
    }

    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('pageshow', handlePageShow)

    return () => {
      window.cancelAnimationFrame(initialFrame)
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [activateReport])

  function handleActivate(nextId) {
    activateReport(nextId)
  }

  function completeTransition(panelId, event) {
    if (event.target !== event.currentTarget || previousIdRef.current !== panelId) return

    previousIdRef.current = null
    setPreviousId(null)
  }

  return (
    <div
      ref={stageRef}
      id="benchmark-report-stage"
      className="mt-10 scroll-mt-24 xl:grid xl:grid-cols-[12.75rem_minmax(0,1fr)] xl:items-start xl:gap-9 2xl:grid-cols-[13.5rem_minmax(0,1fr)] 2xl:gap-12"
    >
      <div className="sticky top-[61px] z-20 -mx-2 mb-8 border-b border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--canvas)_92%,transparent)] px-2 pb-2 pt-3 backdrop-blur-xl xl:hidden">
        <div className="mb-2 flex items-center justify-between gap-4 px-1">
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-accentDark">
            {copy.eyebrow}
          </p>
          <p className="font-mono text-[8px] font-bold tracking-[0.08em] text-muted" aria-live="polite">
            {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </p>
        </div>
        <div className="overflow-hidden border-y border-line bg-surface">
          <ReportTabs
            activeId={activeId}
            activeIndex={activeIndex}
            ariaLabel={copy.ariaLabel}
            context="compact"
            items={items}
            onActivate={handleActivate}
            variant="compact"
          />
        </div>
      </div>

      <aside className="relative hidden self-start pl-5 xl:sticky xl:top-24 xl:block">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-px bg-[var(--line-strong)]"
        />

        <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-accentDark">
            {copy.eyebrow}
          </p>
          <p className="font-mono text-[8px] font-bold tracking-[0.08em] text-muted" aria-live="polite">
            {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </p>
        </div>

        <div className="py-3">
          <ReportTabs
            activeId={activeId}
            activeIndex={activeIndex}
            ariaLabel={copy.ariaLabel}
            context="rail"
            items={items}
            onActivate={handleActivate}
            variant="rail"
          />
        </div>

        <Link
          href={`/${locale}/surveys`}
          className="group flex items-start justify-between gap-3 border-t border-line py-4 text-ink transition-colors hover:text-accentDark"
        >
          <span>
            <span className="block font-mono text-[7px] font-bold uppercase tracking-[0.1em] text-muted">
              {copy.contributionEyebrow}
            </span>
            <span className="mt-1.5 block text-[11px] font-semibold leading-4">
              {copy.contributionCta}
            </span>
          </span>
          <ArrowUpRight
            size={14}
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          />
        </Link>
      </aside>

      <div className="benchmark-report-stack min-w-0">
        {items.map((item, index) => {
          const active = item.id === activeId
          const outgoing = item.id === previousId

          return (
            <div
              key={item.id}
              id={`benchmark-report-panel-${item.id}`}
              role="tabpanel"
              aria-label={item.label}
              aria-hidden={!active || undefined}
              inert={!active || undefined}
              onAnimationEnd={outgoing ? (event) => completeTransition(item.id, event) : undefined}
              className={`benchmark-report-view ${
                active
                  ? 'benchmark-report-view-in'
                  : outgoing
                    ? 'benchmark-report-view-out'
                    : 'benchmark-report-view-parked'
              }`}
              style={{
                '--benchmark-report-enter-x': direction === 'forward' ? '18px' : '-18px',
                '--benchmark-report-exit-x': direction === 'forward' ? '-18px' : '18px',
              }}
            >
              {panels[index]}
            </div>
          )
        })}
      </div>
    </div>
  )
}
