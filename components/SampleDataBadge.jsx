export default function SampleDataBadge({ align = 'left', label, value }) {
  return (
    <p
      className={`font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.1em] text-muted ${align === 'right' ? 'text-right' : ''}`}
    >
      <span>{label}</span>
      {value && <span className="block text-accentDark">N = {value}</span>}
    </p>
  )
}
