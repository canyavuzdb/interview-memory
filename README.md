# Mülakat Atlası

Mülakat Atlası, adayların işe alım süreçlerini anonim olarak paylaşabildiği ve toplu
benchmark raporlarını inceleyebildiği bir Next.js uygulamasıdır.

## Gereksinimler

- Node.js 24
- npm 11
- Docker Desktop veya uyumlu bir Docker çalışma ortamı (yerel Supabase için)

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

## Yerel Supabase

Supabase CLI proje bağımlılığı olarak sabitlenmiştir; global CLI kurulumu gerekmez.
Yerel Supabase servisleri yalnızca Docker üzerinde çalışır.

```bash
npm run db:start
npm run db:status
npm run db:reset
npm run db:lint
npm run db:test
npm run db:stop
```

`db:reset` yalnızca yerel veritabanını yeniden oluşturur ve içindeki yerel veriyi
siler. `db:test`, B03'te ilk pgTAP sözleşmeleri eklenene kadar `NOTESTS` sonucu
verir; bu sonuç henüz bir veritabanı test başarısı değildir.

Yerel stack geliştirme/test içindir; TLS, production rate limitleri ve güvenli
production kimlik bilgileri sağlamaz, bu nedenle dış trafiğe açılmamalıdır.
Güvenilmeyen bir ağda çalışırken servisleri yalnızca loopback'e bağlayan ayrı bir
Docker ağı kullanın:

```bash
docker network create -o 'com.docker.network.bridge.host_binding_ipv4=127.0.0.1' local-network
npm run db:start -- --network-id local-network
```

Bu aşamada uzak bir projeye `link`, `pull` veya `push` yapılmaz. Uzak proje
bağlandığında `supabase/config.toml` içindeki PostgreSQL ana sürümü, uzak projede
`SHOW server_version;` ile doğrulanmalıdır.

## Ortam değişkenleri

| Değişken | Kullanım |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'si |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Tarayıcıda kullanılan `sb_publishable_...` anahtarı |
| `SUPABASE_SECRET_KEY` | Yalnız sunucuda kullanılan `sb_secret_...` anahtarı |

`NEXT_PUBLIC_` önekli değişkenler tarayıcı paketine dahil edilir. Gerçek geliştirme
değerleri yalnızca Git tarafından yok sayılan `.env.local` dosyasında tutulmalıdır.
`SUPABASE_SECRET_KEY`, RLS'i aşabilen ayrıcalıklı erişim sağladığından tarayıcı
kodunda kullanılmamalı ve hiçbir zaman `NEXT_PUBLIC_` öneki almamalıdır.
Bu temel, artık kullanım dışına alınma sürecindeki legacy `anon` ve `service_role`
JWT anahtarlarını bilinçli olarak kabul etmez.
