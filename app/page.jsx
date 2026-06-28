import { ArrowRight, BarChart3, LockKeyhole, MessageSquareText, Search } from 'lucide-react';
import Header from '@/components/Header';
import CompanyCard from '@/components/CompanyCard';
import InsightCard from '@/components/InsightCard';
import ShareExperienceCard from '@/components/ShareExperienceCard';
import { companies, insights, rejectionReasons } from '@/data/mockData';

export default function HomePage() {
  return (
    <main>
      <Header />

      <section className="container-page pb-14 pt-12 sm:pb-20 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted shadow-card">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Anonim mülakat deneyimleriyle işe alım şeffaflığı
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-6xl lg:text-7xl">
              Adaylar yıllardır değerlendiriliyor. Artık süreçler de değerlendirilsin.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              Mülakat Atlası, adayların anonim deneyimlerinden şirketlerin işe alım süreçlerini,
              soru tiplerini, feedback kalitesini ve aday deneyimini görünür kılan sade bir platformdur.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#share" className="inline-flex items-center justify-center gap-2 rounded-full bg-accentDark px-5 py-3 text-sm font-semibold text-surface shadow-card transition hover:-translate-y-0.5 hover:bg-accent">
                Deneyim paylaş
                <ArrowRight size={17} />
              </a>
              <a href="#companies" className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink shadow-card transition hover:-translate-y-0.5 hover:border-accent/40">
                Şirketleri keşfet
              </a>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-4 sm:p-6">
            <div className="rounded-[1.5rem] border border-line bg-surface p-4 shadow-card">
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-canvas px-4 py-3">
                <Search size={18} className="text-muted" />
                <span className="text-sm text-muted">Şirket, rol veya sektör ara...</span>
              </div>

              <div className="mt-5 rounded-3xl bg-accentDark p-5 text-surface">
                <div className="text-xs font-medium uppercase tracking-[0.22em] text-white/60">Hiring Experience Score</div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-5xl font-semibold tracking-tight">7.2</div>
                    <p className="mt-2 text-sm text-white/68">128 anonim deneyime göre</p>
                  </div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/78">Fintech</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MiniMetric icon={<MessageSquareText size={17} />} title="Feedback" value="3.8" />
                <MiniMetric icon={<BarChart3 size={17} />} title="Şeffaflık" value="6.4" />
                <MiniMetric icon={<LockKeyhole size={17} />} title="Güven" value="8.9" />
              </div>

              <div className="mt-5 rounded-3xl border border-line bg-canvas p-4">
                <div className="text-sm font-semibold">En sık belirtilen olası eleme sebepleri</div>
                <div className="mt-4 space-y-3">
                  {rejectionReasons.map((reason, index) => (
                    <div key={reason} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted">{reason}</span>
                      <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-ink">#{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="soft-divider" />

      <section id="insights" className="container-page py-14 sm:py-20">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold text-accentDark">Topluluk içgörüleri</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Otomatik red maillerinin arkasındaki belirsizliği azalt.</h2>
          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            Mock verilerle hazırlanmış bu alan ileride gerçek deneyimlerden gelen istatistiklere bağlanabilir.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {insights.map((insight) => (
            <InsightCard key={insight.label} {...insight} />
          ))}
        </div>
      </section>

      <section id="companies" className="container-page py-14 sm:py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="text-sm font-semibold text-accentDark">Şirket profilleri</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">İşe alım süreçlerinin aday gözünden karnesi.</h2>
          </div>
          <button className="w-fit rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold shadow-card transition hover:-translate-y-0.5 hover:border-accent/40">
            Tüm şirketler
          </button>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.name} company={company} />
          ))}
        </div>
      </section>

      <ShareExperienceCard />

      <footer className="border-t border-line py-8">
        <div className="container-page flex flex-col justify-between gap-3 text-sm text-muted sm:flex-row">
          <span>© 2026 Mülakat Atlası UI Starter</span>
          <span>Frontend mockup · Next.js · Tailwind CSS</span>
        </div>
      </footer>
    </main>
  );
}

function MiniMetric({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-line bg-surfaceMuted/60 p-4">
      <div className="flex items-center justify-between gap-3 text-muted">
        {icon}
        <span className="text-2xl font-semibold text-ink">{value}</span>
      </div>
      <div className="mt-2 text-xs text-muted">{title}</div>
    </div>
  );
}
