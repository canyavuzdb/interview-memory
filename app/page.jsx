import Link from 'next/link'
import { ArrowRight, BarChart3, Building2, Search, Sparkles } from 'lucide-react'
import AnonymousTrustSection from '@/components/AnonymousTrustSection'
import CommunityStats from '@/components/CommunityStats'
import SurveyCarousel from '@/components/SurveyCarousel'
import ThemeToggle from '@/components/ThemeToggle'

export default function HomePage() {
  return (
    <main className="landing-grid min-h-screen text-ink">
      <header className="sticky top-0 z-30 border-b border-[var(--line-strong)] bg-transparent">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Interview Memory ana sayfa">
            <div className="grid h-9 w-9 place-items-center border border-[var(--ink-soft)] bg-surfaceMuted font-mono text-[11px] font-bold tracking-[-0.08em] text-ink">
              IM
            </div>
            <div>
              <p className="text-xs font-bold uppercase leading-none tracking-[0.08em]">
                <span className="text-accent">I</span>nterview
              </p>
              <p className="mt-1 text-xs font-bold uppercase leading-none tracking-[0.08em]">
                <span className="text-accent">M</span>emory
              </p>
            </div>
          </Link>

          <nav
            aria-label="Ana navigasyon"
            className="hidden divide-x divide-[var(--line-strong)] border border-[var(--line-strong)] bg-[var(--nav-surface)] font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-soft)] md:flex"
          >
            <a href="#surveys" className="px-4 py-2.5 transition hover:bg-[var(--surface-hover)] hover:text-ink">
              <span className="mr-2 text-muted">01/</span>
              Anketler
            </a>
            <a href="#how-it-works" className="px-4 py-2.5 transition hover:bg-[var(--surface-hover)] hover:text-ink">
              <span className="mr-2 text-muted">02/</span>
              Nasıl çalışır?
            </a>
            <a href="#stats" className="px-4 py-2.5 transition hover:bg-[var(--surface-hover)] hover:text-ink">
              <span className="mr-2 text-muted">03/</span>
              Veriler
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="#surveys"
              className="border border-ink bg-ink px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-surface transition hover:bg-accentDark"
            >
              Anonim katıl
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-sm border border-line bg-surface px-4 py-2 text-sm text-muted shadow-sm">
            <Sparkles size={16} className="text-accent" />
            Kayıt olmadan anonim katkı
          </div>

          <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">
            Başvuruların kara deliğe mi düşüyor?
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Otomatik red, ghosting ve feedback almayan süreçler artık veri
            oluyor. Interview Memory, adayların başvuru ve mülakat
            deneyimlerini anonim şekilde toplayarak işe alım süreçlerini
            görünür kılar.
          </p>

          <p className="mt-5 max-w-xl text-xl font-semibold tracking-tight text-ink">
            Şirketler seni değerlendiriyor. Sen de süreci ölç.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#surveys"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3 text-sm font-semibold text-surface shadow-sm transition hover:-translate-y-0.5 hover:bg-accentDark"
            >
              Anketleri keşfet
              <ArrowRight size={17} />
            </a>

            <Link
              href="/surveys/application-benchmark"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-[var(--line-strong)] bg-surface px-6 py-3 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--line-emphasis)]"
            >
              Kaç başvuruya mülakat düşüyor?
              <Search size={17} />
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-10 hidden h-32 w-32 rounded-full bg-[var(--glow-primary)] blur-3xl lg:block" />
          <div className="absolute -bottom-8 right-4 hidden h-40 w-40 rounded-full bg-[var(--glow-secondary)] blur-3xl lg:block" />

          <div className="relative overflow-hidden rounded-sm border border-line bg-surface p-5 shadow-[var(--shadow-soft)]">
            <div className="rounded-sm border border-line bg-canvas p-5">
              <p className="text-sm font-semibold text-ink">
                Topluluk sinyali
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                Benzer adaylar kaç başvuruda dönüş alıyor?
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                Deneyim, rol ve network verileriyle başvuru süreçlerinin
                görünmeyen tarafını ölçülebilir hale getiriyoruz.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-sm border border-line bg-surface p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-sm bg-ink text-surface">
                    <Building2 size={20} />
                  </div>
                  <p className="text-sm font-semibold">
                    Şirket deneyimi
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    Başvuru, red, ghosting, HR ve mülakat süreci sinyalleri.
                  </p>
                </div>

                <div className="rounded-sm border border-line bg-surface p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-sm bg-ink text-surface">
                    <BarChart3 size={20} />
                  </div>
                  <p className="text-sm font-semibold">
                    Başvuru benchmark
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    Kaç başvuruya dönüş, HR görüşmesi ve teknik mülakat düşüyor?
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-sm border border-line bg-ink p-5 text-surface">
              <p className="text-sm font-semibold text-[var(--inverse-muted)]">
                Sessiz başvurular artık görünür
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">
                Bir adayın yaşadığı belirsizlik, toplulukla birleşince işe alım
                süreçlerinin gerçek sinyaline dönüşür.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AnonymousTrustSection />

      <SurveyCarousel />

      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-line bg-surface p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              01
            </p>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">
              Anket seç
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              Şirket deneyimini paylaşabilir ya da başvuru/mülakat oranını
              topluluk verisine ekleyebilirsin.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-line bg-surface p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              02
            </p>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">
              Anonim doldur
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              Kayıt olmadan sürecin nerede kaldığını, dönüş alıp almadığını ve
              feedback durumunu paylaş.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-line bg-surface p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              03
            </p>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">
              Veri oluşsun
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              Toplanan anonim veriler şirketlerin işe alım davranışlarını ve
              adayların başvuru gerçekliğini görünür kılar.
            </p>
          </div>
        </div>
      </section>

      <div id="stats">
        <CommunityStats />
      </div>

      <section className="mx-auto max-w-7xl px-5 py-14 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-line bg-surface p-6 text-center shadow-sm md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Katkın önemli
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Başvuru süreçleri sessiz kaldıkça belirsizlik büyür. Paylaşıldıkça
            veri olur.
          </h2>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/surveys/company-experience"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-surface transition hover:-translate-y-0.5 hover:bg-accentDark"
            >
              Şirket deneyimi paylaş
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/surveys/application-benchmark"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] bg-canvas px-6 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-[var(--line-emphasis)]"
            >
              Başvuru oranını paylaş
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
