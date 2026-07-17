import ReportShowcase from '@/components/ReportShowcase'
import { benchmarkShowcasePreview } from '@/data/benchmarkPreview'

export default function CommunityStats({ copy, locale }) {
  return (
    <section className="community-stats-section mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-8">
      <div className="grid gap-3 pb-2 sm:flex sm:items-center sm:justify-between sm:gap-5">
        <div className="flex flex-wrap items-baseline gap-3">
          <p className="community-stats-zone-eyebrow font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
            {copy.eyebrow}
          </p>
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink sm:text-xs">
            {copy.title}
          </h2>
        </div>
        <p className="community-stats-zone-note font-mono text-[8px] font-bold uppercase leading-4 tracking-[0.08em] text-muted sm:text-right sm:text-[9px]">
          {copy.note}
        </p>
      </div>

      <div className="community-stats-frame mt-5">
        <ReportShowcase
          copy={copy.showcase}
          locale={locale}
          report={benchmarkShowcasePreview}
        />
      </div>
    </section>
  )
}
