export const surveys = [
  {
    id: 'company-experience',
    href: '/surveys/company-experience',
    eyebrow: 'Anket 01',
    title: 'Şirketin ile deneyimini paylaş',
    description:
      'Başvurdun, otomatik red aldın, hiç dönüş alamadın ya da mülakata girdin. Bu şirketle geldiğin son noktayı anonim paylaş.',
    duration: '3-5 dk',
    icon: 'building',
    cta: 'Bu anketi doldur',
    bullets: [
      'Şirket adı ve rol',
      'Süreç hangi noktada kaldı?',
      'Otomatik red veya ghosting oldu mu?',
      'HR, teknik veya final görüşme yaşandı mı?',
      'Feedback verildi mi?',
    ],
    tags: ['Otomatik red', 'Ghosting', 'Feedback', 'HR süreci'],
  },
  {
    id: 'application-benchmark',
    href: '/surveys/application-benchmark',
    eyebrow: 'Anket 02',
    title: 'Kaç başvuruya bir mülakat düşüyor?',
    description:
      'Benzer deneyim, rol ve network seviyesindeki adayların kaç başvuruda dönüş, HR görüşmesi ve teknik mülakat aldığını anlamamıza katkı sağla.',
    duration: '2-4 dk',
    icon: 'chart',
    cta: 'Başvuru oranımı paylaş',
    bullets: [
      'Son dönemde kaç başvuru yaptın?',
      'Kaç şirket dönüş yaptı?',
      'Kaç HR görüşmesi aldın?',
      'Kaç teknik görüşmeye girdin?',
      'Referans veya network etkisi var mıydı?',
    ],
    tags: ['Başvuru oranı', 'Mülakat şansı', 'Network', 'Benchmark'],
  },
]

export const communityStats = [
  {
    value: '1.248',
    label: 'Anonim katkı',
    description: 'Başvuru ve mülakat süreci sinyali',
  },
  {
    value: '%41',
    label: 'Sessiz kalan süreç',
    description: 'Dönüş yapılmadığı belirtilen deneyimler',
  },
  {
    value: '%12',
    label: 'Feedback oranı',
    description: 'Olumsuz süreçte anlamlı feedback alan adaylar',
  },
  {
    value: '18',
    label: 'Başvuru / mülakat',
    description: 'Mock veriye göre ilk görüşme ortalaması',
  },
]