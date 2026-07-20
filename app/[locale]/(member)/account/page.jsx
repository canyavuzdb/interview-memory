import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Check, LogOut } from 'lucide-react'

import { signOutAction } from '@/app/[locale]/(member)/account/actions'
import AccountSessionNotice from '@/components/auth/AccountSessionNotice'
import PreferenceControls from '@/components/PreferenceControls'
import { getMessages, isSupportedLocale } from '@/data/i18n'

export async function generateMetadata({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) return {}

  return getMessages(locale).metadata.login
}

export default async function AccountPage({ params, searchParams }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) notFound()

  const messages = getMessages(locale)
  const copy = messages.account
  const query = await searchParams
  const didJustSignIn = query?.status === 'signedIn'

  return (
    <main className="landing-grid min-h-screen text-ink">
      <header className="border-b border-[var(--line-strong)] bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6 lg:px-8">
          <Link href={`/${locale}`} className="text-sm font-semibold text-ink">
            Interview Memory
          </Link>
          <PreferenceControls
            locale={locale}
            path="/account"
            languageLabel={messages.common.languageLabel}
            themeLabel={messages.common.themeToggle}
            themeTitle={messages.common.themeTitle}
          />
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-5xl gap-10 px-5 py-16 sm:px-6 md:py-24 lg:grid-cols-[1fr_0.8fr] lg:px-8">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-accent">
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted">
            {copy.description}
          </p>
        </div>

        <div className="border border-line bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <AccountSessionNotice
            copy={copy.signedInNotice}
            visible={didJustSignIn}
          />
          <div className="flex items-center gap-3 border-b border-line pb-5">
            <span className="grid h-9 w-9 place-items-center border border-accent/30 bg-accent/5 text-accent">
              <Check size={17} />
            </span>
            <div>
              <p className="text-xs text-muted">{copy.statusLabel}</p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {copy.statusValue}
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-muted">
            {copy.foundationNote}
          </p>

          <form action={signOutAction} className="mt-7">
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition hover:text-accentDark"
            >
              <LogOut size={16} />
              {copy.signOut}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
