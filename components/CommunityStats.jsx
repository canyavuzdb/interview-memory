import { communityStats } from '@/data/surveys'

export default function CommunityStats() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-[#E2DDD4] bg-[#191714] p-6 text-[#FFFCF7] shadow-[0_24px_80px_rgba(25,23,20,0.12)] md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C4D0C6]">
              Topluluk verisi
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Sessiz kalan başvurular sadece senin başına gelmiyor olabilir.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#D8D1C7]">
              Otomatik red, ghosting ve feedback almayan süreçler tek tek
              kaybolmasın. Bir araya geldiklerinde şirketlerin işe alım
              davranışlarını görünür kılan sinyallere dönüşür.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {communityStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5"
              >
                <p className="text-3xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-[#FFFCF7]">
                  {stat.label}
                </p>
                <p className="mt-2 text-xs leading-5 text-[#BEB5A7]">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}