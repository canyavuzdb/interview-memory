# Mülakat Atlası UI Starter

Backend içermeyen, mock data ile çalışan sade bir Next.js + Tailwind CSS arayüz başlangıcıdır.

## İçerik

- Next.js App Router
- Tailwind CSS
- Responsive landing page
- Off-white / warm neutral color palette
- Mock şirket kartları
- Hiring Experience Score alanları
- Anonim deneyim paylaşım formu taslağı

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda:

```bash
http://localhost:3000
```

## Renk Paleti

```txt
canvas:       #F7F4EF
surface:      #FFFCF7
surfaceMuted: #F1EDE6
ink:          #191714
muted:        #706A61
line:         #E2DDD4
accent:       #5B6F64
accentDark:   #31443A
warning:      #9A6B2F
danger:       #9B4A45
```

## Önerilen Sonraki Adımlar

- `/sirket/[slug]` detay sayfası ekle
- `/deneyim-paylas` sayfasını ayrı route'a taşı
- Form validasyonu ekle
- Mock datayı ileride API veya database katmanına bağla
- GitHub Actions ile lint/build pipeline ekle
- Vercel'e bağlayıp preview deployments aktif et
