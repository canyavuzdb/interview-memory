export default function BrandMark({
  accent,
  className = '',
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width="64"
      height="64"
      className={`block shrink-0 ${className}`}
      shapeRendering="geometricPrecision"
      focusable="false"
      aria-hidden="true"
      style={accent ? { '--brand-mark-accent': accent } : undefined}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 4h56v56H4V4Zm4 4v48h48V8H8Z"
      />
      <path fill="currentColor" d="M13 16h6v29h-6V16Z" />
      <path
        fill="currentColor"
        d="M23 20 34 30 51 16v29h-6V29L34 38 23 28v-8Z"
      />
      <path
        fill="var(--brand-mark-accent, var(--accent, #5B6F64))"
        d="M13 49h38v4H13v-4Z"
      />
    </svg>
  )
}
