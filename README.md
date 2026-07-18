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
npm run db:stop
```

Yerel Supabase ortamı yalnızca geliştirme ve test içindir; dış trafiğe
açılmamalıdır. Gerekli değişkenler `.env.example` içerisinde listelenmiştir.
`SUPABASE_SECRET_KEY` yalnızca sunucu tarafında kullanılmalıdır.

## Kalite kontrolü

Lint, tip kontrolü, testler, coverage ve production build tek komutla çalışır:

```bash
npm run check
```

## Teknolojiler

Next.js, React, Tailwind CSS, Supabase ve Vitest.
