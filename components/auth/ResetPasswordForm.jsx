'use client'

import { useActionState } from 'react'

import { updatePasswordAction } from '@/app/[locale]/reset-password/actions'
import { initialAuthActionState } from '@/lib/auth/action-state'

export default function ResetPasswordForm({ copy, locale }) {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    initialAuthActionState,
  )

  return (
    <form action={formAction} className="mt-7 space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <label className="block text-sm font-medium text-ink">
        {copy.passwordLabel}
        <input
          required
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          placeholder={copy.passwordPlaceholder}
          className="mt-2 h-11 w-full border border-line bg-canvas px-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-[var(--line-strong)]"
        />
      </label>
      <p className="text-xs leading-5 text-muted">{copy.passwordHint}</p>

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
