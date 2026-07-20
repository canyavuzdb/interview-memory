'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, LogIn, Mail } from 'lucide-react'

import { initialAuthActionState } from '@/lib/auth/action-state'
import {
  googleSignInAction,
  signInAction,
  signUpAction,
} from '@/app/[locale]/login/actions'

function Feedback({ copy, state }) {
  if (!state.code) return null

  return (
    <p
      role="status"
      className={`mt-4 border px-4 py-3 text-sm leading-6 ${
        state.status === 'success'
          ? 'border-accent/35 bg-accent/5 text-ink'
          : 'border-line bg-canvas text-muted'
      }`}
    >
      {copy.feedback[state.code] ?? copy.feedback.generic}
    </p>
  )
}

export default function LoginPreview({
  copy,
  anonymousHref,
  locale,
  next,
  initialStatus,
}) {
  const [mode, setMode] = useState('signIn')
  const [signInState, signInFormAction, isSigningIn] = useActionState(
    signInAction,
    initialAuthActionState,
  )
  const [signUpState, signUpFormAction, isSigningUp] = useActionState(
    signUpAction,
    initialAuthActionState,
  )
  const activeState = mode === 'signIn' ? signInState : signUpState

  return (
    <div className="border border-line bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <div className="mb-6 flex h-11 w-11 items-center justify-center border border-[var(--line-strong)] bg-surfaceMuted text-ink">
        <LogIn size={20} />
      </div>

      <h2 className="text-2xl font-semibold tracking-[-0.035em] text-ink">
        {copy.accessTitle}
      </h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        {copy.accessDescription}
      </p>

      <form action={googleSignInAction} className="mt-7">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center gap-3 bg-ink px-5 text-sm font-semibold text-surface transition hover:bg-accentDark"
        >
          <span
            aria-hidden="true"
            className="grid h-6 w-6 place-items-center bg-surface font-mono text-xs font-bold text-ink"
          >
            G
          </span>
          {copy.googleCta}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
          {copy.alternative}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-2 border-b border-line" role="tablist">
        {['signIn', 'signUp'].map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={mode === item}
            onClick={() => setMode(item)}
            className={`border-b-2 px-3 pb-3 text-sm transition ${
              mode === item
                ? 'border-ink font-semibold text-ink'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {item === 'signIn' ? copy.signInTab : copy.signUpTab}
          </button>
        ))}
      </div>

      <form
        action={mode === 'signIn' ? signInFormAction : signUpFormAction}
        className="mt-5 space-y-4"
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="next" value={next} />

        <label className="block text-sm font-medium text-ink">
          {copy.emailLabel}
          <span className="relative mt-2 block">
            <Mail
              aria-hidden="true"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              maxLength={254}
              placeholder={copy.emailPlaceholder}
              className="h-11 w-full border border-line bg-canvas pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-[var(--line-strong)]"
            />
          </span>
        </label>

        <label className="block text-sm font-medium text-ink">
          {copy.passwordLabel}
          <input
            required
            type="password"
            name="password"
            autoComplete={
              mode === 'signIn' ? 'current-password' : 'new-password'
            }
            minLength={mode === 'signUp' ? 12 : 1}
            maxLength={128}
            placeholder={copy.passwordPlaceholder}
            className="mt-2 h-11 w-full border border-line bg-canvas px-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-[var(--line-strong)]"
          />
        </label>

        {mode === 'signUp' && (
          <p className="text-xs leading-5 text-muted">{copy.passwordHint}</p>
        )}

        {mode === 'signIn' && (
          <div className="text-right">
            <Link
              href={`/${locale}/forgot-password`}
              className="text-xs font-medium text-muted transition hover:text-ink"
            >
              {copy.forgotPassword}
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={isSigningIn || isSigningUp}
          className="inline-flex h-11 w-full items-center justify-center bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accentDark disabled:cursor-wait disabled:opacity-60"
        >
          {isSigningIn || isSigningUp
            ? copy.submitting
            : mode === 'signIn'
              ? copy.signInCta
              : copy.signUpCta}
        </button>
      </form>

      <Feedback copy={copy} state={activeState} />
      {initialStatus && copy.feedback[initialStatus] && (
        <Feedback
          copy={copy}
          state={{ status: 'success', code: initialStatus }}
        />
      )}

      <Link
        href={anonymousHref}
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
      >
        {copy.anonymousCta}
        <ArrowRight size={16} />
      </Link>

      <p className="mt-5 text-xs leading-5 text-muted">
        {copy.privacyNote}
      </p>
    </div>
  )
}
