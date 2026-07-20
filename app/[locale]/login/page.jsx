import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import LoginPreview from '@/components/LoginPreview'
import PreferenceControls from '@/components/PreferenceControls'
import { getMessages, isSupportedLocale } from '@/data/i18n'
import { resolveActiveAccount } from '@/lib/server/auth/session'

export async function generateMetadata({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) return {}

  return getMessages(locale).metadata.login
}

export default async function LoginPage({ params, searchParams }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) notFound()

  const account = await resolveActiveAccount()

  if (account) redirect(`/${locale}/account`)

  const messages = getMessages(locale)
  const copy = messages.login
  const query = await searchParams
  const next =
    typeof query?.next === 'string' ? query.next : `/${locale}/account`
  const initialStatus =
    typeof query?.status === 'string' ? query.status : null

  return (
    <main className="landing-grid min-h-screen text-ink">
      <header className="border-b border-[var(--line-strong)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
          >
            <ArrowLeft size={16} />
            {messages.common.backHome}
          </Link>

          <PreferenceControls
            locale={locale}
            path="/login"
            languageLabel={messages.common.languageLabel}
            themeLabel={messages.common.themeToggle}
            themeTitle={messages.common.themeTitle}
          />
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-10 px-5 py-16 sm:px-6 md:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
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

          <div className="mt-9 border-t border-line pt-7">
            <p className="text-sm font-semibold text-ink">
              {copy.benefitsEyebrow}
            </p>
            <div className="mt-4 space-y-3">
              {copy.benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 text-sm leading-6 text-muted">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center border border-[var(--line-strong)] bg-surface">
                    <Check size={13} />
                  </span>
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>

        <LoginPreview
          copy={copy}
          anonymousHref={`/${locale}#surveys`}
          locale={locale}
          next={next}
          initialStatus={initialStatus}
        />
      </section>
    </main>
  )
}
