export default function StableLocalizedText({ children, reserve, className = '' }) {
  return (
    <span className={`grid min-w-0 ${className}`}>
      <span
        aria-hidden="true"
        className="invisible col-start-1 row-start-1"
      >
        {reserve}
      </span>
      <span className="col-start-1 row-start-1">{children}</span>
    </span>
  )
}
