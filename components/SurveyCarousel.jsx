import SurveyCard from './SurveyCard'
import { surveys } from '@/data/surveys'

export default function SurveyCarousel() {
  return (
    <section id="surveys" className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Anonim anketler
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Kayıt olmadan katıl. Deneyimini veriye dönüştür.
          </h2>
        </div>

        <p className="max-w-md text-sm leading-7 text-muted">
          Seçtiğin ankete göre ayrı bir sayfaya yönlendirilirsin. İsim, e-posta
          veya üyelik zorunluluğu yok.
        </p>
      </div>

      <div className="flex snap-x gap-5 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible">
        {surveys.map((survey) => (
          <div key={survey.id} className="min-w-[88%] sm:min-w-0">
            <SurveyCard survey={survey} />
          </div>
        ))}
      </div>
    </section>
  )
}