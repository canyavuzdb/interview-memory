import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, LogOut } from 'lucide-react'

import { signOutAction } from '@/app/[locale]/(member)/account/actions'
import AccountSessionNotice from '@/components/auth/AccountSessionNotice'
import PersonalBenchmarkPanel from '@/components/PersonalBenchmarkPanel'
import PublicHeader from '@/components/PublicHeader'
import { getMessages, isSupportedLocale } from '@/data/i18n'
import { createDefaultPersonalBenchmarkService } from '@/lib/server/personal-benchmark/service'
import { resolveActiveAccount } from '@/lib/server/auth/session'

export async function generateMetadata({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) return {}

  return getMessages(locale).metadata.login
}

export default async function AccountPage({ params, searchParams }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) notFound()

  const messages = getMessages(locale)
  const alternateMessages = getMessages(locale === 'tr' ? 'en' : 'tr')
  const copy = messages.account
  const query = await searchParams
  const didJustSignIn = query?.status === 'signedIn'
  const account = await resolveActiveAccount()
  const personalReport = account
    ? await createDefaultPersonalBenchmarkService().getReport(account.userId)
    : null

  return (
    <main className="landing-grid min-h-screen text-ink">
      <PublicHeader
        alternateCopy={alternateMessages.header}
        common={messages.common}
        copy={messages.header}
        locale={locale}
        path="/account"
      />

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

          <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line pt-4">
            <Link
              href={`/${locale}`}
              className="group inline-flex min-h-10 items-center gap-3 border-b border-ink font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-ink transition hover:border-accentDark hover:text-accentDark"
            >
              {copy.startCta}
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-muted transition hover:text-accentDark"
              >
                <LogOut size={16} />
                {copy.signOut}
              </button>
            </form>
          </div>
        </div>
      </section>
      {personalReport && (
        <PersonalBenchmarkPanel copy={copy.personalReport} report={personalReport} />
      )}
    </main>
  )
}
