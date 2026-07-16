import Link from 'next/link'
import BrandMark from './BrandMark'

export default function BrandHomeLink({
  className = '',
  href,
  label,
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`flex items-center gap-3 ${className}`}
    >
      <BrandMark className="h-9 w-9 text-ink" />
      <span className="hidden sm:block" aria-hidden="true">
        <span className="block text-xs font-bold uppercase leading-none tracking-[0.08em] text-ink">
          Interview
        </span>
        <span className="mt-1 block text-xs font-bold uppercase leading-none tracking-[0.08em] text-accent">
          Memory
        </span>
      </span>
    </Link>
  )
}
