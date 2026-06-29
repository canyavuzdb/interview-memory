import { EyeOff, LockKeyhole, ShieldCheck, UserCheck } from 'lucide-react'

const trustItems = [
  {
    title: 'Kayıt gerekmiyor',
    description: 'Anketlere katılmak için hesap oluşturmak zorunda değilsin.',
    icon: UserCheck,
  },
  {
    title: 'Anonim katılım',
    description: 'İsim, e-posta veya kişisel bilgi paylaşmadan katkı verebilirsin.',
    icon: EyeOff,
  },
  {
    title: 'Güvenli veri yaklaşımı',
    description: 'Kişi isimleri, gizli dokümanlar ve hakaret içeren içerikler yayınlanmaz.',
    icon: ShieldCheck,
  },
  {
    title: 'Moderasyonlu paylaşım',
    description: 'Toplanan deneyimler public görünmeden önce kontrol edilecek şekilde tasarlanır.',
    icon: LockKeyhole,
  },
]

export default function AnonymousTrustSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-4 md:grid-cols-4">
        {trustItems.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.title}
              className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-sm"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-surfaceMuted text-accentDark">
                <Icon size={21} />
              </div>
              <h3 className="text-base font-semibold tracking-tight text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {item.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
