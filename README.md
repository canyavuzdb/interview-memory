# Mülakat Atlası

Mülakat Atlası, adayların işe alım süreçlerini anonim olarak paylaşabildiği ve toplu
benchmark raporlarını inceleyebildiği bir Next.js uygulamasıdır.

## Gereksinimler

- Node.js 24
- npm 11

Sürüm sözleşmesi `.nvmrc`, `package.json#engines` ve CI tarafından birlikte uygulanır.

## Yerel kurulum

```bash
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde açılır.

## Kalite komutları

```bash
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
```

Tüm yerel kalite kapıları tek komutla çalıştırılabilir:

```bash
npm run check
```

## Ortam değişkenleri

| Değişken | Kullanım |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'si |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Tarayıcıda kullanılan publishable anahtar |

`NEXT_PUBLIC_` önekli değişkenler tarayıcı paketine dahil edilir. Gerçek geliştirme
değerleri yalnızca Git tarafından yok sayılan `.env.local` dosyasında tutulmalıdır.
