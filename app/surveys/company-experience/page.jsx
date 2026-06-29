import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata = {
  title: 'Şirket Deneyimini Paylaş',
  description:
    'Bir şirketle yaşadığın başvuru veya mülakat deneyimini kayıt olmadan anonim olarak paylaş.',
}

export default function CompanyExperienceSurveyPage() {
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
            <Building2 size={23} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Anket 01
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Şirketin ile deneyimini paylaş
          </h1>

          <p className="mt-5 text-base leading-8 text-muted">
            Bu form, bir şirketle yaşadığın başvuru veya mülakat sürecinin hangi
            noktada kaldığını anonim şekilde paylaşman için tasarlandı. Kayıt
            olmak zorunda değilsin.
          </p>

          <div className="mt-8 rounded-2xl border border-line bg-canvas p-4 text-sm leading-7 text-muted">
            Lütfen kişi adı, e-posta, telefon, gizli doküman, birebir özel case
            içeriği veya hakaret içeren ifade paylaşma.
          </div>

          <form className="mt-8 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold">Şirket adı</span>
                <input
                  className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent"
                  placeholder="Örn. ABC Teknoloji"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">Rol</span>
                <input
                  className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent"
                  placeholder="Örn. Frontend Developer"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold">
                Bu şirketle sürecin hangi noktada kaldı?
              </span>
              <select className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent">
                <option>Sadece başvuru yaptım, dönüş olmadı</option>
                <option>Başvuru sonrası otomatik red aldım</option>
                <option>Başvuru sonrası manuel red aldım</option>
                <option>HR görüşmesine girdim</option>
                <option>Teknik görüşmeye girdim</option>
                <option>Case veya assignment yaptım</option>
                <option>Final görüşmesine girdim</option>
                <option>Teklif aldım</option>
                <option>Süreçten ben çekildim</option>
                <option>Süreç devam ediyor</option>
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-semibold">Geri dönüş oldu mu?</span>
                <select className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent">
                  <option>Evet</option>
                  <option>Hayır</option>
                  <option>Emin değilim</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">Feedback verildi mi?</span>
                <select className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent">
                  <option>Hayır</option>
                  <option>Evet, detaylı</option>
                  <option>Evet, yüzeysel</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold">Maaş konuşuldu mu?</span>
                <select className="w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent">
                  <option>Hayır</option>
                  <option>Evet, erken aşamada</option>
                  <option>Evet, geç aşamada</option>
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold">
                Kısaca ne yaşadığını anlat
              </span>
              <textarea
                className="min-h-32 w-full resize-none rounded-2xl border border-line bg-canvas px-4 py-3 text-sm outline-none transition focus:border-accent"
                placeholder="Başvuru yaptım, 1 hafta sonra otomatik red geldi. Neden elendiğime dair hiçbir açıklama yoktu..."
              />
            </label>

            <button
              type="button"
              className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-surface transition hover:-translate-y-0.5 hover:bg-accentDark"
            >
              Anonim deneyimi gönder
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}   
