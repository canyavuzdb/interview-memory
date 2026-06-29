import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'

export default function PreferenceControls({
  locale,
  path = '',
  languageLabel,
  themeLabel,
  themeTitle,
}) {
  return (
    <div className="inline-flex items-stretch divide-x divide-[var(--line-strong)] border border-[var(--line-strong)] bg-[var(--nav-surface)]">
      <LanguageSwitcher
        locale={locale}
        path={path}
        label={languageLabel}
        embedded
      />
      <ThemeToggle
        label={themeLabel}
        title={themeTitle}
        embedded
      />
    </div>
  )
}
