import Link from 'next/link'

export default function LanguageSwitcher({
  locale,
  path = '',
  label,
  embedded = false,
}) {
  const nextLocale = locale === 'tr' ? 'en' : 'tr'

  return (
    <Link
      href={`/${nextLocale}${path}`}
      lang={nextLocale}
      hrefLang={nextLocale}
      aria-label={`${label}: ${nextLocale.toUpperCase()}`}
      title={`${label}: ${nextLocale.toUpperCase()}`}
      scroll={false}
      className={`brand-control inline-flex h-9 min-w-12 items-center justify-center px-3 font-mono text-xs font-bold uppercase tracking-[0.1em] text-ink transition ${
        embedded
          ? 'bg-transparent'
          : 'border border-[var(--line-strong)] bg-[var(--nav-surface)]'
      }`}
    >
      {locale.toUpperCase()}
    </Link>
  )
}
