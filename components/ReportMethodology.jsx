import { ChevronDown } from 'lucide-react'

export default function ReportMethodology({
  label,
  text,
}) {
  return (
    <details className="group border-t border-line px-5 sm:px-7">
      <summary className="report-methodology-summary flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-muted transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown
          size={13}
          strokeWidth={1.7}
          aria-hidden="true"
          className="shrink-0 transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <p className="max-w-4xl pb-5 text-xs leading-5 text-muted">
        {text}
      </p>
    </details>
  )
}
