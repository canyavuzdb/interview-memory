import { ShieldCheck, Sparkles } from 'lucide-react';

export default function ShareExperienceCard() {
  return (
    <section id="share" className="container-page py-16 sm:py-20">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <div className="rounded-3xl bg-accentDark p-7 text-surface shadow-soft sm:p-9">
          <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            Anonim paylaşım akışı
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Mülakatını unutma. Deneyimini veriye dönüştür.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/72 sm:text-base">
            Adaylar yıllardır değerlendiriliyor. Bu kez işe alım süreçlerinin şeffaflığını,
            saygısını, hızını ve feedback kalitesini adaylar görünür kılıyor.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-white/80 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/8 p-4">
              <ShieldCheck className="mb-3" size={20} />
              Kişi ismi, gizli dosya ve hakaret içeren paylaşımlar filtrelenir.
            </div>
            <div className="rounded-2xl bg-white/8 p-4">
              <Sparkles className="mb-3" size={20} />
              Sistem deneyimden hazırlık önerisi ve olası gelişim alanları çıkarır.
            </div>
          </div>
        </div>

        <form className="glass-panel rounded-3xl p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium">Şirket</span>
              <input className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none transition focus:border-accent" placeholder="Örn. Northstar Fintech" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Rol</span>
              <input className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none transition focus:border-accent" placeholder="Frontend Developer" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Süreç sonucu</span>
              <select className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none transition focus:border-accent">
                <option>Devam ediyor</option>
                <option>Olumlu sonuçlandı</option>
                <option>Olumsuz sonuçlandı</option>
                <option>Aday süreci bıraktı</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Aday deneyimi skoru</span>
              <select className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none transition focus:border-accent">
                <option>8 / 10</option>
                <option>7 / 10</option>
                <option>6 / 10</option>
                <option>5 / 10</option>
                <option>4 / 10</option>
              </select>
            </label>
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-sm font-medium">Sence süreçte neler iyiydi, neler kötüydü?</span>
            <textarea className="min-h-32 w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none transition focus:border-accent" placeholder="Geri dönüş hızlıydı ama maaş aralığı çok geç paylaşıldı..." />
          </label>

          <button type="button" className="mt-5 w-full rounded-2xl bg-accentDark px-5 py-3 text-sm font-semibold text-surface shadow-card transition hover:-translate-y-0.5 hover:bg-accent">
            Deneyimi anonim paylaş
          </button>
        </form>
      </div>
    </section>
  );
}
