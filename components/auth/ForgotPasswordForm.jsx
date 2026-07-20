'use client'

import { useActionState } from 'react'

import { requestPasswordResetAction } from '@/app/[locale]/forgot-password/actions'
import { initialAuthActionState } from '@/lib/auth/action-state'

export default function ForgotPasswordForm({ copy, locale }) {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    initialAuthActionState,
  )

  return (
    <form action={formAction} className="mt-7 space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <label className="block text-sm font-medium text-ink">
        {copy.emailLabel}
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          maxLength={254}
          placeholder={copy.emailPlaceholder}
          className="mt-2 h-11 w-full border border-line bg-canvas px-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-[var(--line-strong)]"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 w-full items-center justify-center bg-ink px-5 text-sm font-semibold text-surface transition hover:bg-accentDark disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? copy.submitting : copy.cta}
      </button>

      {state.code && (
        <p
          role="status"
          className="border border-line bg-canvas px-4 py-3 text-sm leading-6 text-muted"
        >
          {copy.feedback[state.code] ?? copy.feedback.generic}
        </p>
      )}
    </form>
  )
}
