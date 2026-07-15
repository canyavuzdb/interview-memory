'use client'

import { useLayoutEffect } from 'react'

export function LandingStoryChapter({ children, id, tone }) {
  return (
    <div
      id={id}
      className={`landing-story-chapter landing-story-chapter--${tone}`}
    >
      <div className={`landing-story-panel landing-story-panel--${tone}`}>
        {children}
      </div>
    </div>
  )
}

export default function LandingStory({ children }) {
  useLayoutEffect(() => {
    let cancelled = false
    let alignedScrollY = null
    let footerBoundaryFrame = null
    const scheduledFrames = new Set()
    const scheduledTimers = new Set()

    function updateHeaderHeight() {
      const flow = document.querySelector('.landing-puzzle-flow')
      const header = document.querySelector('header')
      const headerHeight = header?.getBoundingClientRect().height ?? 0

      if (flow && headerHeight > 0) {
        flow.style.setProperty('--landing-header-height', `${headerHeight}px`)
      }

      return headerHeight
    }

    function updateFooterBoundary() {
      const flow = document.querySelector('.landing-puzzle-flow')
      const footer = flow?.querySelector('.landing-footer-zone')

      if (!flow || !footer) return

      const headerHeight = updateHeaderHeight()
      const footerBounds = footer.getBoundingClientRect()
      const reachesHeader = footerBounds.top <= headerHeight && footerBounds.bottom > 0

      flow.classList.toggle('landing-footer-at-header', reachesHeader)
    }

    function queueFooterBoundaryUpdate() {
      if (footerBoundaryFrame !== null) return

      footerBoundaryFrame = window.requestAnimationFrame(() => {
        footerBoundaryFrame = null
        updateFooterBoundary()
      })
    }

    function alignChapter(hash = window.location.hash) {
      if (cancelled || !hash) return

      const target = document.getElementById(hash.slice(1))
      const flow = target?.closest('.landing-puzzle-flow')
      const story = target?.closest('.landing-story')

      if (!target?.classList.contains('landing-story-chapter') || !flow || !story) return

      const headerHeight = updateHeaderHeight()
      const puzzleDepth = Number.parseFloat(
        window.getComputedStyle(flow).getPropertyValue('--landing-puzzle-depth'),
      ) || 0
      const storyTop = window.scrollY + story.getBoundingClientRect().top
      const targetTop = storyTop + target.offsetTop
      const destination = targetTop - headerHeight - puzzleDepth
      const root = document.documentElement
      const previousBehavior = root.style.scrollBehavior

      root.style.scrollBehavior = 'auto'
      window.scrollTo(0, Math.max(0, destination))
      root.style.scrollBehavior = previousBehavior
      alignedScrollY = window.scrollY
    }

    function queueAlignment(hash) {
      scheduledFrames.forEach((scheduledFrame) => window.cancelAnimationFrame(scheduledFrame))
      scheduledTimers.forEach((timer) => window.clearTimeout(timer))
      scheduledFrames.clear()
      scheduledTimers.clear()

      const frame = window.requestAnimationFrame(() => {
        scheduledFrames.delete(frame)
        alignChapter(hash)
      })
      const timer = window.setTimeout(() => {
        scheduledTimers.delete(timer)
        alignChapter(hash)
      }, 80)

      scheduledFrames.add(frame)
      scheduledTimers.add(timer)
    }

    function handleHashNavigation() {
      queueAlignment(window.location.hash)
    }

    function handleAnchorClick(event) {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
      ) return

      const anchor = event.target.closest?.('a[href]')

      if (!anchor) return

      const url = new URL(anchor.href, window.location.href)
      const target = url.hash ? document.getElementById(url.hash.slice(1)) : null

      if (
        url.origin === window.location.origin
        && url.pathname === window.location.pathname
        && target?.classList.contains('landing-story-chapter')
      ) {
        queueAlignment(url.hash)
      }
    }

    updateHeaderHeight()
    updateFooterBoundary()
    alignChapter()

    const frame = window.requestAnimationFrame(() => {
      if (alignedScrollY === null || Math.abs(window.scrollY - alignedScrollY) <= 2) {
        alignChapter()
      }
    })

    window.addEventListener('hashchange', handleHashNavigation)
    window.addEventListener('popstate', handleHashNavigation)
    window.addEventListener('resize', queueFooterBoundaryUpdate)
    window.addEventListener('scroll', queueFooterBoundaryUpdate, { passive: true })
    document.addEventListener('click', handleAnchorClick, true)

    document.fonts?.ready.then(() => {
      if (alignedScrollY === null || Math.abs(window.scrollY - alignedScrollY) > 2) return
      alignChapter()
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      if (footerBoundaryFrame !== null) window.cancelAnimationFrame(footerBoundaryFrame)
      scheduledFrames.forEach((scheduledFrame) => window.cancelAnimationFrame(scheduledFrame))
      scheduledTimers.forEach((timer) => window.clearTimeout(timer))
      document.querySelector('.landing-puzzle-flow')?.classList.remove('landing-footer-at-header')
      window.removeEventListener('hashchange', handleHashNavigation)
      window.removeEventListener('popstate', handleHashNavigation)
      window.removeEventListener('resize', queueFooterBoundaryUpdate)
      window.removeEventListener('scroll', queueFooterBoundaryUpdate)
      document.removeEventListener('click', handleAnchorClick, true)
    }
  }, [])

  return <div className="landing-story">{children}</div>
}
