import BenchmarkReportHeader from './BenchmarkReportHeader'
import CompanyResponsivenessExplorer from './CompanyResponsivenessExplorer'
import TempoHeatmapReport from './TempoHeatmapReport'

export function ActivityTimingReport({ copy, locale, report }) {
  return (
    <section
      id="activity-heatmap"
      aria-labelledby="activity-heatmap-title"
      className="scroll-mt-24"
    >
      <BenchmarkReportHeader
        copy={copy}
        headingId="activity-heatmap-title"
        locale={locale}
        path="/surveys"
        showAction={false}
      />

      <TempoHeatmapReport copy={copy} locale={locale} report={report} />
    </section>
  )
}

export function ResponsivenessReport({ copy, locale, rows }) {
  return (
    <section
      id="responsiveness-report"
      aria-labelledby="responsiveness-report-title"
      className="scroll-mt-24"
    >
      <BenchmarkReportHeader
        copy={copy}
        headingId="responsiveness-report-title"
        locale={locale}
        path="/surveys/company-experience"
      />

      <CompanyResponsivenessExplorer copy={copy} locale={locale} rows={rows} />
    </section>
  )
}
