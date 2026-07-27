function percent(value, total) {
  if (!total) return '—'
  return `${Math.round((value / total) * 100)}%`
}

function Metric({ label, value, detail }) {
  return (
    <div className="border border-line bg-surfaceMuted p-4">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">
        {value}
      </p>
      {detail && <p className="mt-1 text-xs text-muted">{detail}</p>}
    </div>
  )
}

function FunnelRow({ label, value, total }) {
  const width = total ? Math.max((value / total) * 100, value ? 4 : 0) : 0

  return (
    <li>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-mono text-xs font-bold text-ink">
          {value} · {percent(value, total)}
        </span>
      </div>
      <div className="mt-2 h-2 bg-surfaceMuted">
        <div className="h-full bg-accent" style={{ width: `${width}%` }} />
      </div>
    </li>
  )
}

export default function PersonalBenchmarkPanel({ copy, report }) {
  const search = report.search
  const ghostedCount = report.companyExperiences.filter((row) => row.wasGhosted).length
  const feedbackCount = report.companyExperiences.filter(
    (row) => row.rejectionShared !== 'no',
  ).length
  const responseDays = report.companyExperiences
    .map((row) => row.actualDays)
    .filter((value) => value !== null)
  const averageResponseDays = responseDays.length
    ? Math.round(responseDays.reduce((sum, value) => sum + value, 0) / responseDays.length)
    : null
  const funnel = [
    [copy.funnelStages.applications, search.applicationsCount],
    [copy.funnelStages.responses, search.humanResponsesCount],
    [copy.funnelStages.interviews, search.interviewsCount],
    [copy.funnelStages.offers, search.offersCount],
    [copy.funnelStages.started, search.employmentStartedCount],
  ]

  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-16 sm:px-6 lg:px-8">
      <div className="border border-line bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-accent">
          {copy.eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
          {copy.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          {copy.description}
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Metric label={copy.metrics.episodes} value={search.episodeCount} />
          <Metric label={copy.metrics.applications} value={search.applicationsCount} />
          <Metric label={copy.metrics.responses} value={search.humanResponsesCount} detail={percent(search.humanResponsesCount, search.applicationsCount)} />
          <Metric label={copy.metrics.interviews} value={search.interviewsCount} detail={percent(search.interviewsCount, search.applicationsCount)} />
          <Metric label={copy.metrics.offers} value={search.offersCount} detail={percent(search.offersCount, search.applicationsCount)} />
          <Metric label={copy.metrics.starts} value={search.employmentStartedCount} />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div>
            <h3 className="text-lg font-semibold text-ink">{copy.funnelTitle}</h3>
            <ol className="mt-5 space-y-5">
              {funnel.map(([label, value]) => (
                <FunnelRow key={label} label={label} value={value} total={search.applicationsCount} />
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">{copy.signalsTitle}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric label={copy.signals.responseRate} value={percent(search.humanResponsesCount, search.applicationsCount)} />
              <Metric label={copy.signals.offerRate} value={percent(search.offersCount, search.applicationsCount)} />
              <Metric label={copy.signals.ghosted} value={ghostedCount} />
              <Metric label={copy.signals.feedback} value={feedbackCount} />
              <Metric label={copy.signals.averageResponse} value={averageResponseDays === null ? '—' : `${averageResponseDays} ${copy.daySuffix}`} />
              <Metric label={copy.signals.dataPoints} value={report.meta.submissionsCount} />
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-ink">{copy.companyTitle}</h3>
            {report.companyExperiences.length === 0 ? (
              <p className="mt-4 text-sm leading-7 text-muted">{copy.noCompanies}</p>
            ) : (
              <div className="mt-4 space-y-3">
                {report.companyExperiences.map((experience, index) => (
                  <article key={`${experience.company}-${experience.role}-${index}`} className="border border-line p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-ink">{experience.company}</p>
                        <p className="mt-1 text-sm text-muted">{experience.role} · {experience.processYear}</p>
                      </div>
                      {experience.wasGhosted && (
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-accentDark">
                          {copy.ghosted}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                      <span>{copy.responseDays}: {experience.actualDays === null ? '—' : `${experience.actualDays} ${copy.daySuffix}`}</span>
                      <span>{copy.transparency}: {experience.processTransparency}/5</span>
                      <span>{copy.professionalism}: {experience.hrProfessionalism}/5</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">{copy.applicationTitle}</h3>
            {report.applications.length === 0 ? (
              <p className="mt-4 text-sm leading-7 text-muted">{copy.noApplications}</p>
            ) : (
              <div className="mt-4 overflow-x-auto border border-line">
                <table className="w-full min-w-[32rem] text-left text-sm">
                  <thead className="border-b border-line bg-surfaceMuted text-xs text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">{copy.table.company}</th>
                      <th className="px-4 py-3 font-medium">{copy.table.role}</th>
                      <th className="px-4 py-3 font-medium">{copy.table.outcome}</th>
                      <th className="px-4 py-3 font-medium">{copy.table.stages}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.applications.map((application, index) => (
                      <tr key={`${application.company}-${application.appliedMonth}-${index}`} className="border-b border-line last:border-0">
                        <td className="px-4 py-3 font-medium text-ink">{application.company}</td>
                        <td className="px-4 py-3 text-muted">{application.role}</td>
                        <td className="px-4 py-3 text-muted">{application.outcome ?? '—'}</td>
                        <td className="px-4 py-3 text-muted">{application.stageCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <p className="mt-8 border-t border-line pt-5 text-xs leading-6 text-muted">
          {copy.privateNote}
        </p>
      </div>
    </section>
  )
}
