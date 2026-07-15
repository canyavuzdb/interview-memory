import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import BinaryMaidenTower from './BinaryMaidenTower'

export default function SiteFooter({ copy, locale }) {
  const productLinks = [
    { href: `/${locale}/surveys`, label: copy.surveys },
    { href: `/${locale}#stats`, label: copy.signals },
    { href: `/${locale}/login`, label: copy.signIn },
  ]

  return (
    <footer
      id="site-footer"
      className="mx-auto max-w-7xl px-5 pb-16 pt-24 text-[var(--brand-cream)] sm:px-6 sm:pb-8 sm:pt-28 md:pt-32 lg:px-8"
    >
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-sage)]">
        {copy.eyebrow}
      </p>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_0.65fr_0.75fr_minmax(18rem,1fr)] lg:gap-10">
        <div>
          <Link href={`/${locale}`} className="inline-flex items-center gap-4" aria-label={copy.homeAria}>
            <span className="grid h-16 w-16 place-items-center border border-[var(--brand-dark-line)] font-mono text-sm font-bold tracking-[-0.08em]">
              IM
            </span>
            <span className="block font-mono text-sm font-bold uppercase tracking-[0.1em]">
              Interview Memory
            </span>
          </Link>
          <p className="mt-6 max-w-md text-sm leading-7 text-[var(--brand-dark-muted)]">
            {copy.description}
          </p>
        </div>

        <nav aria-label={copy.productTitle}>
          <h2 className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--brand-sage)]">
            {copy.productTitle}
          </h2>
          <ul className="mt-5 space-y-3">
            {productLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--brand-cream)] transition-colors hover:text-[var(--brand-sage)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={copy.projectTitle}>
          <h2 className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--brand-sage)]">
            {copy.projectTitle}
          </h2>
          <ul className="mt-5 space-y-3">
            <li>
              <a
                href="https://github.com/canyavuzdb/interview-memory/tree/master"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] transition-colors hover:text-[var(--brand-sage)]"
              >
                {copy.repository}
                <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/canyavuzdb"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] transition-colors hover:text-[var(--brand-sage)]"
              >
                {copy.creator}
                <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--brand-sage)]">
            {copy.plannedTitle}
          </h2>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3" aria-label={copy.plannedNote}>
            {copy.planned.map((item) => (
              <li key={item} className="font-mono text-[9px] font-bold uppercase leading-5 tracking-[0.07em] text-[var(--brand-dark-muted)]">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-xs font-mono text-[8px] uppercase leading-4 tracking-[0.07em] text-[var(--brand-dark-muted)]">
            {copy.plannedNote}
          </p>
        </div>
      </div>

      <div className="mt-14 flex flex-col gap-3 border-t border-[var(--brand-dark-line)] pt-6 font-mono text-[8px] font-bold uppercase tracking-[0.09em] text-[var(--brand-dark-muted)] sm:flex-row sm:items-center sm:justify-between sm:pl-24">
        <p>© {new Date().getFullYear()} {copy.copyright}</p>
        <p>{copy.sourceNote}</p>
      </div>

      <div className="footer-binary-maiden" aria-hidden="true">
        <BinaryMaidenTower />
      </div>
    </footer>
  )
}
