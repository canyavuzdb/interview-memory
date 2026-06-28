import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import SurveyCarousel from '../../components/SurveyCarousel'

export default function SurveysPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF] text-[#191714]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#706A61] transition hover:text-[#191714]"
        >
          <ArrowLeft size={16} />
          Ana sayfaya dön
        </Link>
      </div>

      <section className="mx-auto max-w-7xl px-5 pb-6 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5B6F64]">
          Anketler
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
          Kayıt olmadan anonim katkı ver.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[#706A61]">
          Şirket deneyimini veya başvuru/mülakat oranını paylaşarak adayların
          işe alım süreçlerini daha görünür hale getirmesine katkı sağlayabilirsin.
        </p>
      </section>

      <SurveyCarousel />
    </main>
  )
}