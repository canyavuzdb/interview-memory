import Link from 'next/link'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata = {
  title: 'Başvuru Benchmark',
  description:
    'Başvuru, dönüş, HR görüşmesi ve teknik mülakat oranlarını anonim olarak topluluk verisine ekle.',
}

export default function ApplicationBenchmarkSurveyPage() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
          >
            <ArrowLeft size={16} />
            Ana sayfaya dön
          </Link>
          <ThemeToggle />
        </div>

        <div className="mt-10 rounded-[2rem] border border-line bg-surface p-6 shadow-sm md:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-surface">
            <BarChart3 size={23} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Anket 02
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Kaç başvuruya bir mülakat düşüyor?
          </h1>

          <p className="mt-5 text-base leading-8 text-muted">
            Bu form, benzer adayların kaç başvuruda dönüş, HR görüşmesi, teknik
            görüşme ve teklif alabildiğini anlamak için anonim veri toplar.
          </p>

          <div className="mt-8 rounded-2xl border border-line bg-canvas p-4 text-sm leading-7 text-muted">
            Bu bir kesin tahmin aracı değildir. Toplanan anonim veriler,
            adayların başvuru süreçlerini topluluk seviyesinde anlamak için
            kullanılacaktır.
          </div>

          <form className="mt-8 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold">Hedef rol</span>
                <input
                  className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent"
                  placeholder="Örn. Frontend Developer"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">Deneyim yılı</span>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent"
                  placeholder="Örn. 3"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-semibold">Dönem</span>
                <select className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent">
                  <option>Son 30 gün</option>
                  <option>Son 60 gün</option>
                  <option>Son 90 gün</option>
                  <option>Son 6 ay</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">Çalışma modeli</span>
                <select className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent">
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                  <option>Fark etmez</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">İngilizce seviyesi</span>
                <select className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent">
                  <option>Belirtmek istemiyorum</option>
                  <option>A1-A2</option>
                  <option>B1-B2</option>
                  <option>C1-C2</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                'Kaç başvuru yaptın?',
                'Kaç dönüş aldın?',
                'Kaç otomatik red aldın?',
                'Kaç HR görüşmesi aldın?',
                'Kaç teknik görüşme aldın?',
                'Kaç teklif aldın?',
              ].map((label) => (
                <label key={label} className="space-y-2">
                  <span className="text-sm font-semibold">{label}</span>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent"
                    placeholder="0"
                  />
                </label>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-semibold">Referanslı başvuru</span>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent"
                  placeholder="0"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">Portfolio var mı?</span>
                <select className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent">
                  <option>Evet</option>
                  <option>Hayır</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">GitHub aktif mi?</span>
                <select className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent">
                  <option>Evet</option>
                  <option>Hayır</option>
                  <option>Rolüm için gerekli değil</option>
                </select>
              </label>
            </div>

            <button
              type="button"
              className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-surface transition hover:-translate-y-0.5 hover:bg-accentDark"
            >
              Anonim başvuru verimi gönder
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
