'use client'

import { ChevronDown, Search } from 'lucide-react'
import { useDeferredValue, useId, useMemo, useState } from 'react'

import { surveyControlClass } from '@/components/survey-flow/SurveyField'

const roleRequests = new Map()
const ROLE_CATALOG_CACHE_VERSION = '2026.1.2'

function loadRoles(locale) {
  const request = roleRequests.get(locale) ?? fetch(`/api/v1/roles?locale=${locale}&catalogVersion=${ROLE_CATALOG_CACHE_VERSION}`)
    .then(async (response) => {
      if (!response.ok) throw new Error('ROLE_LIST_UNAVAILABLE')
      return (await response.json()).data.items
    })
  roleRequests.set(locale, request)
  return request
}

export default function SurveyRoleCombobox({ error, id, locale = 'tr', onChange, placeholder, value }) {
  const listId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [query, setQuery] = useState('')
  const [roles, setRoles] = useState([])
  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = deferredQuery.toLocaleLowerCase(locale).trim()
  const results = useMemo(() => roles
    .filter((role) => role.label.toLocaleLowerCase(locale).includes(normalizedQuery)), [locale, normalizedQuery, roles])

  async function open() {
    setIsOpen(true)
    if (roles.length || isLoading) return
    setLoadFailed(false)
    setIsLoading(true)
    try {
      setRoles(await loadRoles(locale))
    } catch {
      roleRequests.delete(locale)
      setLoadFailed(true)
    } finally {
      setIsLoading(false)
    }
  }

  function beginSearch() {
    setQuery('')
    open()
  }

  function selectRole(role) {
    setQuery('')
    onChange(role)
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
        value={isOpen ? query : value?.label ?? ''}
        onBlur={() => window.setTimeout(() => {
          setIsOpen(false)
          setQuery('')
        }, 120)}
        onChange={(event) => {
          setQuery(event.target.value)
          open()
        }}
        onClick={() => {
          if (!isOpen) beginSearch()
        }}
        onFocus={beginSearch}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setIsOpen(false)
        }}
      />
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={1.8} />
      {isOpen && (
        <div id={listId} role="listbox" className="absolute inset-x-0 top-full z-50 mt-2 max-h-80 overflow-y-auto border border-[var(--line-strong)] bg-surface shadow-[5px_5px_0_var(--line)]">
          {isLoading && <p className="px-4 py-3 text-sm text-muted">Yükleniyor…</p>}
          {loadFailed && <p className="px-4 py-3 text-sm text-danger">Pozisyonlar şu anda yüklenemiyor.</p>}
          {!isLoading && !loadFailed && results.map((role) => (
            <button key={role.value} type="button" role="option" aria-selected={value?.value === role.value} className="block w-full border-b border-line px-4 py-3 text-left text-sm text-ink transition-colors last:border-b-0 hover:bg-[var(--accent-soft)] focus:bg-[var(--accent-soft)] focus:outline-none" onMouseDown={(event) => event.preventDefault()} onClick={() => selectRole(role)}>
              {role.label}
            </button>
          ))}
          {!isLoading && !loadFailed && roles.length > 0 && results.length === 0 && <p className="px-4 py-3 text-sm text-muted">Eşleşen pozisyon bulunamadı.</p>}
        </div>
      )}
    </div>
  )
}
