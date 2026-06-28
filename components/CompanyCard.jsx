import { ArrowUpRight, MapPin } from 'lucide-react';
import ScorePill from './ScorePill';

export default function CompanyCard({ company }) {
  return (
    <article className="glass-panel rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:shadow-soft sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted">{company.sector}</div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{company.name}</h3>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted">
            <MapPin size={15} />
            {company.location}
          </div>
        </div>
        <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-surface transition hover:border-accent/50 hover:bg-surfaceMuted">
          <ArrowUpRight size={17} />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ScorePill value={company.score} label="Aday deneyimi" />
        <ScorePill value={company.transparency} label="Şeffaflık" />
        <ScorePill value={company.feedback} label="Feedback" />
        <ScorePill value={company.salaryClarity} label="Maaş açıklığı" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {company.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm text-muted">
        <span>{company.experiences} anonim deneyim</span>
        <span>Ort. süreç: {company.avgDuration}</span>
      </div>
    </article>
  );
}
