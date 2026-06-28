export default function ScorePill({ value, label }) {
  const numeric = Number(value);
  const tone = numeric >= 7.5 ? 'text-accentDark' : numeric >= 6 ? 'text-warning' : 'text-danger';

  return (
    <div className="rounded-2xl border border-line bg-surfaceMuted/55 px-4 py-3">
      <div className={`text-xl font-semibold ${tone}`}>{value}</div>
      <div className="mt-1 text-xs leading-5 text-muted">{label}</div>
    </div>
  );
}
