import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import SurveyCarousel from '@/components/SurveyCarousel'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata = {
  title: 'Anonim Anketler',
  description:
    'Şirket deneyimini veya başvuru ve mülakat oranlarını kayıt olmadan anonim olarak paylaş.',
}

export default function SurveysPage() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft size={16} />
          Ana sayfaya dön
        </Link>
        <ThemeToggle />
      </div>

      <section className="mx-auto max-w-7xl px-5 pb-6 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          Anketler
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
          Kayıt olmadan anonim katkı ver.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
          Şirket deneyimini veya başvuru/mülakat oranını paylaşarak adayların
          işe alım süreçlerini daha görünür hale getirmesine katkı sağlayabilirsin.
        </p>
      </section>

      <SurveyCarousel />
    </main>
  )
}
