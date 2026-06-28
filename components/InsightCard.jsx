export default function InsightCard({ value, label }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-card">
      <div className="text-4xl font-semibold tracking-tight text-accentDark">{value}</div>
      <p className="mt-3 text-sm leading-6 text-muted">{label}</p>
    </div>
  );
}
