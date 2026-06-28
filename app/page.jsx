import Link from 'next/link'
import { ArrowRight, BarChart3, Building2, Search, Sparkles } from 'lucide-react'
import AnonymousTrustSection from '@/components/AnonymousTrustSection'
import CommunityStats from '@/components/CommunityStats'
import SurveyCarousel from '@/components/SurveyCarousel'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF] text-[#191714]">
      <header className="sticky top-0 z-30 border-b border-[#E2DDD4]/80 bg-[#F7F4EF]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#191714] text-[#FFFCF7]">
              IM
            </div>
            <div>
              <p className="text-sm font-semibold leading-none tracking-tight">
                Interview Memory
              </p>
              <p className="mt-1 hidden text-xs text-[#706A61] sm:block">
                Anonymous hiring signals
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#706A61] md:flex">
            <a href="#surveys" className="transition hover:text-[#191714]">
              Anketler
            </a>
            <a href="#how-it-works" className="transition hover:text-[#191714]">
              Nasıl çalışır?
            </a>
            <a href="#stats" className="transition hover:text-[#191714]">
              Veriler
            </a>
          </nav>

          <a
            href="#surveys"
            className="rounded-full bg-[#191714] px-4 py-2 text-sm font-semibold text-[#FFFCF7] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#31443A]"
          >
            Anonim katıl
          </a>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#E2DDD4] bg-[#FFFCF7] px-4 py-2 text-sm text-[#706A61] shadow-sm">
            <Sparkles size={16} className="text-[#5B6F64]" />
            Kayıt olmadan anonim katkı
          </div>

          <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.055em] text-[#191714] sm:text-6xl lg:text-7xl">
            Başvuruların kara deliğe mi düşüyor?
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#706A61]">
            Otomatik red, ghosting ve feedback almayan süreçler artık veri
            oluyor. Interview Memory, adayların başvuru ve mülakat
            deneyimlerini anonim şekilde toplayarak işe alım süreçlerini
            görünür kılar.
          </p>

          <p className="mt-5 max-w-xl text-xl font-semibold tracking-tight text-[#191714]">
            Şirketler seni değerlendiriyor. Sen de süreci ölç.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#surveys"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#191714] px-6 py-3 text-sm font-semibold text-[#FFFCF7] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#31443A]"
            >
              Anketleri keşfet
              <ArrowRight size={17} />
            </a>

            <Link
              href="/surveys/application-benchmark"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D9D2C7] bg-[#FFFCF7] px-6 py-3 text-sm font-semibold text-[#191714] shadow-sm transition hover:-translate-y-0.5 hover:border-[#BEB5A7]"
            >
              Kaç başvuruya mülakat düşüyor?
              <Search size={17} />
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-10 hidden h-32 w-32 rounded-full bg-[#D8CDBD] blur-3xl lg:block" />
          <div className="absolute -bottom-8 right-4 hidden h-40 w-40 rounded-full bg-[#C4D0C6] blur-3xl lg:block" />

          <div className="relative overflow-hidden rounded-[2rem] border border-[#E2DDD4] bg-[#FFFCF7] p-5 shadow-[0_24px_80px_rgba(25,23,20,0.08)]">
            <div className="rounded-[1.5rem] border border-[#E2DDD4] bg-[#F7F4EF] p-5">
              <p className="text-sm font-semibold text-[#191714]">
                Topluluk sinyali
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                Benzer adaylar kaç başvuruda dönüş alıyor?
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#706A61]">
                Deneyim, rol ve network verileriyle başvuru süreçlerinin
                görünmeyen tarafını ölçülebilir hale getiriyoruz.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#E2DDD4] bg-[#FFFCF7] p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#191714] text-[#FFFCF7]">
                    <Building2 size={20} />
                  </div>
                  <p className="text-sm font-semibold">
                    Şirket deneyimi
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#706A61]">
                    Başvuru, red, ghosting, HR ve mülakat süreci sinyalleri.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E2DDD4] bg-[#FFFCF7] p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#191714] text-[#FFFCF7]">
                    <BarChart3 size={20} />
                  </div>
                  <p className="text-sm font-semibold">
                    Başvuru benchmark
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#706A61]">
                    Kaç başvuruya dönüş, HR görüşmesi ve teknik mülakat düşüyor?
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-[#E2DDD4] bg-[#191714] p-5 text-[#FFFCF7]">
              <p className="text-sm font-semibold text-[#C4D0C6]">
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
          <div className="rounded-[1.75rem] border border-[#E2DDD4] bg-[#FFFCF7] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5B6F64]">
              01
            </p>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">
              Anket seç
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#706A61]">
              Şirket deneyimini paylaşabilir ya da başvuru/mülakat oranını
              topluluk verisine ekleyebilirsin.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-[#E2DDD4] bg-[#FFFCF7] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5B6F64]">
              02
            </p>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">
              Anonim doldur
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#706A61]">
              Kayıt olmadan sürecin nerede kaldığını, dönüş alıp almadığını ve
              feedback durumunu paylaş.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-[#E2DDD4] bg-[#FFFCF7] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5B6F64]">
              03
            </p>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">
              Veri oluşsun
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#706A61]">
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
        <div className="rounded-[2rem] border border-[#E2DDD4] bg-[#FFFCF7] p-6 text-center shadow-sm md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5B6F64]">
            Katkın önemli
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Başvuru süreçleri sessiz kaldıkça belirsizlik büyür. Paylaşıldıkça
            veri olur.
          </h2>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/surveys/company-experience"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#191714] px-6 py-3 text-sm font-semibold text-[#FFFCF7] transition hover:-translate-y-0.5 hover:bg-[#31443A]"
            >
              Şirket deneyimi paylaş
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/surveys/application-benchmark"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D9D2C7] bg-[#F7F4EF] px-6 py-3 text-sm font-semibold text-[#191714] transition hover:-translate-y-0.5 hover:border-[#BEB5A7]"
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