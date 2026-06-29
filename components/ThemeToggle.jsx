'use client'

import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle({ className = '' }) {
  function toggleTheme() {
    const currentTheme = document.documentElement.dataset.theme ?? 'light'
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'

    document.documentElement.dataset.theme = nextTheme
    window.localStorage.setItem('theme', nextTheme)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Açık ve koyu tema arasında geçiş yap"
      title="Temayı değiştir"
      className={`grid h-9 w-9 shrink-0 place-items-center border border-[var(--line-strong)] bg-[var(--nav-surface)] text-ink transition hover:bg-[var(--surface-hover)] ${className}`}
    >
      <Moon size={16} className="theme-icon-dark" />
      <Sun size={16} className="theme-icon-light hidden" />
    </button>
  )
}
