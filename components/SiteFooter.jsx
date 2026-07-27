import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import BinaryMaidenTower from './BinaryMaidenTower'
import BrandMark from './brand/BrandMark'
import CookieSettingsButton from './CookieSettingsButton'
import SessionAccessLink from './auth/SessionAccessLink'

function GitHubMark(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .297C5.37.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.26.82-.578 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.37.81 1.1.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297 24 5.67 18.627.297 12 .297Z" />
    </svg>
  )
}

export default function SiteFooter({ copy, locale }) {
  const productLinks = [
    { href: `/${locale}/surveys`, label: copy.surveys },
    { href: `/${locale}#stats`, label: copy.signals },
  ]

  return (
    <footer
      id="site-footer"
      className="mx-auto max-w-7xl px-5 pb-16 pt-24 text-[var(--brand-cream)] sm:px-6 sm:pb-8 sm:pt-28 md:pt-32 lg:px-8"
    >
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-sage)]">
        {copy.eyebrow}
      </p>

      <div className="mt-8 grid gap-12 md:grid-cols-2 lg:gap-10 xl:grid-cols-[minmax(0,1.25fr)_0.65fr_0.75fr_minmax(18rem,1fr)]">
        <div>
          <Link href={`/${locale}`} className="inline-flex items-center gap-4" aria-label={copy.homeAria}>
            <BrandMark
              accent="var(--brand-sage)"
              className="h-16 w-16 text-[var(--brand-cream)]"
            />
            <span className="block font-mono text-sm font-bold uppercase tracking-[0.1em]">
              Interview <span className="text-[var(--brand-sage)]">Memory</span>
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
            <li>
              <SessionAccessLink
                accountLabel={copy.profile}
                locale={locale}
                signInLabel={copy.signIn}
                variant="footer"
              />
            </li>
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
                aria-label={copy.githubCta}
                className="github-cube-button"
              >
                <span className="github-cube-icon" aria-hidden="true">
                  <GitHubMark className="h-4 w-4" />
                </span>
                <span className="github-cube-stage" aria-hidden="true">
                  <span className="github-cube-face github-cube-front">{copy.repository}</span>
                  <span className="github-cube-face github-cube-top">{copy.githubCta}</span>
                </span>
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/mcy96/"
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

        <nav aria-label={copy.resourcesTitle}>
          <h2 className="font-mono text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--brand-sage)]">
            {copy.resourcesTitle}
          </h2>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
            {copy.resources.map((item) => (
              <li key={item.href}>
                <Link
                  href={`/${locale}/${item.href}`}
                  className="font-mono text-[9px] font-bold uppercase leading-5 tracking-[0.07em] text-[var(--brand-cream)] transition-colors hover:text-[var(--brand-sage)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <CookieSettingsButton>{copy.cookieSettings}</CookieSettingsButton>
        </nav>
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
