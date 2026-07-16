'use client'

import { useEffect } from 'react'

const ENTER_MS = 135
const EXIT_MS = 90
const HOLD_MS = 2600
const LOOP_MS = 900

export default function TabTitleTicker({ baseTitle, suffix }) {
  useEffect(() => {
    const text = suffix?.trim()

    if (!baseTitle || !text) return undefined

    const characters = Array.from(text)
    const withSuffix = (value) => (
      value
        ? `${baseTitle} — ${value}`
        : baseTitle
    )
    const frames = [
      ...characters.map((_, index) => ({
        title: withSuffix(characters.slice(0, index + 1).join('')),
        delay: index === characters.length - 1 ? HOLD_MS : ENTER_MS,
      })),
      ...characters.map((_, index) => {
        const remaining = characters.slice(index + 1).join('')

        return {
          title: withSuffix(remaining),
          delay: remaining ? EXIT_MS : LOOP_MS,
        }
      }),
    ]
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const initialTitle = document.title

    let frameIndex = 0
    let ownedTitle
    let timerId

    function write(title) {
      document.title = title
      ownedTitle = title
    }

    function stop() {
      window.clearTimeout(timerId)
      timerId = undefined
    }

    function advance() {
      const frame = frames[frameIndex]

      write(frame.title)
      frameIndex = (frameIndex + 1) % frames.length
      timerId = window.setTimeout(advance, frame.delay)
    }

    function reset() {
      stop()
      frameIndex = 0

      if (document.hidden) {
        write(baseTitle)
        return
      }

      if (motionQuery.matches) {
        write(withSuffix(text))
        return
      }

      write(baseTitle)
      timerId = window.setTimeout(advance, LOOP_MS)
    }

    document.addEventListener('visibilitychange', reset)
    motionQuery.addEventListener('change', reset)
    reset()

    return () => {
      stop()
      document.removeEventListener('visibilitychange', reset)
      motionQuery.removeEventListener('change', reset)

      if (document.title === ownedTitle) document.title = initialTitle
    }
  }, [baseTitle, suffix])

  return null
}
