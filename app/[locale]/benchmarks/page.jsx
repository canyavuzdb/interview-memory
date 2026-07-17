import { notFound } from 'next/navigation'
import BenchmarkExplorer from '@/components/BenchmarkExplorer'
import {
  ActivityTimingReport,
  ResponsivenessReport,
} from '@/components/BenchmarkAdditionalReports'
import BenchmarkReportHeader from '@/components/BenchmarkReportHeader'
import BenchmarkReportSwitcher from '@/components/BenchmarkReportSwitcher'
import PublicHeader from '@/components/PublicHeader'
import SiteFooter from '@/components/SiteFooter'
import { benchmarkPreviewReport } from '@/data/benchmarkPreview'
import { getMessages, isSupportedLocale } from '@/data/i18n'

export async function generateMetadata({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) return {}

  return getMessages(locale).metadata.benchmarks
}

export default async function BenchmarksPage({ params }) {
  const { locale } = await params

  if (!isSupportedLocale(locale)) notFound()

  const messages = getMessages(locale)
  const alternateMessages = getMessages(locale === 'tr' ? 'en' : 'tr')
  const navigationCopy = messages.benchmarkPage.navigation
  const navigationItems = [
    {
      code: '01',
      id: 'role-benchmark',
      label: navigationCopy.items.benchmark.label,
      shortLabel: navigationCopy.items.benchmark.shortLabel,
    },
    {
      code: '02',
      id: 'activity-heatmap',
      label: navigationCopy.items.activity.label,
      shortLabel: navigationCopy.items.activity.shortLabel,
    },
    {
      code: '03',
      id: 'responsiveness-report',
      label: navigationCopy.items.responsiveness.label,
      shortLabel: navigationCopy.items.responsiveness.shortLabel,
    },
  ]

  return (
    <main className="landing-grid min-h-screen text-ink">
      <PublicHeader
        alternateCopy={alternateMessages.header}
        common={messages.common}
        copy={messages.header}
        locale={locale}
        path="/benchmarks"
      />

      <section className="mx-auto w-full max-w-[96rem] px-5 pb-12 pt-14 sm:px-6 md:pb-16 md:pt-20 lg:px-8">
        <div className="grid gap-8 border-b border-[var(--line-strong)] pb-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
              {messages.benchmarkPage.eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-ink sm:text-6xl">
              {messages.benchmarkPage.title}
            </h1>
          </div>
          <div className="border-l border-[var(--line-strong)] pl-5 sm:pl-7">
            <p className="text-base leading-7 text-muted">{messages.benchmarkPage.description}</p>
            <p className="mt-4 font-mono text-[8px] font-bold uppercase leading-4 tracking-[0.08em] text-accentDark">
              {messages.benchmarkPage.dataNote}
            </p>
          </div>
        </div>

        <BenchmarkReportSwitcher
          copy={navigationCopy}
          items={navigationItems}
          locale={locale}
        >
          <section
            id="role-benchmark"
            aria-labelledby="role-benchmark-title"
            className="scroll-mt-24"
          >
            <BenchmarkReportHeader
              copy={messages.benchmarkPage.reports.roleBenchmark}
              headingId="role-benchmark-title"
              locale={locale}
              path="/surveys/application-benchmark"
            />
            <BenchmarkExplorer
              copy={messages.community.explorer}
              embedded
              locale={locale}
              report={benchmarkPreviewReport}
            />
          </section>

          <ActivityTimingReport
            copy={messages.benchmarkPage.reports.activityHeatmap}
            locale={locale}
            report={benchmarkPreviewReport.activityTiming}
          />

          <ResponsivenessReport
            copy={messages.benchmarkPage.reports.responsiveness}
            locale={locale}
            rows={benchmarkPreviewReport.companyResponsiveness}
          />
        </BenchmarkReportSwitcher>
      </section>

      <div className="benchmark-footer-grid">
        <SiteFooter copy={{ ...messages.footer, homeAria: messages.common.homeAria }} locale={locale} />
      </div>
    </main>
  )
}
