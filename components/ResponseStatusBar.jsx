const toneVariables = {
  timely: '--status-timely',
  late: '--status-late',
  rejected: '--status-rejected',
  silent: '--status-silent',
}

function getTone(item, index) {
  return toneVariables[item.tone] ?? (index === 0 ? '--status-silent' : '--status-timely')
}

export default function ResponseStatusBar({ compact = false, distribution, showScale = false }) {
  return (
    <div>
      <div
        className={`flex overflow-hidden border border-[var(--line-strong)] ${compact ? 'h-4' : 'h-7'}`}
        aria-hidden="true"
      >
        {distribution.map((item, index) => (
          <div
            key={item.label}
            title={`${item.label}: ${item.value}`}
            style={{
              width: item.width,
              backgroundColor: `var(${getTone(item, index)})`,
            }}
          />
        ))}
      </div>

      {showScale && (
        <div className="mt-1 flex justify-between font-mono text-[8px] font-bold text-muted" aria-hidden="true">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      )}

      <div className={`grid grid-cols-2 gap-x-3 ${compact ? 'mt-4 gap-y-3' : 'mt-3 gap-y-3 sm:grid-cols-4'}`}>
        {distribution.map((item, index) => (
          <div key={item.label} className="flex items-start gap-2">
            <span
              className="mt-1 h-2 w-2 shrink-0"
              style={{ backgroundColor: `var(${getTone(item, index)})` }}
              aria-hidden="true"
            />
            <div>
              <p className="font-mono text-xs font-bold text-ink">{item.value}</p>
              <p className="mt-1 font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-muted">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
