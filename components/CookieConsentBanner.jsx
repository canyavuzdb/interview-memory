'use client'

import { useEffect, useState } from 'react'
import { Settings, X } from 'lucide-react'

const CONSENT_COOKIE = 'im_cookie_consent_v1'
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365

const copy = {
  tr: {
    eyebrow: 'Çerezler',
    title: 'Deneyiminizi iyileştirmek için çerezlerden yararlanıyoruz.',
    description:
      'Tercihlerinizi yönetebilirsiniz. Oturum açma ve anonim katkıların sürekliliği için gereken temel çerezler uygulamanın çalışmasını sağlar.',
    necessary: 'Yalnızca gerekli',
    settings: 'Çerez ayarları',
    close: 'Geri',
    settingsTitle: 'Çerez ayarları',
    settingsDescription:
      'Hangi tür çerezlerin kullanılacağını seçin. Temel işlevler için gereken çerezler her zaman aktiftir.',
    necessaryTitle: 'Temel işlevler',
    necessaryDescription:
      'Oturum, anonim katkı sürekliliği ve güvenlik kontrolleri için kullanılır. Bu çerezler kapatılamaz.',
    alwaysOn: 'Her zaman aktif',
    cancel: 'İptal',
    save: 'Yalnızca gerekli olanları kaydet',
  },
  en: {
    eyebrow: 'Cookies',
    title: 'We use cookies to improve your experience.',
    description:
      'Essential cookies keep sign-in, anonymous contribution continuity, and secure use working. We currently do not use analytics or advertising cookies.',
    necessary: 'Only necessary',
    settings: 'Cookie settings',
    close: 'Back',
    settingsTitle: 'Cookie settings',
    settingsDescription:
      'Choose which types of cookies may be used. Cookies needed for core functions are always active.',
    necessaryTitle: 'Core functions',
    necessaryDescription:
      'Used for sessions, anonymous contribution continuity, and security controls. These cookies cannot be turned off.',
    alwaysOn: 'Always active',
    cancel: 'Cancel',
    save: 'Save only necessary cookies',
  },
}

function hasConsent() {
  return document.cookie.split(';').some((item) => item.trim().startsWith(`${CONSENT_COOKIE}=`))
}

function saveConsent() {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=essential; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`
}

export default function CookieConsentBanner({ locale = 'tr' }) {
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const text = copy[locale === 'en' ? 'en' : 'tr']

  useEffect(() => {
    const reveal = window.setTimeout(() => {
      if (!hasConsent()) setOpen(true)
    }, 0)

    const handleOpenSettings = () => {
      setOpen(true)
      setSettingsOpen(true)
    }

    window.addEventListener('open-cookie-settings', handleOpenSettings)
    return () => {
      window.clearTimeout(reveal)
      window.removeEventListener('open-cookie-settings', handleOpenSettings)
    }
  }, [])

  if (!open) return null

  const acceptNecessary = () => {
    saveConsent()
    setOpen(false)
    setSettingsOpen(false)
  }

  if (settingsOpen) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/55 p-3 backdrop-blur-[2px] sm:p-6">
        <section
          role="dialog"
          aria-modal="true"
          aria-label={text.settingsTitle}
          className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-2xl overflow-y-auto border border-line bg-surface p-5 shadow-soft sm:max-h-[calc(100vh-3rem)] sm:p-8"
        >
          <button
            type="button"
            aria-label={text.close}
            onClick={() => setSettingsOpen(false)}
            className="absolute right-5 top-5 text-muted transition-colors hover:text-ink sm:right-8 sm:top-8"
          >
            <X size={22} strokeWidth={1.7} aria-hidden="true" />
          </button>
          <div className="max-w-xl pr-10">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-accent-dark">{text.eyebrow}</p>
            <h2 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-[-0.04em] text-ink sm:text-3xl">
              <Settings size={24} strokeWidth={1.7} aria-hidden="true" />
              {text.settingsTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted sm:text-base">{text.settingsDescription}</p>
          </div>

          <div className="mt-7 flex items-start justify-between gap-5 border border-line bg-surface-muted p-4 sm:p-5">
            <div className="max-w-[calc(100%-6rem)]">
              <h3 className="text-base font-semibold text-ink">{text.necessaryTitle}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted">{text.necessaryDescription}</p>
            </div>
            <div className="shrink-0 pt-1 text-right">
              <span className="relative inline-flex h-7 w-12 items-center rounded-full bg-accent">
                <span className="inline-block h-5 w-5 translate-x-6 rounded-full bg-surface shadow-card" />
              </span>
              <span className="mt-1 block font-mono text-[8px] font-bold uppercase leading-3 tracking-[0.06em] text-accent-dark">{text.alwaysOn}</span>
            </div>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setSettingsOpen(false)} className="border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-muted">{text.cancel}</button>
            <button type="button" onClick={acceptNecessary} className="bg-ink px-5 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-accent-dark">{text.save}</button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label={text.settings}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl border border-line border-l-4 border-l-accent bg-surface p-4 shadow-soft sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:p-5"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
        <div className="pr-20 sm:max-w-[72%] sm:pr-0">
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-accent-dark">
            {text.eyebrow}
          </p>
          <h2 className="mt-1.5 text-base font-semibold tracking-[-0.03em] text-ink sm:text-lg">{settingsOpen ? text.settingsTitle : text.title}</h2>
          <p className="mt-1.5 text-xs leading-5 text-muted sm:text-sm">
            {settingsOpen ? text.settingsDescription : text.description}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen((value) => !value)}
          className="absolute right-4 top-4 text-[11px] font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          {settingsOpen ? text.close : text.settings}
        </button>
        <button
          type="button"
          onClick={acceptNecessary}
          className="shrink-0 self-end bg-ink px-3.5 py-2 text-xs font-semibold text-surface transition-colors hover:bg-accent-dark sm:self-auto sm:text-sm"
        >
          {text.necessary}
        </button>
      </div>
    </aside>
  )
}
