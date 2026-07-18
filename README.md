<p align="center">
  <img
    src="./app/icon.svg"
    width="72"
    alt="Interview Memory logosu"
  />
</p>

# Interview Memory

İşe alım süreçlerini kişisel deneyimlerden ortak içgörülere dönüştüren açık kaynak
bir platform.

Interview Memory; adayların başvuru ve mülakat deneyimlerini anonim biçimde
paylaşmasını, kendi süreçlerini benzer aday gruplarıyla karşılaştırmasını ve
şirketlerin işe alım yaklaşımlarını toplu veriler üzerinden incelemesini hedefler.

## Neler sunuyor?

- Başvuru ve şirket deneyimi için anonim anket akışları
- Rol ve şirket bazlı işe alım benchmarkları
- Başvuru hareketliliği ve şirket geri dönüş raporları
- Türkçe ve İngilizce arayüz
- Responsive, açık ve koyu tema desteği

## Proje durumu

Proje aktif geliştirme aşamasındadır. Arayüz ve raporlama deneyimi kullanılabilir
durumdadır; gösterilen benchmark değerleri şimdilik temsilidir ve üretim verisi
değildir. Gerçek veritabanı şeması, kimlik doğrulama ve yetkilendirme katmanları
aşamalı olarak eklenmektedir.

## Yerelde çalıştırma

Node.js 24 ve npm 11 kullanılır.

```bash
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır.

## Yerel Supabase

Backend geliştirmeleri için Docker çalışırken yerel Supabase ortamı açılabilir:

```bash
npm run db:start
npm run db:status
npm run db:reset
npm run db:lint
npm run db:test
npm run db:types
npm run db:stop
```

`db:start`, özel `api` şemasını temiz kurulumda oluşturabilmek için önce
veritabanını hazırlar, ardından yerel Supabase servislerini yeniden başlatır.
`db:reset` ise yerel veritabanındaki tüm verileri siler ve migration dosyalarını
baştan uygular; yalnızca silinebilir geliştirme verileriyle kullanılmalıdır.

Yerel Supabase ortamı yalnızca geliştirme ve test içindir; dış trafiğe
açılmamalıdır. İlk başlatmadan sonra yerel değerler
`npm run db:status -- -o env` ile görüntülenebilir. Çıktıdaki `API_URL`,
`PUBLISHABLE_KEY` ve `SECRET_KEY` değerleri sırasıyla `.env.local` içindeki
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ve
`SUPABASE_SECRET_KEY` alanlarına yazılır. `.env.local` commit edilmez;
`SUPABASE_SECRET_KEY` yalnızca sunucu tarafında kullanılmalıdır.
Migration dosyaları veritabanı şemasının tek kaynağıdır. Şema değiştiğinde
üretilen TypeScript tipleri de `npm run db:types` ile yenilenir.

## Kalite kontrolü

Lint, tip kontrolü, testler, coverage ve production build tek komutla çalışır:

```bash
npm run check
```

## Teknolojiler

Next.js, React, Tailwind CSS, Supabase ve Vitest.
