'use client'

export default function CookieSettingsButton({ children }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))}
      className="mt-3 inline-flex font-mono text-left text-[9px] font-bold uppercase leading-5 tracking-[0.07em] text-[var(--brand-dark-muted)] transition-colors hover:text-[var(--brand-cream)]"
    >
      {children}
    </button>
  )
}
