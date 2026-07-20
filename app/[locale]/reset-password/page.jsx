import { notFound, redirect } from 'next/navigation'
import { KeyRound } from 'lucide-react'

import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { getMessages, isSupportedLocale } from '@/data/i18n'
import { getLoginPath } from '@/lib/auth/navigation'
import { resolveActiveAccount } from '@/lib/server/auth/session'

export async function generateMetadata({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) return {}

  return getMessages(locale).metadata.login
}

export default async function ResetPasswordPage({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) notFound()

  const account = await resolveActiveAccount()

  if (!account) redirect(getLoginPath(locale, { status: 'sessionRequired' }))

  const copy = getMessages(locale).resetPassword

  return (
    <main className="landing-grid flex min-h-screen items-center justify-center px-5 py-16 text-ink sm:px-6">
      <section className="w-full max-w-xl border border-line bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
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
        <ResetPasswordForm copy={copy} locale={locale} />
      </section>
    </main>
  )
}
