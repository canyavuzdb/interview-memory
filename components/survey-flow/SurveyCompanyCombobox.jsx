'use client'

import { ChevronDown, Search } from 'lucide-react'
import { useEffect, useId, useState } from 'react'

import { surveyControlClass } from '@/components/survey-flow/SurveyField'

const COPY = {
  tr: {
    empty: 'Eşleşen şirket bulunamadı.',
    loadFailed: 'Şirket kataloğu şu anda yüklenemiyor.',
    loading: 'Aranıyor…',
    manual: 'Şirket listede yok',
  },
  en: {
    empty: 'No matching company was found.',
    loadFailed: 'The company catalogue is unavailable right now.',
    loading: 'Searching…',
    manual: 'Company is not in the list',
  },
}

export default function SurveyCompanyCombobox({ error, id, locale = 'tr', onChange, onNotListed, placeholder, value }) {
  const listId = useId()
  const copy = COPY[locale === 'en' ? 'en' : 'tr']
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [query, setQuery] = useState('')
  const [companies, setCompanies] = useState([])
  const normalizedQuery = query.trim()

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setIsLoading(true)
      setLoadFailed(false)
      try {
        const response = await fetch(`/api/v1/companies?query=${encodeURIComponent(normalizedQuery)}`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('COMPANY_SEARCH_UNAVAILABLE')
        const payload = await response.json()
        setCompanies(payload.data.items)
      } catch (cause) {
        if (cause.name !== 'AbortError') {
          setCompanies([])
          setLoadFailed(true)
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }, normalizedQuery ? 180 : 0)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [isOpen, normalizedQuery])

  function openSearch() {
    setIsOpen(true)
    setQuery('')
  }

  function choose(company) {
    onChange(company)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="relative mt-2">
      <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={1.8} />
      <input
        id={id}
        autoComplete="off"
        aria-controls={isOpen ? listId : undefined}
        aria-expanded={isOpen}
        aria-invalid={Boolean(error)}
        aria-autocomplete="list"
        className={`${surveyControlClass} mt-0 pl-11 pr-11`}
        placeholder={placeholder}
        role="combobox"
        value={isOpen ? query : value ?? ''}
        onBlur={() => window.setTimeout(() => {
          setIsOpen(false)
          setQuery('')
        }, 120)}
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(true)
        }}
        onClick={() => {
          if (!isOpen) openSearch()
        }}
        onFocus={() => {
          if (!isOpen) openSearch()
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setIsOpen(false)
        }}
      />
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={1.8} />
      {isOpen && (
        <div id={listId} role="listbox" className="absolute inset-x-0 top-full z-50 mt-2 max-h-80 overflow-y-auto border border-[var(--line-strong)] bg-surface shadow-[5px_5px_0_var(--line)]">
          {isLoading && <p className="px-4 py-3 text-sm text-muted">{copy.loading}</p>}
          {loadFailed && <p className="px-4 py-3 text-sm text-danger">{copy.loadFailed}</p>}
          {!isLoading && !loadFailed && companies.map((company) => (
            <button key={company.value} type="button" role="option" aria-selected={value === company.label} className="block w-full border-b border-line px-4 py-3 text-left text-sm text-ink transition-colors last:border-b-0 hover:bg-[var(--accent-soft)] focus:bg-[var(--accent-soft)] focus:outline-none" onMouseDown={(event) => event.preventDefault()} onClick={() => choose(company)}>
              {company.label}
            </button>
          ))}
          {!isLoading && !loadFailed && normalizedQuery.length >= 2 && companies.length === 0 && <p className="border-b border-line px-4 py-3 text-sm text-muted">{copy.empty}</p>}
          {!isLoading && !loadFailed && (
            <button type="button" className="block w-full px-4 py-3 text-left text-sm font-semibold text-accent transition-colors hover:bg-[var(--accent-soft)] focus:bg-[var(--accent-soft)] focus:outline-none" onMouseDown={(event) => event.preventDefault()} onClick={() => {
              onNotListed(normalizedQuery)
              setQuery('')
              setIsOpen(false)
            }}>
              {copy.manual}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
