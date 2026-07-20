import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, KeyRound } from 'lucide-react'

import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import PreferenceControls from '@/components/PreferenceControls'
import { getMessages, isSupportedLocale } from '@/data/i18n'

export async function generateMetadata({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) return {}

  return getMessages(locale).metadata.login
}

export default async function ForgotPasswordPage({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) notFound()

  const messages = getMessages(locale)
  const copy = messages.forgotPassword

  return (
    <main className="landing-grid min-h-screen text-ink">
      <header className="border-b border-[var(--line-strong)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
          >
            <ArrowLeft size={16} />
            {copy.back}
          </Link>
          <PreferenceControls
            locale={locale}
            path="/forgot-password"
            languageLabel={messages.common.languageLabel}
            themeLabel={messages.common.themeToggle}
            themeTitle={messages.common.themeTitle}
          />
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-xl flex-1 items-center px-5 py-16 sm:px-6">
        <div className="w-full border border-line bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <div className="grid h-11 w-11 place-items-center border border-[var(--line-strong)] bg-surfaceMuted">
            <KeyRound size={19} />
          </div>
          <p className="mt-6 font-mono text-xs font-bold uppercase tracking-[0.12em] text-accent">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
            {copy.title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            {copy.description}
          </p>
          <ForgotPasswordForm copy={copy} locale={locale} />
        </div>
      </section>
    </main>
  )
}
