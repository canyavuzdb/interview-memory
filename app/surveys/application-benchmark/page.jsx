import Link from 'next/link'
import { ArrowLeft, BarChart3 } from 'lucide-react'

export default function ApplicationBenchmarkSurveyPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF] text-[#191714]">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#706A61] transition hover:text-[#191714]"
        >
          <ArrowLeft size={16} />
          Ana sayfaya dön
        </Link>

        <div className="mt-10 rounded-[2rem] border border-[#E2DDD4] bg-[#FFFCF7] p-6 shadow-sm md:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#191714] text-[#FFFCF7]">
            <BarChart3 size={23} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5B6F64]">
            Anket 02
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Kaç başvuruya bir mülakat düşüyor?
          </h1>

          <p className="mt-5 text-base leading-8 text-[#706A61]">
            Bu form, benzer adayların kaç başvuruda dönüş, HR görüşmesi, teknik
            görüşme ve teklif alabildiğini anlamak için anonim veri toplar.
          </p>

          <div className="mt-8 rounded-2xl border border-[#E2DDD4] bg-[#F7F4EF] p-4 text-sm leading-7 text-[#706A61]">
            Bu bir kesin tahmin aracı değildir. Toplanan anonim veriler,
            adayların başvuru süreçlerini topluluk seviyesinde anlamak için
            kullanılacaktır.
          </div>

          <form className="mt-8 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold">Hedef rol</span>
                <input
                  className="w-full rounded-2xl border border-[#E2DDD4] bg-[#F7F4EF] px-4 py-3 text-sm outline-none transition focus:border-[#5B6F64]"
                  placeholder="Örn. Frontend Developer"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">Deneyim yılı</span>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-[#E2DDD4] bg-[#F7F4EF] px-4 py-3 text-sm outline-none transition focus:border-[#5B6F64]"
                  placeholder="Örn. 3"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-semibold">Dönem</span>
                <select className="w-full rounded-2xl border border-[#E2DDD4] bg-[#F7F4EF] px-4 py-3 text-sm outline-none transition focus:border-[#5B6F64]">
                  <option>Son 30 gün</option>
                  <option>Son 60 gün</option>
                  <option>Son 90 gün</option>
                  <option>Son 6 ay</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">Çalışma modeli</span>
                <select className="w-full rounded-2xl border border-[#E2DDD4] bg-[#F7F4EF] px-4 py-3 text-sm outline-none transition focus:border-[#5B6F64]">
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                  <option>Fark etmez</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">İngilizce seviyesi</span>
                <select className="w-full rounded-2xl border border-[#E2DDD4] bg-[#F7F4EF] px-4 py-3 text-sm outline-none transition focus:border-[#5B6F64]">
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
                    className="w-full rounded-2xl border border-[#E2DDD4] bg-[#F7F4EF] px-4 py-3 text-sm outline-none transition focus:border-[#5B6F64]"
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
                  className="w-full rounded-2xl border border-[#E2DDD4] bg-[#F7F4EF] px-4 py-3 text-sm outline-none transition focus:border-[#5B6F64]"
                  placeholder="0"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">Portfolio var mı?</span>
                <select className="w-full rounded-2xl border border-[#E2DDD4] bg-[#F7F4EF] px-4 py-3 text-sm outline-none transition focus:border-[#5B6F64]">
                  <option>Evet</option>
                  <option>Hayır</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">GitHub aktif mi?</span>
                <select className="w-full rounded-2xl border border-[#E2DDD4] bg-[#F7F4EF] px-4 py-3 text-sm outline-none transition focus:border-[#5B6F64]">
                  <option>Evet</option>
                  <option>Hayır</option>
                  <option>Rolüm için gerekli değil</option>
                </select>
              </label>
            </div>

            <button
              type="button"
              className="w-full rounded-full bg-[#191714] px-6 py-3 text-sm font-semibold text-[#FFFCF7] transition hover:-translate-y-0.5 hover:bg-[#31443A]"
            >
              Anonim başvuru verimi gönder
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}