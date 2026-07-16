'use client'

import { useLayoutEffect } from 'react'

const PINNED_STORY_MEDIA_QUERY = '(min-width: 1024px) and (min-height: 620px)'
const CHAPTER_TRANSITION_MEDIA_QUERY = '(prefers-reduced-motion: no-preference)'
const CHAPTER_EXIT_MIN_DISTANCE = 420
const CHAPTER_EXIT_MAX_DISTANCE = 480
const CHAPTER_EXIT_VIEWPORT_RATIO = 0.44
const CHAPTER_EXIT_PROPERTY = '--chapter-exit-progress'
const PINNED_STORY_CLASS = 'landing-story-is-pinned'
const CHAPTER_TRANSITION_CLASS = 'landing-story-has-transitions'
const LOCATION_CHANGE_EVENT = 'interview-memory:location-change'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function smoothstep(progress) {
  return progress * progress * (3 - 2 * progress)
}

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

export default function LandingStory({ children, locale }) {
  useLayoutEffect(() => {
    let cancelled = false
    let alignedScrollY = null
    let pinnedStoryFrame = null
    const scheduledFrames = new Set()
    const flow = document.querySelector('.landing-puzzle-flow')
    const header = document.querySelector('header')
    const story = flow?.querySelector('.landing-story')
    const footer = flow?.querySelector('.landing-footer-zone')
    const storyLayers = Array.from(story?.children ?? [])
    const storyChapters = storyLayers.filter((layer) => (
      layer.classList.contains('landing-story-chapter')
    ))
    const pinnedStoryMedia = window.matchMedia(PINNED_STORY_MEDIA_QUERY)
    const chapterTransitionMedia = window.matchMedia(CHAPTER_TRANSITION_MEDIA_QUERY)
    let previousViewportWidth = window.innerWidth

    function updateHeaderHeight() {
      const headerHeight = header?.getBoundingClientRect().height ?? 0

      if (flow && headerHeight > 0) {
        flow.style.setProperty('--landing-header-height', `${headerHeight}px`)
      }

      return headerHeight
    }

    function getPuzzleDepth(element) {
      return Number.parseFloat(
        window.getComputedStyle(element).getPropertyValue('--landing-puzzle-depth'),
      ) || 0
    }

    function setChapterExitProgress(chapter, progress) {
      const value = progress <= 0.001 ? '' : progress.toFixed(3)

      if (chapter.style.getPropertyValue(CHAPTER_EXIT_PROPERTY) === value) return

      if (value) {
        chapter.style.setProperty(CHAPTER_EXIT_PROPERTY, value)
      } else {
        chapter.style.removeProperty(CHAPTER_EXIT_PROPERTY)
      }
    }

    function resetChapterExitProgress() {
      storyChapters.forEach((chapter) => {
        chapter.style.removeProperty(CHAPTER_EXIT_PROPERTY)
      })
    }

    function updateChapterExitProgress(stickyTop) {
      const bounds = storyLayers.map((layer) => layer.getBoundingClientRect())
      const availableHeight = Math.max(1, window.innerHeight - stickyTop)
      const desiredDistance = clamp(
        availableHeight * CHAPTER_EXIT_VIEWPORT_RATIO,
        CHAPTER_EXIT_MIN_DISTANCE,
        CHAPTER_EXIT_MAX_DISTANCE,
      )

      storyLayers.forEach((layer, index) => {
        if (!layer.classList.contains('landing-story-chapter')) return

        const chapterBounds = bounds[index]
        const nextBounds = bounds[index + 1]
        let progress = 0

        if (nextBounds && chapterBounds.top <= stickyTop + 1) {
          const remainingHeight = Math.max(0, nextBounds.top - stickyTop)
          const exitDistance = Math.max(1, Math.min(desiredDistance, chapterBounds.height))
          const linearProgress = clamp(1 - remainingHeight / exitDistance, 0, 1)

          progress = smoothstep(linearProgress)
        }

        setChapterExitProgress(layer, progress)
      })
    }

    function updatePinnedStoryState() {
      if (!flow || !footer) return

      const headerHeight = updateHeaderHeight()
      const puzzleDepth = getPuzzleDepth(flow)
      const stickyTop = headerHeight + puzzleDepth
      const availableHeight = Math.max(1, window.innerHeight - stickyTop)
      const chaptersFitViewport = storyChapters.every((chapter) => (
        chapter.getBoundingClientRect().height <= availableHeight + 1
      ))
      const isPinnedStory = pinnedStoryMedia.matches && chaptersFitViewport
      const hasChapterTransitions = isPinnedStory && chapterTransitionMedia.matches

      flow.classList.toggle(PINNED_STORY_CLASS, isPinnedStory)
      flow.classList.toggle(CHAPTER_TRANSITION_CLASS, hasChapterTransitions)

      if (hasChapterTransitions) {
        updateChapterExitProgress(stickyTop)
      } else {
        resetChapterExitProgress()
      }

      const footerBounds = footer.getBoundingClientRect()
      const reachesHeader = footerBounds.top <= headerHeight && footerBounds.bottom > 0

      flow.classList.toggle('landing-footer-at-header', reachesHeader)
    }

    function queuePinnedStoryUpdate() {
      if (pinnedStoryFrame !== null) return

      pinnedStoryFrame = window.requestAnimationFrame(() => {
        pinnedStoryFrame = null
        updatePinnedStoryState()
      })
    }

    function handlePinnedStoryMediaChange() {
      queuePinnedStoryUpdate()
    }

    function handleWindowResize() {
      const widthChanged = Math.abs(window.innerWidth - previousViewportWidth) > 1

      previousViewportWidth = window.innerWidth
      queuePinnedStoryUpdate()

      if (widthChanged && window.location.hash) {
        queueAlignment(window.location.hash)
      }
    }

    function handleFontLoadingDone() {
      queuePinnedStoryUpdate()
    }

    function scrollToPosition(top, behavior = 'auto') {
      const root = document.documentElement
      const previousBehavior = root.style.scrollBehavior
      const shouldAnimate = behavior === 'smooth'
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (shouldAnimate) {
        window.scrollTo({ top, behavior: 'smooth' })
      } else {
        root.style.scrollBehavior = 'auto'
        window.scrollTo(0, top)
        root.style.scrollBehavior = previousBehavior
      }

      return shouldAnimate
    }

    function updateBrowserLocation(nextLocation, replace = false) {
      if (replace) {
        window.history.replaceState(window.history.state, '', nextLocation)
      } else {
        window.history.pushState(window.history.state, '', nextLocation)
      }

      window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT))
    }

    function alignChapter(hash = window.location.hash, behavior = 'auto') {
      if (cancelled || !hash) return

      const target = document.getElementById(hash.slice(1))
      const targetFlow = target?.closest('.landing-puzzle-flow')
      const targetStory = target?.closest('.landing-story')

      if (!target?.classList.contains('landing-story-chapter') || !targetFlow || !targetStory) return

      const headerHeight = updateHeaderHeight()
      const puzzleDepth = getPuzzleDepth(targetFlow)
      const storyChildren = Array.from(targetStory.children)
      const targetIndex = storyChildren.indexOf(target)

      if (targetIndex < 0) return

      const storyTop = window.scrollY + targetStory.getBoundingClientRect().top
      const chapterOffset = storyChildren
        .slice(0, targetIndex)
        .reduce((offset, element) => offset + element.offsetHeight, 0)
      const targetTop = storyTop + chapterOffset
      const destination = targetTop - headerHeight - puzzleDepth
      const shouldAnimate = scrollToPosition(Math.max(0, destination), behavior)

      alignedScrollY = shouldAnimate ? null : window.scrollY
    }

    function queueAlignment(hash, behavior = 'auto') {
      scheduledFrames.forEach((scheduledFrame) => window.cancelAnimationFrame(scheduledFrame))
      scheduledFrames.clear()

      const frame = window.requestAnimationFrame(() => {
        scheduledFrames.delete(frame)
        alignChapter(hash, behavior)
      })

      scheduledFrames.add(frame)
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
      const isSamePage = url.origin === window.location.origin
        && url.pathname === window.location.pathname
      const target = url.hash ? document.getElementById(url.hash.slice(1)) : null

      if (isSamePage && !url.hash) {
        event.preventDefault()

        const nextLocation = `${url.pathname}${url.search}`

        const shouldReplace = !window.location.hash && window.location.search === url.search

        updateBrowserLocation(nextLocation, shouldReplace)

        alignedScrollY = scrollToPosition(0, 'smooth') ? null : window.scrollY
        return
      }

      if (
        isSamePage
        && target?.classList.contains('landing-story-chapter')
      ) {
        event.preventDefault()

        const nextLocation = `${url.pathname}${url.search}${url.hash}`

        updateBrowserLocation(nextLocation, window.location.hash === url.hash)

        queueAlignment(url.hash, 'smooth')
      }
    }

    updatePinnedStoryState()
    alignChapter()

    const frame = window.requestAnimationFrame(() => {
      if (alignedScrollY === null || Math.abs(window.scrollY - alignedScrollY) <= 2) {
        alignChapter()
      }
    })

    const resizeObserver = typeof ResizeObserver === 'function'
      ? new ResizeObserver(queuePinnedStoryUpdate)
      : null

    ;[header, story, footer, ...storyLayers].forEach((element) => {
      if (element) resizeObserver?.observe(element)
    })

    window.addEventListener('hashchange', handleHashNavigation)
    window.addEventListener('popstate', handleHashNavigation)
    window.addEventListener('resize', handleWindowResize)
    window.addEventListener('scroll', queuePinnedStoryUpdate, { passive: true })
    window.visualViewport?.addEventListener('resize', queuePinnedStoryUpdate)
    pinnedStoryMedia.addEventListener('change', handlePinnedStoryMediaChange)
    chapterTransitionMedia.addEventListener('change', handlePinnedStoryMediaChange)
    document.fonts?.addEventListener?.('loadingdone', handleFontLoadingDone)
    document.addEventListener('click', handleAnchorClick, true)

    document.fonts?.ready.then(() => {
      if (cancelled) return

      queuePinnedStoryUpdate()
      if (alignedScrollY === null || Math.abs(window.scrollY - alignedScrollY) > 2) return
      alignChapter()
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      if (pinnedStoryFrame !== null) window.cancelAnimationFrame(pinnedStoryFrame)
      scheduledFrames.forEach((scheduledFrame) => window.cancelAnimationFrame(scheduledFrame))

      flow?.classList.remove('landing-footer-at-header')
      flow?.classList.remove(PINNED_STORY_CLASS)
      flow?.classList.remove(CHAPTER_TRANSITION_CLASS)
      resetChapterExitProgress()
      resizeObserver?.disconnect()
      window.removeEventListener('hashchange', handleHashNavigation)
      window.removeEventListener('popstate', handleHashNavigation)
      window.removeEventListener('resize', handleWindowResize)
      window.removeEventListener('scroll', queuePinnedStoryUpdate)
      window.visualViewport?.removeEventListener('resize', queuePinnedStoryUpdate)
      pinnedStoryMedia.removeEventListener('change', handlePinnedStoryMediaChange)
      chapterTransitionMedia.removeEventListener('change', handlePinnedStoryMediaChange)
      document.fonts?.removeEventListener?.('loadingdone', handleFontLoadingDone)
      document.removeEventListener('click', handleAnchorClick, true)
    }
  }, [locale])

  return <div className="landing-story">{children}</div>
}
