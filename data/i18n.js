export const supportedLocales = ['tr', 'en']

export function isSupportedLocale(locale) {
  return supportedLocales.includes(locale)
}

export function getMessages(locale) {
  return messages[locale] ?? messages.tr
}

const responseStatuses = {
  tr: [
    { label: 'Zamanında', value: '%34', width: '34%', tone: 'timely' },
    { label: 'Gecikmiş', value: '%13', width: '13%', tone: 'late' },
    { label: 'Otomatik ret', value: '%12', width: '12%', tone: 'rejected' },
    { label: 'Yanıtsız', value: '%41', width: '41%', tone: 'silent' },
  ],
  en: [
    { label: 'On time', value: '34%', width: '34%', tone: 'timely' },
    { label: 'Delayed', value: '13%', width: '13%', tone: 'late' },
    { label: 'Automated rejection', value: '12%', width: '12%', tone: 'rejected' },
    { label: 'No response', value: '41%', width: '41%', tone: 'silent' },
  ],
}

const messages = {
  tr: {
    localeName: 'Türkçe',
    common: {
      homeAria: 'Interview Memory ana sayfa',
      languageLabel: 'Dil seçimi',
      backHome: 'Ana sayfaya dön',
      themeToggle: 'Açık ve koyu tema arasında geçiş yap',
      themeTitle: 'Temayı değiştir',
    },
    metadata: {
      home: {
        title: 'Interview Memory — Anonim İşe Alım Verileri',
        description:
          'Adayların başvuru ve mülakat deneyimlerini anonim, karşılaştırılabilir işe alım verilerine dönüştüren platform.',
      },
      surveys: {
        title: 'Anonim Anketler',
        description:
          'Şirket deneyimini veya başvuru ve mülakat oranlarını kayıt olmadan anonim olarak paylaş.',
      },
      companyExperience: {
        title: 'Şirket Deneyimini Paylaş',
        description:
          'Bir şirketle yaşadığın başvuru veya mülakat deneyimini kayıt olmadan anonim olarak paylaş.',
      },
      applicationBenchmark: {
        title: 'İş Arama Sürecini Karşılaştır',
        description:
          'Başvuru sürecini anonim olarak paylaş ve temsili aday grubu verileriyle karşılaştır.',
      },
      login: {
        title: 'Giriş Yap',
        description:
          'Google hesabınla Interview Memory giriş akışını incele.',
      },
      notFound: {
        title: 'Sayfa Bulunamadı',
        description:
          'Aradığın sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.',
      },
    },
    header: {
      navLabel: 'Ana navigasyon',
      mobileNavLabel: 'Mobil navigasyon',
      surveys: 'Anketler',
      howItWorks: 'Nasıl çalışır?',
      data: 'Veriler',
      community: 'İşe alım verileri',
      surveyMenuLabel: 'Anket seçenekleri',
      surveyTypes: 'Anket türleri',
      applicationBenchmark: 'İş arama sürecini karşılaştır',
      applicationBenchmarkDescription: 'Başvuru hacmini, süreyi ve dönüşüm oranlarını benzer aday gruplarıyla karşılaştır.',
      companyExperience: 'Aday deneyimini değerlendir',
      companyExperienceDescription: 'Şirketin başvuru, mülakat ve geri bildirim sürecini anonim olarak değerlendir.',
      menuOpen: 'Menüyü aç',
      menuClose: 'Menüyü kapat',
      signIn: 'Giriş yap',
    },
    footer: {
      eyebrow: '04 / Proje ve kaynaklar',
      description:
        'Açık kaynak bir işe alım verisi projesi olan Interview Memory, adayların iş arama süreçlerini ve şirketlerin işe alım uygulamalarını anonim, karşılaştırılabilir veriye dönüştürür.',
      productTitle: 'Ürün',
      surveys: 'Anketler',
      signals: 'İşe alım verileri',
      signIn: 'Giriş yap',
      projectTitle: 'Proje',
      repository: 'GitHub deposu',
      creator: 'Can Yavuz',
      plannedTitle: 'Planlanan sayfalar',
      planned: ['Hakkımızda', 'Sık sorulan sorular', 'İletişim', 'Gizlilik', 'Kullanım koşulları', 'Çerez ayarları'],
      plannedNote: 'Bu rotalar bilgi mimarisi tamamlandığında etkinleşecek.',
      sourceNote: 'Açık kaynak · Ön yüz prototipi',
      copyright: 'Interview Memory',
    },
    login: {
      eyebrow: 'Hesap erişimi',
      title: 'Katkılarını tek yerde takip et.',
      description:
        'Giriş yaptığında anket yanıtlarını takip edebilir ve hesap sahiplerine sunulan ayrıntılı işe alım analizlerine erişebilirsin.',
      benefitsEyebrow: 'Hesapla neler değişir?',
      benefits: [
        'Anonim anket geçmişini tek yerde takip et',
        'Kaydettiğin şirket ve rol karşılaştırmalarına geri dön',
        'Üyelere özel ayrıntılı analizlere eriş',
      ],
      accessTitle: 'Hesabına hızlıca eriş',
      accessDescription:
        'Google hesabınla giriş yapabilir veya hesap oluşturmadan anonim olarak kullanmaya devam edebilirsin.',
      googleCta: 'Google ile devam et',
      alternative: 'ya da',
      previewNotice:
        'Bu bir arayüz önizlemesidir. Google OAuth henüz bağlanmadı ve hiçbir bilgi gönderilmedi.',
      privacyNote:
        'Google ile devam ettiğinde temel hesap bilgilerin giriş için kullanılır; anket yanıtların herkese açık kimliğinle paylaşılmaz.',
      anonymousCta: 'Anonim kullanmaya devam et',
    },
    notFound: {
      eyebrow: '404',
      title: 'Aradığın sayfa bulunamadı.',
      description:
        'Bağlantı değiştirilmiş veya sayfa kaldırılmış olabilir. Ana sayfaya dönebilir ya da anonim anketleri inceleyebilirsin.',
      homeCta: 'Ana sayfaya dön',
      surveysCta: 'Anketleri keşfet',
      codeLabel: 'Sayfa bulunamadı',
    },
    home: {
      hero: {
        eyebrow: 'İş arama karşılaştırması',
        title: 'İş arama sürecinde',
        titleHighlight: 'neredesin?',
        subtitle: 'İş arama süreni benzer rol ve deneyim gruplarıyla karşılaştır.',
        detailsLabel: 'Karşılaştırmada kullanılan bilgiler',
        details: ['Rol · deneyim · süre', 'Karşılaştırma grubu'],
        signalsLabel: 'Başvuru yanıt durumları',
        signals: responseStatuses.tr.map(({ label }) => label),
        descriptionParts: {
          pre: 'Başvuru sonuçlarını ',
          highlight: 'anonim',
          post: ' olarak paylaş; sürenin benzer aday grubunun medyanına göre nasıl konumlandığını incele.',
        },
        explore: 'Sürecini karşılaştır',
        benchmark: 'İşe alım verilerini incele',
      },
      signal: {
        eyebrow: 'İşe alım verileri',
        title: 'Benzer aday gruplarında başvuru dönüşüm oranları nasıl?',
        description:
          'Rol, deneyim ve referans bilgileriyle başvuru yanıt ve dönüşüm oranlarını karşılaştırıyoruz.',
        companyTitle: 'Aday deneyimi',
        companyDescription:
          'Başvuru sonucu, yanıtsızlık, İK görüşmesi ve mülakat süreci verileri.',
        benchmarkTitle: 'Başvuru dönüşüm oranları',
        benchmarkDescription:
          'Başvurudan yanıta, İK görüşmesine, teknik mülakata ve teklife geçiş oranları.',
        panelLabel: 'İşe alım verisi özeti',
        panelType: 'Analiz paneli',
        sampleData: 'Örnek veri',
        sampleSize: '1.248 süreç kaydı',
        methodology:
          'Bu prototipteki değerler örnek amaçlıdır; gerçek kullanıcı verisine dayanmaz.',
        flowChartLabel: 'Başvuru aşamaları',
        distributionChartLabel: 'Süreç dağılımı',
        viewCta: 'Analizi ve anketi incele',
        views: [
          {
            id: 'application-marathon',
            type: 'funnel',
            path: '/surveys/application-benchmark',
            tabLabel: 'Başvuru dönüşümü',
            eyebrow: 'Analiz / Başvurudan teklife',
            title: 'Bir teklif için ortalama kaç başvuru gerekiyor?',
            description:
              'Temsili veri seti, başvurudan yanıta, görüşmeye ve teklife geçiş oranlarını medyan süreyle birlikte gösterir.',
            primaryValue: '72',
            primaryLabel: 'Başvuru',
            secondaryValue: '14 hafta',
            secondaryLabel: 'Medyan süre',
            chartLabel: 'Başvuru dönüşüm hunisi',
            stages: [
              { label: 'Başvuru', value: '72', share: '%100' },
              { label: 'Yanıt', value: '28', share: '%39' },
              { label: 'Mülakat', value: '8', share: '%11' },
              { label: 'Teklif', value: '1', share: '%1,4' },
            ],
          },
          {
            id: 'company-report',
            type: 'funnel',
            path: '/surveys/company-experience',
            tabLabel: 'Aday deneyimi',
            eyebrow: 'Analiz / Aday deneyimi',
            title: 'Adayların en sık bildirdiği üç süreç sorunu',
            description:
              'Anonim süreç kayıtları, işveren yanıtları, takip iletişimi ve geri bildirimde tekrar eden sorunları ortaya koyar.',
            primaryValue: '847',
            primaryLabel: 'Süreç kaydı',
            secondaryValue: '%41',
            secondaryLabel: 'Yanıtsız başvuru',
            chartLabel: 'En sık raporlanan sorunlar',
            stages: [
              { label: 'Ghosting', value: '347', share: '%41' },
              { label: 'Gecikme', value: '288', share: '%34' },
              { label: 'Gerekçesiz ret', value: '237', share: '%28' },
              { label: 'Diğer', value: '127', share: '%15' },
            ],
          },
          {
            id: 'silent-processes',
            type: 'signal',
            path: '/surveys/hr-process',
            tabLabel: 'Yanıt performansı',
            eyebrow: 'Analiz / İK süreç şeffaflığı',
            title: 'Taahhüt edilen sürede yanıtlanmayan süreçlerin oranı %58',
            description:
              'İK ekiplerinin yanıt sürelerini, takip iletişimini ve ret gerekçesi paylaşma oranlarını ölçüyoruz.',
            primaryValue: '%58',
            primaryLabel: 'Taahhüt edilen sürede yanıtlanmadı',
            secondaryValue: '%12',
            secondaryLabel: 'Ret gerekçesi paylaşıldı',
            chartLabel: 'Yanıt durumu',
            distribution: responseStatuses.tr,
          },
          {
            id: 'salary-reality',
            type: 'comparison',
            path: '/surveys/salary-benchmark',
            tabLabel: 'Ücret karşılaştırması',
            eyebrow: 'Karşılaştırma / İlan ve teklif',
            title: 'İlandaki ücret aralığı ile nihai teklif farklılaşabiliyor',
            description:
              'Aday beklentisini, ilandaki ücret aralığını ve nihai teklifi toplulaştırılmış verilerle karşılaştırıyoruz.',
            comparison: {
              promiseLabel: 'Beklenti',
              promiseValue: '42K ₺',
              promiseDescription: 'Adayların başvuru öncesi hedeflediği medyan net maaş.',
              realityLabel: 'Teklif',
              realityValue: '34K ₺',
              realityDescription: 'Adaylara sunulan medyan net maaş teklifi.',
              deltaLabel: 'Beklenti ile teklif arasındaki fark',
              deltaValue: '-%19',
            },
          },
        ],
        bottomEyebrow: 'Aday deneyimlerinden işe alım verisine',
        bottomText:
          'Benzer kayıtlar yeterli örnekleme ulaştığında yanıt süreleri, dönüşüm oranları ve aday deneyimi ölçülebilir.',
      },
      surveyPrompt: {
        meta: 'Kısa form · anonim yanıt',
        cta: 'Anketleri incele',
        items: [
          {
            eyebrow: '01 / İş arama karşılaştırması',
            title: 'İş arama metriklerini benzer aday gruplarıyla karşılaştır.',
            description: 'Başvuru, yanıt, İK görüşmesi, teknik görüşme ve teklif sayılarını paylaş; dönüşüm oranlarını incele.',
          },
          {
            eyebrow: '01 / Aday deneyimi değerlendirmesi',
            title: 'Şirketin başvuru ve mülakat sürecini değerlendir.',
            description: 'Yanıt süresi, yanıtsızlık, geri bildirim ve mülakat uygulamalarını anonim olarak paylaş.',
          },
        ],
      },
      howItWorks: [
        {
          title: 'Anketini seç',
          description:
            'İş arama metriklerini karşılaştır veya bir şirketin aday deneyimi sürecini değerlendir.',
        },
        {
          title: 'Deneyimini paylaş',
          description:
            'Sürecin hangi aşamada kaldığını, yanıt ve geri bildirim durumunu kimliğin yayınlanmadan aktar.',
        },
        {
          title: 'Sonuçlarını incele',
          description:
            'Yanıtın anonim ve gruplandırılmış veriye dahil edilir; sürecini benzer aday gruplarıyla karşılaştırırsın.',
        },
      ],
      finalCta: {
        eyebrow: 'Örnekleme katkıda bulun',
        title:
          'Anonim katılımlar arttıkça karşılaştırmaların örneklem gücü artar.',
        company: 'Aday deneyimini paylaş',
        benchmark: 'Başvuru verilerini paylaş',
      },
    },
    trustItems: [
      {
        title: 'Kayıt gerekmiyor',
        description: 'Anketlere katılmak için hesap oluşturmak zorunda değilsin.',
      },
      {
        title: 'Anonim katılım',
        description:
          'İsim, e-posta veya kişisel bilgi paylaşmadan anketi tamamlayabilirsin.',
      },
      {
        title: 'Veri minimizasyonu',
        description:
          'Kişi isimleri, gizli dokümanlar ve hakaret içeren içerikler yayınlanmaz.',
      },
      {
        title: 'İçerik moderasyonu',
        description:
          'Toplanan deneyimler herkese açık sonuçlara dahil edilmeden önce kontrol edilir.',
      },
    ],
    surveyCarousel: {
      eyebrow: 'Anket seçimi',
      title: 'Yaşadığın sürece en yakın kaydı seç.',
      description:
        'Her anket üç kısa adımdan oluşur. Yanıtlar, işe alım metriklerini toplu ve anonim olarak analiz etmek için kullanılır.',
      includesLabel: 'Bu kayıtta neleri paylaşacaksın?',
    },
    surveyCards: [
      {
        id: 'company-experience',
        path: '/surveys/company-experience',
        eyebrow: 'Aday deneyimi değerlendirmesi',
        title: 'Şirketle yaşadığın deneyimi paylaş',
        description:
          'Başvuru, ret, yanıtsızlık veya mülakat aşamalarından oluşan deneyimini anonim olarak değerlendir.',
        duration: '3-5 dk',
        icon: 'building',
        cta: 'Bu anketi doldur',
        bullets: [
          'Şirket adı ve rol',
          'Süreç hangi noktada kaldı?',
          'Otomatik ret veya yanıtsız bırakılma oldu mu?',
          'İK, teknik veya final görüşmesi yapıldı mı?',
          'Geri bildirim verildi mi?',
        ],
        tags: ['Otomatik ret', 'Yanıtsızlık', 'Geri bildirim', 'İK süreci'],
      },
      {
        id: 'application-benchmark',
        path: '/surveys/application-benchmark',
        eyebrow: 'İş arama karşılaştırması',
        title: 'İş arama sürecini karşılaştır',
        description:
          'Rolünü, deneyimini ve temel başvuru sayılarını paylaş; süreni temsili aday grubu verileriyle karşılaştır.',
        duration: '1-2 dk',
        icon: 'chart',
        cta: 'Sürecimi karşılaştır',
        bullets: [
          'Hangi rolü ve çalışma modelini hedefliyorsun?',
          'İş araman ne kadar sürdü veya sürüyor?',
          'Kaç başvuru, görüşme ve teklif aldın?',
          'Maaş beklentin hangi aralıkta?',
          'Referans veya portföy etkisi var mıydı?',
        ],
        tags: ['İş arama süresi', 'Görüşmeye dönüşüm', 'Maaş bandı', 'Karşılaştırma'],
      },
      {
        id: 'hr-process',
        path: '/surveys/hr-process',
        eyebrow: 'İK süreç değerlendirmesi',
        title: 'İK sürecini değerlendir',
        description:
          'Başvuruna yanıt verildi mi? Süreç şeffaf mıydı? Ret gerekçesi paylaşıldı mı? İK ekibinin uygulamalarını anonim olarak değerlendir.',
        duration: '3-4 dk',
        icon: 'userSearch',
        cta: 'Süreci değerlendir',
        bullets: [
          'Taahhüt edilen ve gerçekleşen yanıt süresi',
          'Yanıtsız bırakılma hangi aşamada yaşandı?',
          'Ret gerekçesi paylaşıldı mı?',
          'İlgisiz veya uygunsuz sorular soruldu mu?',
          'İK profesyonelliği ve süreç şeffaflığı',
        ],
        tags: ['Yanıtsızlık', 'İK şeffaflığı', 'Geri bildirim', 'Süreç kalitesi'],
      },
      {
        id: 'salary-benchmark',
        path: '/surveys/salary-benchmark',
        eyebrow: 'Ücret ve teklif karşılaştırması',
        title: 'Ücret ve teklif deneyimini paylaş',
        description:
          'İlanda belirtilen maaş ile teklif edilen maaş aynı mıydı? Beklentin karşılandı mı? Maaş şeffaflığını anonim değerlendir.',
        duration: '2-3 dk',
        icon: 'wallet',
        cta: 'Maaş deneyimini paylaş',
        bullets: [
          'İlanda maaş belirtilmiş miydi?',
          'Beklentin ve teklif edilen maaş',
          'Pazarlık yapabildin mi?',
          'Yan haklar sunuldu mu?',
          'Teklif adil hissettirdi mi?',
        ],
        tags: ['Maaş şeffaflığı', 'Teklif', 'Pazarlık', 'Yan haklar'],
      },
    ],
    community: {
      eyebrow: '02 /',
      title: 'İşe alım verileri',
      note:
        'Örnek amaçlı veri seti / üretim verisi değildir',
      tabsLabel: 'İşe alım verisi görünümleri',
      cards: [
        {
          type: 'effort',
          code: '01 /',
          label: 'Başvuru dönüşümü',
          eyebrow: 'Başvurudan teklife',
          title: '1 teklif için ortalama 72 başvuru gerekiyor.',
          description: 'Başvuru, yanıt, görüşme ve teklif sayılarını birlikte değerlendirerek dönüşüm oranlarını analiz ediyoruz.',
          summary: 'Başvuruların yalnızca %11’i görüşmeye dönüşüyor.',
          path: '/surveys/application-benchmark',
          cta: 'Kendi sürecini karşılaştır',
          metrics: [
            { value: '72', label: 'Teklif başına başvuru' },
            { value: '14 hf', label: 'Medyan iş arama süresi' },
          ],
          chartLabel: '72 başvurunun dönüşüm hattı',
          chartAria: '72 başvurudan 28 yanıt, 8 görüşme ve 1 teklif oluşuyor.',
          stages: [
            { label: 'Başvuru', value: '72', share: '100%' },
            { label: 'Yanıt', value: '28', share: '39%' },
            { label: 'Görüşme', value: '8', share: '11%' },
            { label: 'Teklif', value: '1', share: '1.4%' },
          ],
        },
        {
          type: 'reliability',
          code: '02 /',
          label: 'Yanıt performansı',
          eyebrow: 'İşveren yanıt performansı',
          title: 'Her 10 başvurunun 4’ü yanıtsız kalıyor.',
          description: 'Zamanında yanıt, gecikme, otomatik ret ve yanıtsızlık ayrı sonuç kategorileri olarak ölçülür.',
          summary: 'Yanıtsız başvuru ve otomatik ret ayrı sonuç kategorileridir.',
          path: '/surveys/company-experience',
          cta: 'Aday deneyimini paylaş',
          chartLabel: 'Başvuru sonucu dağılımı',
          chartAria: 'Başvuruların yüzde 34’ü zamanında, yüzde 13’ü gecikmiş, yüzde 12’si otomatik ret ve yüzde 41’i yanıtsız.',
          distribution: responseStatuses.tr,
          metrics: [
            { value: '%58', label: 'Taahhüt edilen sürede yanıtlanmadı' },
            { value: '%12', label: 'Ret gerekçesi paylaşıldı' },
          ],
        },
        {
          type: 'coverage',
          code: '03 /',
          label: 'Örneklem kapsamı',
          eyebrow: 'Rol dağılımı / temsili',
          title: 'Örneklem hangi rol ailelerini kapsıyor?',
          description: 'Örneklemdeki rol dağılımı, hangi alanlarda daha güçlü karşılaştırmalar yapılabildiğini gösterir.',
          summary: 'Kayıt yoğunluğu iş ilanı talebini veya piyasa popülerliğini göstermez.',
          path: '/surveys/application-benchmark',
          cta: 'Alanındaki örnekleme katkıda bulun',
          chartLabel: 'Örneklemde temsil edilen rol aileleri',
          dataLabel: 'Temsili dağılım',
          chartAria: 'Temsili rol dağılımı: Yazılım yüzde 40, Ürün yüzde 20, Veri yüzde 14, Tasarım yüzde 12, Platform ve kalite yüzde 8, Diğer yüzde 6.',
          note: 'Yeterli örneklem oluşmayan alanlar “Diğer” altında gruplanır.',
          items: [
            { label: 'Yazılım', value: 40 },
            { label: 'Ürün', value: 20 },
            { label: 'Veri', value: 14 },
            { label: 'Tasarım', value: 12 },
            { label: 'Platform + QA', value: 8 },
            { label: 'Diğer', value: 6 },
          ],
        },
      ],
    },
    platformGuide: {
      eyebrow: '03 /',
      title: 'Platform işleyişi',
      note: 'Planlanan ürün akışı / ön yüz prototipi',
      controlsLabel: 'Platform bilgileri',
      prototypeNote:
        'Bu ön yüz prototipi yanıtları kaydetmez; gösterilen işe alım verileri örnek amaçlıdır.',
      panels: [
        {
          id: 'how',
          code: '01 /',
          label: 'Nasıl çalışır?',
          eyebrow: 'Yanıttan analize',
          title: 'Tekil süreç kayıtları karşılaştırılabilir işe alım verilerine dönüştürülür.',
          description:
            'Kısa formlar kişisel hikâyeyi değil, işe alım sürecinin ölçülebilir parçalarını toplamak üzere tasarlandı.',
          steps: [
            {
              code: '01 /',
              title: 'Sürecini paylaş',
              description: 'Rolünü, başvuru hacmini veya aday deneyimini kısa formda paylaş.',
            },
            {
              code: '02 /',
              title: 'Yanıtlar gruplandırılır',
              description:
                'Veri katmanı bağlandığında yanıtlar rol, deneyim ve süreç aşamasına göre anonim gruplara ayrılacak.',
            },
            {
              code: '03 /',
              title: 'Karşılaştırmayı incele',
              description:
                'Yeterli örneklem oluştuğunda sürecini benzer aday gruplarıyla karşılaştır.',
            },
          ],
        },
        {
          id: 'offerings',
          code: '02 /',
          label: 'Ne sunar?',
          eyebrow: 'Platform çıktıları',
          title: 'Tek bir kayıt, üç ayrı analiz alanına katkı sağlar.',
          description:
            'Planlanan ürün yapısında aynı süreç kaydı hem kişisel takibe hem de ortak işe alım bilgisinin oluşmasına hizmet eder.',
          items: [
            {
              code: '01 /',
              title: 'Kişisel süreç özeti',
              description: 'Başvuru hacmini, süreyi ve dönüşüm hattını tek görünümde takip et.',
            },
            {
              code: '02 /',
              title: 'Aday grubu karşılaştırması',
              description:
                'Sürecini benzer rol ve deneyim gruplarıyla karşılaştır.',
            },
            {
              code: '03 /',
              title: 'Şirket bazlı süreç analizi',
              description:
                'Tekrarlanan yanıtsızlık, gecikme ve geri bildirim uygulamalarını toplu olarak analiz et.',
            },
          ],
        },
        {
          id: 'faq',
          code: '03 /',
          label: 'Merak edilenler',
          eyebrow: 'Kısa yanıtlar',
          title: 'Platformla ilgili en temel üç soru.',
          description:
            'Bu aşamada ürünün çalışma biçimini anlamak için gereken kısa ve doğrudan yanıtlar.',
          faqs: [
            {
              question: 'Paylaşım gerçekten anonim mi?',
              answer:
                'Formlar ad, e-posta veya kişisel belge istemeyecek şekilde tasarlanır. Gerçek veri katmanında sonuçlar tekil kayıtlar yerine yeterli örnekleme ulaşan gruplar üzerinden sunulacaktır.',
            },
            {
              question: 'Her kayıt doğrudan yayınlanır mı?',
              answer:
                'Hayır. Planlanan akışta moderasyon ve minimum örneklem eşiğini geçmeyen kayıtlar herkese açık sonuçlara dahil edilmeyecektir.',
            },
            {
              question: 'Giriş yapmak neyi değiştirir?',
              answer:
                'Anonim yanıt için giriş zorunlu olmayacak. Hesap altyapısı devreye girdiğinde giriş; süreçlerini saklama, karşılaştırmaları takip etme ve kişisel iş günlüğüne erişme imkânı verecek.',
            },
          ],
        },
      ],
    },
    surveyIndex: {
      eyebrow: 'Aktif araştırma anketleri',
      title: 'İş arama ve aday deneyimi verilerine katkıda bulun.',
      activeCount: 'İki aktif anket',
      description:
        'Kendi başvuru metriklerini karşılaştır veya bir şirketin başvuru ve mülakat sürecini değerlendir.',
    },
    companyForm: {
      eyebrow: 'Anonim aday deneyimi anketi',
      title: 'Şirketle yaşadığın deneyimi paylaş',
      description:
        'Bu form, bir şirketle yaşadığın başvuru veya mülakat sürecinin hangi noktada kaldığını anonim şekilde paylaşman için tasarlandı. Kayıt olmak zorunda değilsin.',
      warning:
        'Lütfen kişi adı, e-posta, telefon, gizli doküman, özel vaka çalışması içeriği veya hakaret içeren ifade paylaşma.',
      company: 'Şirket adı',
      companyPlaceholder: 'Örn. ABC Teknoloji',
      role: 'Rol',
      rolePlaceholder: 'Örn. Frontend Developer',
      stage: 'Bu şirketle sürecin hangi noktada kaldı?',
      stageOptions: [
        'Sadece başvuru yaptım, dönüş olmadı',
        'Başvuru sonrası otomatik ret aldım',
        'Başvuru sonrası manuel ret aldım',
        'İK görüşmesine girdim',
        'Teknik görüşmeye girdim',
        'Vaka çalışması veya ödev yaptım',
        'Final görüşmesine girdim',
        'Teklif aldım',
        'Süreçten ben çekildim',
        'Süreç devam ediyor',
      ],
      response: 'Geri dönüş oldu mu?',
      responseOptions: ['Evet', 'Hayır', 'Emin değilim'],
      feedback: 'Geri bildirim verildi mi?',
      feedbackOptions: ['Hayır', 'Evet, detaylı', 'Evet, yüzeysel'],
      salary: 'Maaş konuşuldu mu?',
      salaryOptions: ['Hayır', 'Evet, erken aşamada', 'Evet, geç aşamada'],
      experience: 'Kısaca ne yaşadığını anlat',
      experiencePlaceholder:
        'Başvuru yaptım, 1 hafta sonra otomatik ret geldi. Ret gerekçesine dair hiçbir açıklama yoktu...',
      submit: 'Anonim deneyimi gönder',
    },
    benchmarkForm: {
      trustPanel: {
        dataLabel: 'Veri dosyası · Örnek veri',
        title: 'Sürecin gerçekten bu kadar mı sürüyor?',
        description:
          'Yaklaşık 2 dakikada iş arama sürecini tanımla ve temsili aday grubu verileriyle karşılaştır.',
        items: [
          'Kayıt gerekmiyor',
          'İsim veya e-posta istenmiyor',
          'Maaş bilgisi yalnızca aralık olarak toplanır',
        ],
      },
      stepIndicator: {
        progressLabel: 'Form ilerlemesi',
        items: ['Karşılaştırma bağlamı', 'Başvuru hunin', 'İsteğe bağlı ayrıntılar'],
      },
      privacyRow: 'Anonim · İsim toplanmaz · Belge istenmez',
      selectPlaceholder: 'Seçiniz',
      booleanOptions: [
        { value: true, label: 'Evet' },
        { value: false, label: 'Hayır' },
      ],
      steps: {
        step1: {
          title: 'Seni neyle karşılaştırıyoruz?',
          description: 'Yalnızca benzer adaylarla eşleşmek için kısa bir bağlam paylaş. Zorunlu alanlar karşılaştırmanın temelini oluşturur.',
          selectPlaceholder: 'Seçiniz',
          optional: 'Opsiyonel',
          optionalContextTitle: 'Karşılaştırmayı daralt',
          optionalContextNote: 'Bu ayrıntılar sonucu daha spesifik yapar; boş bıraksan da sonuç önizlemeni görebilirsin.',
          booleanOptions: [
            { value: true, label: 'Evet' },
            { value: false, label: 'Hayır' },
          ],
          fields: {
            role: {
              label: 'Pozisyon / rol',
              options: {
                software_engineer: 'Software Engineer',
                frontend_developer: 'Frontend Developer',
                backend_developer: 'Backend Developer',
                full_stack_developer: 'Full-stack Developer',
                mobile_developer: 'Mobile Developer',
                data_analyst: 'Data Analyst',
                data_scientist: 'Data Scientist',
                product_manager: 'Product Manager',
                product_designer: 'Product Designer',
                devops_engineer: 'DevOps Engineer',
                qa_engineer: 'QA Engineer',
                business_analyst: 'Business Analyst',
                other: 'Diğer',
              },
            },
            sector: {
              label: 'Hedef sektör',
              options: {
                technology: 'Teknoloji', finance: 'Finans', ecommerce: 'E-ticaret',
                consulting: 'Danışmanlık', healthcare: 'Sağlık', manufacturing: 'Üretim',
                education: 'Eğitim', media: 'Medya', telecom: 'Telekom', other: 'Diğer',
              },
            },
            roleLevel: {
              label: 'Pozisyon seviyesi',
              options: {
                intern: 'Stajyer', junior: 'Junior', mid: 'Mid-level',
                senior: 'Senior', lead_manager: 'Lead / Yönetici',
              },
            },
            experienceBand: {
              label: 'Deneyim yılın',
              options: { '0-1': '0-1 yıl', '1-3': '1-3 yıl', '3-5': '3-5 yıl', '5-8': '5-8 yıl', '8+': '8+ yıl' },
            },
            targetRegion: {
              label: 'Hedef pazar / bölge',
              options: {
                turkiye: 'Türkiye', europe: 'Avrupa Birliği', uk_ireland: 'Birleşik Krallık / İrlanda',
                mena: 'Orta Doğu / Kuzey Afrika', north_america: 'Kuzey Amerika', other: 'Diğer',
              },
            },
            employmentType: {
              label: 'Çalışma türü',
              options: {
                full_time: 'Tam zamanlı', part_time: 'Yarı zamanlı',
                freelance: 'Freelance / Sözleşmeli', internship: 'Staj',
              },
            },
            workMode: {
              label: 'Hedef çalışma modeli',
              options: { remote: 'Remote', hybrid: 'Hybrid', onsite: 'Ofis' },
            },
            isCurrentlyEmployed: { label: 'Şu anda çalışıyor musun?' },
            searchStartedAt: { label: 'İş aramaya ne zaman başladın?' },
            searchStatus: {
              label: 'Sürecin şu anda ne durumda?',
              options: {
                ongoing: 'Devam ediyor',
                offer_accepted: 'Teklif kabul ettim',
                offer_rejected: 'Teklifi reddettim',
                abandoned: 'Aramayı sonlandırdım',
              },
            },
            searchEndedAt: { label: 'Süreç ne zaman sonuçlandı?' },
          },
        },
        step2: {
          title: 'Başvuru hunin',
          description: 'Yaklaşık sayılar yeterli. Amaç, başvurunun hangi aşamada daraldığını birlikte görmek.',
          countFields: [
            { name: 'applicationsCount', label: 'Kaç başvuru yaptın?' },
            { name: 'responsesCount', label: 'Kaç dönüş aldın?' },
            { name: 'hrInterviewsCount', label: 'Kaç şirketle İK görüşmesi yaptın?' },
            { name: 'technicalInterviewsCount', label: 'Kaç şirketle teknik görüşme yaptın?' },
            { name: 'offersCount', label: 'Kaç teklif aldın?' },
          ],
          helperEyebrow: 'Sayılar kesin olmak zorunda değil',
          helperText: 'Yaklaşık değerler de yeterli. Referansla veya doğrudan ulaşarak ilerleyen sıra dışı süreçler için uyarı görsen bile devam edebilirsin.',
        },
        step3: {
          title: 'İsteğe bağlı ayrıntılar',
          description: 'Bu alanların hiçbiri sonucu görmek için zorunlu değil. Dilersen sadece sana fayda sağlayacak ayrıntıları ekle.',
          optionalNote: 'Bu adım tamamen opsiyonel. Dilersen atlayıp sonuç önizlemesine geçebilirsin.',
          optional: 'Opsiyonel',
          salaryTitle: 'Maaş karşılaştırması',
          salaryNote: 'Aylık maaş bilgisini kesin rakam yerine yaklaşık bir bant olarak paylaşabilirsin.',
          preferNotToSay: 'Boş bırak / belirtmek istemiyorum',
          salaryCurrency: { label: 'Para birimi' },
          salaryFields: [
            { name: 'currentSalaryBand', label: 'Mevcut veya son maaş bandın' },
            { name: 'expectedSalaryBand', label: 'Beklediğin maaş bandı' },
            { name: 'highestOfferBand', label: 'Aldığın en yüksek teklif bandı' },
          ],
          signalTitle: 'Karşılaştırmayı etkileyen faktörler',
          signalNote: 'Referans veya portföy, sonuçları daha doğru yorumlamaya yardımcı olabilir.',
          booleanOptions: [
            { value: true, label: 'Evet' },
            { value: false, label: 'Hayır' },
          ],
          fields: {
            hadReferral: { label: 'Başvurularından en az biri referanslı mıydı?' },
            sharedPortfolio: { label: 'Portföy veya iş örneği paylaştın mı?' },
            freeNote: {
              label: 'Eklemek istediğin kısa bir not var mı?',
              placeholder: 'Kişi adı, e-posta veya tanımlayıcı bilgi paylaşma.',
            },
          },
        },
      },
      navigation: {
        back: 'Geri',
        next: 'Devam et',
        skip: 'Atla ve sonucu gör',
        complete: 'Tamamla ve sonucu gör',
        loading: 'Hazırlanıyor…',
      },
      validation: {
        required: 'Bu alan gerekli.',
        endDateRequired: 'Süreç sonuçlandıysa bitiş ayı gerekli.',
        nonNegativeNumber: '0 veya daha büyük tam sayı gir.',
        currencyRequired: 'Maaş bandı paylaşıyorsan para birimini seç.',
        noteTooLong: 'Not en fazla 300 karakter olabilir.',
        countOrder: 'Sayıların doğal sırası farklı görünüyor. Sıra dışı bir sürecin varsa devam edebilirsin.',
        summary: 'Devam etmeden önce işaretli alanları kontrol et.',
      },
      submitError: 'Önizleme hazırlanamadı. Lütfen tekrar dene.',
      success: {
        mockLabel: 'Örnek veri · Gerçek karşılaştırma değil',
        title: 'İş arama süreci önizlemen hazır.',
        description:
          'Bilgilerin kaydedilmedi. Gerçek karşılaştırma verileri oluştuğunda benzer aday gruplarıyla sonucun burada gösterilecek.',
        yourDurationLabel: 'Senin arama süren',
        communityDurationLabel: 'Temsili karşılaştırma grubu medyanı',
        yourTechnicalEffortLabel: '1 teknik görüşme için',
        communityTechnicalEffortLabel: 'Temsili grup medyanı',
        yourApplicationsLabel: 'Başvuru',
        conversionTitle: 'Senin başvuru akışın',
        responseLabel: 'Dönüş',
        hrLabel: 'İK',
        technicalLabel: 'Teknik',
        offerLabel: 'Teklif',
        dayUnit: 'gün',
        applicationUnit: 'başvuru',
        cohortLabel: 'Karşılaştırma grubu',
        personalSignalLabel: 'Sürecindeki temel bulgu',
        applicationsPerTechnicalSuffix: 'başvuruda 1 teknik görüşme',
        noTechnicalInterviewSignal: 'Teknik görüşmeye ulaşmadan önce süreç durmuş görünüyor.',
        responseRatePrefix: 'Başvurularının',
        responseRateSuffix: 'i dönüş aldı.',
        previewNote: 'Bu sonuç temsili verilerle hazırlanmış bir önizlemedir; yanıtların bu prototipte kaydedilmez.',
      },
      explainer: {
        eyebrow: 'Anketin amacı',
        title: 'İş arama sürecinin temel metriklerini ölçüyoruz.',
        intro:
          'Bu anket başvuru hacmini, iş arama süresini ve başvurudan teklife dönüşüm oranlarını benzer aday gruplarıyla karşılaştırır.',
        whyTitle: 'Neden iş arama sürecini karşılaştırmalısın?',
        reasons: [
          {
            title: 'Sonuçları piyasa bağlamında değerlendirmek için',
            description: 'Benzer rol ve deneyim grubundaki başvuru ve dönüşüm oranları, bireysel sonucu piyasa verileriyle birlikte değerlendirmeyi sağlar.',
          },
          {
            title: 'Gerçekçi bir zaman çizelgesi kurmak için',
            description: 'İlk başvurudan teklife kadar geçen medyan süre, iş değişikliği planını daha sağlam bir veriyle yapmana yardımcı olur.',
          },
          {
            title: 'Dönüşümün hangi aşamada düştüğünü görmek için',
            description: 'Yanıt, İK, teknik görüşme ve teklif oranları dönüşüm kaybının hangi aşamada yaşandığını gösterir.',
          },
        ],
        measurementTitle: 'Bu ankette neyi ölçüyoruz?',
        measurementDescription:
          'Sonuçlar rol, sektör, deneyim, hedef bölge ve çalışma biçimi gibi bağlamlarla gruplanır; kişisel bilgi veya belge ölçümün parçası değildir.',
        metrics: [
          'Teklif başına başvuru',
          'İş arama süresi',
          'Başvurudan yanıta geçiş',
          'İK ve teknik görüşme oranı',
          'Teklif dönüşümü',
          'Beklenti ve teklif bandı',
        ],
        howTitle: 'Nasıl çalışır?',
        steps: [
          { title: 'Sürecini tanımla', description: 'Rolünü ve temel başvuru sayılarını yaklaşık 2 dakikada paylaş.' },
          { title: 'Benzer profille eşleş', description: 'Sonucun aynı bağlamdaki temsili aday verileriyle karşılaştırılır.' },
          { title: 'Dönüşüm oranlarını incele', description: 'Süreni, başvuru hacmini ve dönüşüm hunini tek bir sonuçta incele.' },
        ],
        transparencyTitle: 'Şu an temsili önizleme',
        transparencyText:
          'Bu prototipte yanıtların kaydedilmez ve karşılaştırma grubu örnek değerlerle hazırlanır. Gerçek veri altyapısı devreye alındığında yalnızca yeterli örneklem oluşan gruplar yayınlanacaktır.',
      },
    },
    hrProcessForm: {
      trustPanel: {
        dataLabel: 'Anonim Anket',
        title: 'Söz verdikleri sürede döndüler mi?',
        description:
          'Bu prototip yanıtları kaydetmez. Gerçek veri altyapısında yanıt süreleri ve süreç şeffaflığına ilişkin veriler anonim örnekleme dahil edilir.',
        items: [
          'Kayıt gerekmiyor',
          'İsim veya e-posta istenmiyor',
          'Şirket adı doğrudan yayınlanmaz, anonim kalır',
        ],
      },
      stepIndicator: {
        progressLabel: 'Form ilerlemesi',
        items: ['Şirket ve rol', 'Süreç ve yanıtsızlık', 'Değerlendirme'],
      },
      privacyRow: 'Anonim · İsim toplanmaz · Belge istenmez',
      selectPlaceholder: 'Seçiniz',
      booleanOptions: [
        { value: true, label: 'Evet' },
        { value: false, label: 'Hayır' },
      ],
      steps: {
        step1: {
          title: 'Şirket ve rol',
          description: 'Hangi şirket ve rol için mülakat sürecine girdiğini belirt.',
          fields: {
            companyName: { label: 'Şirket adı', placeholder: 'Örn. Tech Corp' },
            appliedRole: { label: 'Pozisyon / rol', placeholder: 'Örn. Frontend Developer' },
            processYear: {
              label: 'Süreç hangi yıl gerçekleşti?',
              options: { '2024': '2024', '2025': '2025', '2026': '2026' },
            },
          },
        },
        step2: {
          title: 'Süreç ve yanıtsızlık',
          description: 'Taahhüt edilen yanıt süresiyle gerçekleşen süreyi karşılaştır.',
          fields: {
            promisedTimeline: {
              label: 'Süreç başında geri dönüş süresi taahhüt edildi mi?',
              options: { yes: 'Evet, süre verdiler', no: 'Hayır, belirtilmedi', not_specified: 'Hatırlamıyorum' },
            },
            promisedDays: { label: 'Kaç gün içinde döneceklerini söylediler?' },
            actualDays: { label: 'Gerçekte kaç gün sonra döndüler?' },
            wasGhosted: { label: 'Ghosting (habersiz iletişimi kesme) yaşandı mı?' },
            ghostedAfterStage: {
              label: 'Hangi aşamadan sonra ghosting yaşandı?',
              options: { application: 'Başvuru', hr_screen: 'İK Görüşmesi', technical: 'Teknik Mülakat', final: 'Final Görüşmesi' },
            },
            interviewerPrepared: { label: 'Görüşmeciler mülakata hazırlıklı mıydı? (1-5)' },
            wasAskedIrrelevant: { label: 'İlgisiz veya uygunsuz sorular soruldu mu?' },
            irrelevantTypes: {
              label: 'Hangi türde sorular soruldu?',
              options: { age: 'Yaş', marital_status: 'Medeni durum', salary_history: 'Geçmiş maaş', personal_questions: 'Özel hayat', other: 'Diğer' },
            },
          },
        },
        step3: {
          title: 'Değerlendirme',
          description: 'İK ekibini ve sürecin şeffaflığını puanla.',
          fields: {
            rejectionShared: {
              label: 'Ret gerekçesi paylaşıldı mı?',
              options: { yes_detailed: 'Evet, ayrıntılı geri bildirim verildi', yes_generic: 'Evet ancak standart bir metindi', no: 'Hayır, gerekçe belirtilmedi' },
            },
            feedbackUseful: { label: 'Verilen geri bildirim gelişimin için faydalı mıydı? (1-5)' },
            processTransparency: { label: 'Sürecin şeffaflığı (1-5)' },
            hrProfessionalism: { label: 'İK ekibinin profesyonelliği (1-5)' },
            wouldRecommendProcess: {
              label: 'Bu şirketin mülakat sürecini başkalarına tavsiye eder misin?',
              options: { yes: 'Evet', no: 'Hayır', unsure: 'Emin değilim' },
            },
            freeNote: {
              label: 'Eklemek istediğin başka bir detay var mı?',
              placeholder: 'Kişi adı veya tanımlayıcı bilgi paylaşmadan süreci kısaca anlatabilirsin.',
            },
          },
        },
      },
      navigation: {
        back: 'Geri',
        next: 'Devam et',
        complete: 'Tamamla ve sonucu gör',
        loading: 'Hazırlanıyor…',
      },
      validation: {
        required: 'Bu alan gerekli.',
        nonNegativeNumber: '0 veya daha büyük tam sayı gir.',
        noteTooLong: 'Not en fazla 500 karakter olabilir.',
        timelineGapWarning: 'Gerçekleşen süre söz verilenden çok daha uzun görünüyor. Doğru girdiğinize emin misiniz?',
        summary: 'Devam etmeden önce işaretli alanları kontrol et.',
      },
      submitError: 'Önizleme hazırlanamadı. Lütfen tekrar dene.',
      success: {
        title: 'Süreç değerlendirmen hazır.',
        description: 'Bilgilerin kaydedilmedi. Gerçek sistemde bu değerlendirme, aday iletişimi ve süreç şeffaflığı analizlerine dahil edilecektir.',
        ghostedLabel: 'Ghosting durumu',
        transparencyLabel: 'Şeffaflık skoru',
        professionalismLabel: 'Profesyonellik skoru',
      },
      explainer: {
        eyebrow: 'Anketin amacı',
        title: 'Tekil aday deneyimlerini ölçülebilir süreç verisine dönüştürüyoruz.',
        intro:
          'Bu anket, bir şirketle yaşanan başvuru veya mülakat sürecini anonim bir kayıt olarak toplar. Amaç, tekrar eden İK uygulamalarını toplu veriler üzerinden analiz etmektir.',
        whyTitle: 'Neden şirket deneyimini paylaşmalısın?',
        reasons: [
          {
            title: 'Taahhüt edilen ve gerçekleşen yanıt süresini karşılaştırmak için',
            description: 'Taahhüt edilen yanıt süresine uyulup uyulmadığı, aday deneyiminin temel süreç göstergelerinden biridir.',
          },
          {
            title: 'Yanıtsızlık oranını ölçmek için',
            description: 'Tekrarlanan yanıtsızlık kayıtları, şirketin aday iletişimi performansını değerlendirmeye yardımcı olur.',
          },
          {
            title: 'Geri bildirim ve süreç standartlarını değerlendirmek için',
            description: 'Ret gerekçesi, görüşmeci hazırlığı ve uygunsuz soru kayıtları aday deneyiminin kalitesini ölçmeye yardımcı olur.',
          },
        ],
        measurementTitle: 'Bu ankette neyi ölçüyoruz?',
        measurementDescription:
          'Yanıtlar şirket, rol ve süreç yılı bağlamında değerlendirilir; kişi isimleri, özel belgeler ve tanımlayıcı detaylar ölçümün parçası değildir.',
        metrics: [
          'Söz verilen dönüş süresi',
          'Gerçekleşen dönüş süresi',
          'Ghosting aşaması',
          'Geri bildirim kalitesi',
          'İK profesyonelliği',
          'Süreç tavsiye skoru',
        ],
        howTitle: 'Nasıl çalışır?',
        steps: [
          { title: 'Süreci konumlandır', description: 'Şirket, rol ve yıl bilgisini paylaşarak deneyimi doğru bağlama yerleştir.' },
          { title: 'Söz ve gerçeği karşılaştır', description: 'Vaat edilen dönüş süresiyle gerçekten yaşanan akışı yan yana ölç.' },
          { title: 'Veriye katkıda bulun', description: 'Geri bildirim, yanıtsızlık ve profesyonellik verileri anonim örnekleme dahil edilir.' },
        ],
        transparencyTitle: 'Moderasyon ve örneklem eşiği',
        transparencyText:
          'Bu prototipte yanıtların kaydedilmez. Gerçek veri katmanında şirket bazlı sonuçlar moderasyon ve yeterli örneklem eşiği olmadan herkese açık gösterilmez.',
      },
    },
  },
  en: {
    localeName: 'English',
    common: {
      homeAria: 'Interview Memory homepage',
      languageLabel: 'Language selection',
      backHome: 'Back to homepage',
      themeToggle: 'Switch between light and dark themes',
      themeTitle: 'Change theme',
    },
    metadata: {
      home: {
        title: 'Interview Memory — Anonymous Hiring Data',
        description:
          'An open-source recruitment analytics platform that turns anonymous application and interview records into aggregated hiring benchmarks.',
      },
      surveys: {
        title: 'Anonymous Surveys',
        description:
          'Share your company experience or application and interview rates anonymously without registering.',
      },
      companyExperience: {
        title: 'Share Your Company Experience',
        description:
          'Share an application or interview experience with a company anonymously, without registering.',
      },
      applicationBenchmark: {
        title: 'Benchmark Your Job Search',
        description:
          'Share your application funnel anonymously and compare it with illustrative peer benchmarks.',
      },
      login: {
        title: 'Sign In',
        description:
          'Preview the Interview Memory sign-in flow using your Google account.',
      },
      notFound: {
        title: 'Page Not Found',
        description:
          'The page you are looking for may have moved, been deleted, or never existed.',
      },
    },
    header: {
      navLabel: 'Main navigation',
      mobileNavLabel: 'Mobile navigation',
      surveys: 'Surveys',
      howItWorks: 'How it works',
      data: 'Data',
      community: 'Hiring benchmarks',
      surveyMenuLabel: 'Survey options',
      surveyTypes: 'Survey types',
      applicationBenchmark: 'Benchmark your job search',
      applicationBenchmarkDescription: 'Compare application volume, conversion rates, and time-to-offer with comparable profiles.',
      companyExperience: 'Evaluate a candidate experience',
      companyExperienceDescription: 'Document employer responses, interview stages, and follow-up quality anonymously.',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      signIn: 'Sign in',
    },
    footer: {
      eyebrow: '04 / Project and resources',
      description:
        'Interview Memory is an open-source recruitment analytics project that converts anonymous candidate-process records into aggregated benchmarks for application funnels and candidate experience.',
      productTitle: 'Product',
      surveys: 'Surveys',
      signals: 'Hiring benchmarks',
      signIn: 'Sign in',
      projectTitle: 'Project',
      repository: 'GitHub repository',
      creator: 'Can Yavuz',
      plannedTitle: 'Planned pages',
      planned: ['About', 'Frequently asked questions', 'Contact', 'Privacy', 'Terms of use', 'Cookie settings'],
      plannedNote: 'These routes will become active once the information architecture is complete.',
      sourceNote: 'Open source · Frontend prototype',
      copyright: 'Interview Memory',
    },
    login: {
      eyebrow: 'Account access',
      title: 'Track your records in one place.',
      description:
        'Sign in to track your survey records and access detailed recruitment analytics available to account holders.',
      benefitsEyebrow: 'What changes with an account?',
      benefits: [
        'Track your anonymous survey history in one place',
        'Return to saved company and role benchmarks',
        'Access detailed analytics available to members',
      ],
      accessTitle: 'Access your account quickly',
      accessDescription:
        'Sign in with your Google account or continue using Interview Memory anonymously without creating an account.',
      googleCta: 'Continue with Google',
      alternative: 'or',
      previewNotice:
        'This is an interface preview. Google OAuth is not connected yet and no information was sent.',
      privacyNote:
        'When you continue with Google, basic account information is used for sign-in; your survey responses are not shared under your public identity.',
      anonymousCta: 'Continue using anonymously',
    },
    notFound: {
      eyebrow: '404',
      title: 'The page you requested was not found.',
      description:
        'The URL may have changed or the page may have been removed. Return home or review the anonymous surveys.',
      homeCta: 'Back to homepage',
      surveysCta: 'Explore surveys',
      codeLabel: 'Page not found',
    },
    home: {
      hero: {
        eyebrow: 'Job-search benchmark',
        title: 'Where do you stand in',
        titleHighlight: 'your job search?',
        subtitle: 'Compare your job-search timeline with similar role and experience groups.',
        detailsLabel: 'Information used in the comparison',
        details: ['Role · experience · timeline', 'Peer benchmark'],
        signalsLabel: 'Application response statuses',
        signals: responseStatuses.en.map(({ label }) => label),
        descriptionParts: {
          pre: 'Share your application outcomes ',
          highlight: 'anonymously',
          post: ' and compare your job-search timeline with aggregated peer benchmarks.',
        },
        explore: 'Benchmark your job search',
        benchmark: 'Explore hiring benchmarks',
      },
      signal: {
        eyebrow: 'Recruitment analytics',
        title: 'What response and interview rates do comparable profiles see?',
        description:
          'We compare application volume, response rates, interview conversion, and time-to-offer by role, experience level, and referral status.',
        companyTitle: 'Candidate experience metrics',
        companyDescription:
          'Employer response times, rejection outcomes, interview stages, and follow-up quality.',
        benchmarkTitle: 'Application funnel benchmarks',
        benchmarkDescription:
          'Response, recruiter-screen, technical-interview, and offer conversion rates.',
        panelLabel: 'Hiring benchmark summary',
        panelType: 'Benchmark dataset',
        sampleData: 'Sample data',
        sampleSize: '1,248 process records',
        methodology:
          'Illustrative sample data; not a production benchmark.',
        flowChartLabel: 'Application stages',
        distributionChartLabel: 'Process distribution',
        viewCta: 'View benchmark and contribute',
        views: [
          {
            id: 'application-marathon',
            type: 'funnel',
            path: '/surveys/application-benchmark',
            tabLabel: 'Application funnel',
            eyebrow: 'Benchmark / Application funnel',
            title: 'Median applications required per offer',
            description:
              'Aggregated funnel metrics show application-to-response, interview, and offer conversion alongside median time-to-offer.',
            primaryValue: '72',
            primaryLabel: 'Applications',
            secondaryValue: '14 weeks',
            secondaryLabel: 'Median duration',
            chartLabel: 'Application funnel',
            stages: [
              { label: 'Applications', value: '72', share: '100%' },
              { label: 'Responses', value: '28', share: '39%' },
              { label: 'Interviews', value: '8', share: '11%' },
              { label: 'Offers', value: '1', share: '1.4%' },
            ],
          },
          {
            id: 'company-report',
            type: 'funnel',
            path: '/surveys/company-experience',
            tabLabel: 'Candidate experience',
            eyebrow: 'Metrics / Candidate experience',
            title: 'Most frequently reported hiring-process issues',
            description:
              'Aggregated candidate records identify recurring issues in employer response, follow-up, and feedback.',
            primaryValue: '847',
            primaryLabel: 'Process records',
            secondaryValue: '41%',
            secondaryLabel: 'No response',
            chartLabel: 'Most reported issues',
            stages: [
              { label: 'Ghosting', value: '347', share: '41%' },
              { label: 'Delayed response', value: '288', share: '34%' },
              { label: 'No reason given', value: '237', share: '28%' },
              { label: 'Other', value: '127', share: '15%' },
            ],
          },
          {
            id: 'silent-processes',
            type: 'signal',
            path: '/surveys/hr-process',
            tabLabel: 'Follow-up reliability',
            eyebrow: 'Metric / Recruiter follow-up',
            title: '58% of promised follow-ups were not completed',
            description:
              'Measures recruiter response times, follow-up completion, and disclosure of rejection reasons.',
            primaryValue: '58%',
            primaryLabel: 'Promised, never heard back',
            secondaryValue: '12%',
            secondaryLabel: 'Rejection reason shared',
            chartLabel: 'Response status',
            distribution: responseStatuses.en,
          },
          {
            id: 'salary-reality',
            type: 'comparison',
            path: '/surveys/salary-benchmark',
            tabLabel: 'Compensation transparency',
            eyebrow: 'Benchmark / Posted range vs. offer',
            title: 'Posted salary ranges and final offers diverge',
            description:
              'Compare candidate expectations, advertised salary ranges, and final offers using aggregated data.',
            comparison: {
              promiseLabel: 'Expectation',
              promiseValue: '42K ₺',
              promiseDescription: 'The median net salary candidates targeted before applying.',
              realityLabel: 'Offer',
              realityValue: '34K ₺',
              realityDescription: 'The median net salary offer presented to candidates.',
              deltaLabel: 'Gap between expectation and offer',
              deltaValue: '-19%',
            },
          },
        ],
        bottomEyebrow: 'Candidate experience, quantified',
        bottomText:
          'Aggregated process records reveal recurring patterns in employer responsiveness and hiring-process quality.',
      },
      surveyPrompt: {
        meta: 'Short form · anonymous response',
        cta: 'Explore surveys',
        items: [
          {
            eyebrow: '01 / Job-search benchmark',
            title: 'Compare your job-search metrics with comparable profiles.',
            description: 'Share applications, responses, recruiter screens, technical interviews, and offers to review funnel conversion.',
          },
          {
            eyebrow: '01 / Candidate experience review',
            title: 'Evaluate an employer’s application and interview process.',
            description: 'Share response time, non-response, feedback, and interview practices anonymously.',
          },
        ],
      },
      howItWorks: [
        {
          title: 'Choose your survey',
          description:
            'Benchmark your application funnel or evaluate an employer’s candidate experience.',
        },
        {
          title: 'Share your experience',
          description:
            'Share where the process stopped, whether you heard back, and whether you received feedback without publishing your identity.',
        },
        {
          title: 'Review your benchmark',
          description:
            'Your response enters an anonymous aggregate and can be compared with benchmarks for comparable profiles.',
        },
      ],
      finalCta: {
        eyebrow: 'Contribute to the sample',
        title:
          'Larger anonymous samples produce more reliable hiring benchmarks.',
        company: 'Share a candidate experience',
        benchmark: 'Share application metrics',
      },
    },
    trustItems: [
      {
        title: 'No account required',
        description: 'You do not need to create an account to complete a survey.',
      },
      {
        title: 'Anonymous participation',
        description:
          'Complete a survey without sharing your name, email address, or personal information.',
      },
      {
        title: 'Privacy-minded data',
        description:
          'Names, confidential documents, and abusive content are not published.',
      },
      {
        title: 'Moderated sharing',
        description:
          'Submitted experiences are designed to be reviewed before becoming public.',
      },
    ],
    surveyCarousel: {
      eyebrow: 'Choose a survey',
      title: 'Choose the record that best matches your experience.',
      description:
        'Each survey takes three short steps. Responses support anonymous, aggregated analysis of hiring metrics.',
      includesLabel: 'What will you share in this record?',
    },
    surveyCards: [
      {
        id: 'company-experience',
        path: '/surveys/company-experience',
        eyebrow: 'Candidate experience review',
        title: 'Share your candidate experience',
        description:
          'Whether you received an automated rejection, heard nothing, or reached an interview, anonymously share where the process ended.',
        duration: '3-5 min',
        icon: 'building',
        cta: 'Complete this survey',
        bullets: [
          'Company and role',
          'Where did the process stop?',
          'Was there an automated rejection or a period of non-response?',
          'Did you reach recruiter, technical, or final interviews?',
          'Did you receive feedback?',
        ],
        tags: ['Automated rejection', 'Non-response', 'Feedback', 'Recruiting process'],
      },
      {
        id: 'application-benchmark',
        path: '/surveys/application-benchmark',
        eyebrow: 'Job-search benchmark',
        title: 'Benchmark your job-search process',
        description:
          'Share your role, experience, and core application metrics, then compare your timeline with an illustrative peer group.',
        duration: '1-2 min',
        icon: 'chart',
        cta: 'Compare my process',
        bullets: [
          'Which role and work model are you targeting?',
          'How long has your job search lasted?',
          'How many applications, interviews, and offers?',
          'What salary range are you targeting?',
          'Did referrals or a portfolio make a difference?',
        ],
        tags: ['Job-search timeline', 'Interview conversion', 'Salary range', 'Peer benchmark'],
      },
      {
        id: 'hr-process',
        path: '/surveys/hr-process',
        eyebrow: 'Recruiting-process review',
        title: 'Evaluate the recruiting process',
        description:
          'Did the employer follow up? Was the process transparent? Was a rejection reason shared? Evaluate the recruiting process anonymously.',
        duration: '3-4 min',
        icon: 'userSearch',
        cta: 'Evaluate the process',
        bullets: [
          'Response time: promise vs reality',
          'Were you ghosted, and at which stage?',
          'Was a rejection reason shared?',
          'Were irrelevant or inappropriate questions asked?',
          'Recruiter professionalism and process transparency',
        ],
        tags: ['Non-response', 'Process transparency', 'Feedback', 'Process quality'],
      },
      {
        id: 'salary-benchmark',
        path: '/surveys/salary-benchmark',
        eyebrow: 'Compensation and offer benchmark',
        title: 'Share your compensation and offer experience',
        description:
          'Was the posted salary the same as the offer? Were your expectations met? Anonymously evaluate salary transparency.',
        duration: '2-3 min',
        icon: 'wallet',
        cta: 'Share salary experience',
        bullets: [
          'Was salary listed in the job posting?',
          'Your expectation vs the actual offer',
          'Were you able to negotiate?',
          'Were benefits offered?',
          'Did the offer feel fair?',
        ],
        tags: ['Salary transparency', 'Offer', 'Negotiation', 'Benefits'],
      },
    ],
    community: {
      eyebrow: '02 /',
      title: 'Hiring benchmarks',
      note:
        'Illustrative data / not production benchmarks',
      tabsLabel: 'Hiring benchmark views',
      cards: [
        {
          type: 'effort',
          code: '01 /',
          label: 'Application funnel',
          eyebrow: 'Application to offer',
          title: 'Median application-to-offer ratio: 72 to 1.',
          description: 'Application, response, interview, and offer counts are evaluated together to calculate funnel conversion.',
          summary: 'Only 11% of applications turn into an interview.',
          path: '/surveys/application-benchmark',
          cta: 'Compare your process',
          metrics: [
            { value: '72', label: 'Applications per offer' },
            { value: '14 wk', label: 'Median job-search duration' },
          ],
          chartLabel: 'Conversion path from 72 applications',
          chartAria: '72 applications produce 28 responses, 8 interviews, and 1 offer.',
          stages: [
            { label: 'Applied', value: '72', share: '100%' },
            { label: 'Response', value: '28', share: '39%' },
            { label: 'Interview', value: '8', share: '11%' },
            { label: 'Offer', value: '1', share: '1.4%' },
          ],
        },
        {
          type: 'reliability',
          code: '02 /',
          label: 'Employer responsiveness',
          eyebrow: 'Employer response performance',
          title: '41% of applications receive no employer response.',
          description: 'On-time responses, delays, automated rejections, and non-response are measured as separate outcome categories.',
          summary: 'Non-response and automated rejection are reported as distinct outcomes.',
          path: '/surveys/company-experience',
          cta: 'Share a candidate experience',
          chartLabel: 'Application outcome distribution',
          chartAria: '34 percent of applications receive a timely response, 13 percent a delayed response, 12 percent an automated rejection, and 41 percent no response.',
          distribution: responseStatuses.en,
          metrics: [
            { value: '58%', label: 'Follow-up promised, none received' },
            { value: '12%', label: 'Rejection reason shared' },
          ],
        },
        {
          type: 'coverage',
          code: '03 /',
          label: 'Sample coverage',
          eyebrow: 'Role distribution / illustrative',
          title: 'Sample coverage by role family.',
          description: 'Role distribution shows where the sample supports stronger peer benchmarks.',
          summary: 'Record density does not represent job-market demand or role popularity.',
          path: '/surveys/application-benchmark',
          cta: 'Contribute data for your role',
          chartLabel: 'Sample distribution by role family',
          dataLabel: 'Illustrative distribution',
          chartAria: 'Illustrative role distribution: Software 40 percent, Product 20 percent, Data 14 percent, Design 12 percent, Platform and quality 8 percent, Other 6 percent.',
          note: 'Groups without a sufficient sample are combined under “Other”.',
          items: [
            { label: 'Software', value: 40 },
            { label: 'Product', value: 20 },
            { label: 'Data', value: 14 },
            { label: 'Design', value: 12 },
            { label: 'Platform + QA', value: 8 },
            { label: 'Other', value: 6 },
          ],
        },
      ],
    },
    platformGuide: {
      eyebrow: '03 /',
      title: 'Platform overview',
      note: 'Planned product flow / frontend prototype',
      controlsLabel: 'Platform information',
      prototypeNote:
        'This frontend prototype does not save responses; all benchmark data shown is illustrative.',
      panels: [
        {
          id: 'how',
          code: '01 /',
          label: 'How it works',
          eyebrow: 'From record to benchmark',
          title: 'Each process record contributes to an aggregated hiring benchmark.',
          description:
            'Short forms are designed to capture measurable parts of hiring, rather than a personally identifiable story.',
          steps: [
            {
              code: '01 /',
              title: 'Share your process',
              description: 'Add your role, application volume, or candidate experience in a short form.',
            },
            {
              code: '02 /',
              title: 'Aggregate by cohort',
              description:
                'Once the data layer is connected, responses will be grouped anonymously by role, experience, and process stage.',
            },
            {
              code: '03 /',
              title: 'Review the benchmark',
              description:
                'Compare your process with similar candidate cohorts once the sample is sufficient.',
            },
          ],
        },
        {
          id: 'offerings',
          code: '02 /',
          label: 'What it offers',
          eyebrow: 'Platform outputs',
          title: 'One process record supports three analytical outputs.',
          description:
            'In the planned product, the same process record supports both personal tracking and shared hiring knowledge.',
          items: [
            {
              code: '01 /',
              title: 'Personal funnel summary',
              description: 'Track application volume, duration, and funnel conversion in one view.',
            },
            {
              code: '02 /',
              title: 'Peer benchmark',
              description: 'Compare your process with aggregated metrics from similar role and experience groups.',
            },
            {
              code: '03 /',
              title: 'Candidate experience trends',
              description: 'Analyze recurring non-response, delays, and feedback practices in aggregate.',
            },
          ],
        },
        {
          id: 'faq',
          code: '03 /',
          label: 'Common questions',
          eyebrow: 'Short answers',
          title: 'The three essential questions about the platform.',
          description:
            'Short, direct answers needed to understand how the product is intended to work at this stage.',
          faqs: [
            {
              question: 'Is sharing really anonymous?',
              answer:
                'Forms are designed not to request names, email addresses, or personal documents. In the real data layer, results will be shown for groups with sufficient samples rather than as individual records.',
            },
            {
              question: 'Is every record published immediately?',
              answer:
                'No. In the planned flow, records that do not pass moderation and minimum-sample thresholds will not enter public results.',
            },
            {
              question: 'What changes when I sign in?',
              answer:
                'Sign-in will not be required for anonymous survey responses. Once accounts are connected, signing in will let you save processes, follow comparisons, and access a personal job-search journal.',
            },
          ],
        },
      ],
    },
    surveyIndex: {
      eyebrow: 'Active research surveys',
      title: 'Contribute job-search and candidate-experience data.',
      activeCount: 'Two active surveys',
      description:
        'Benchmark your application metrics or evaluate an employer’s application and interview process.',
    },
    companyForm: {
      eyebrow: 'Anonymous candidate experience survey',
      title: 'Share your candidate experience',
      description:
        'This form lets you anonymously share where an application or interview process with a company ended. You do not need to register.',
      warning:
        'Do not share names, email addresses, phone numbers, confidential documents, exact private case content, or abusive language.',
      company: 'Company name',
      companyPlaceholder: 'e.g. ABC Technology',
      role: 'Role',
      rolePlaceholder: 'e.g. Frontend Developer',
      stage: 'Where did your process with this company end?',
      stageOptions: [
        'Applied but received no response',
        'Received an automated rejection',
        'Received a manual rejection',
        'Completed a recruiter interview',
        'Completed a technical interview',
        'Completed a case or assignment',
        'Reached the final interview',
        'Received an offer',
        'Withdrew from the process',
        'The process is ongoing',
      ],
      response: 'Did you receive a response?',
      responseOptions: ['Yes', 'No', 'Not sure'],
      feedback: 'Did you receive feedback?',
      feedbackOptions: ['No', 'Yes, detailed', 'Yes, superficial'],
      salary: 'Was salary discussed?',
      salaryOptions: ['No', 'Yes, early in the process', 'Yes, late in the process'],
      experience: 'Briefly describe what happened',
      experiencePlaceholder:
        'I applied and received an automated rejection one week later. There was no explanation of why I was rejected...',
      submit: 'Submit anonymous experience',
    },
    benchmarkForm: {
      trustPanel: {
        dataLabel: 'Data file · Sample data',
        title: 'Does the process really take this long?',
        description:
          'Describe your job search in about 2 minutes and compare it with an illustrative peer-group benchmark.',
        items: [
          'No account required',
          'No name or email requested',
          'Salary is collected only as a range',
        ],
      },
      stepIndicator: {
        progressLabel: 'Form progress',
        items: ['Comparison context', 'Your application funnel', 'Optional details'],
      },
      privacyRow: 'Anonymous · No names · No documents',
      selectPlaceholder: 'Select',
      booleanOptions: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
      steps: {
        step1: {
          title: 'What should we compare you with?',
          description: 'Share only the brief context needed to match you with similar candidates. The required fields form the basis of the comparison.',
          selectPlaceholder: 'Select',
          optional: 'Optional',
          optionalContextTitle: 'Narrow the comparison',
          optionalContextNote: 'These details make the result more specific. You can still view your preview without them.',
          booleanOptions: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
          fields: {
            role: {
              label: 'Position / role',
              options: {
                software_engineer: 'Software Engineer',
                frontend_developer: 'Frontend Developer',
                backend_developer: 'Backend Developer',
                full_stack_developer: 'Full-stack Developer',
                mobile_developer: 'Mobile Developer',
                data_analyst: 'Data Analyst',
                data_scientist: 'Data Scientist',
                product_manager: 'Product Manager',
                product_designer: 'Product Designer',
                devops_engineer: 'DevOps Engineer',
                qa_engineer: 'QA Engineer',
                business_analyst: 'Business Analyst',
                other: 'Other',
              },
            },
            sector: {
              label: 'Target industry',
              options: {
                technology: 'Technology', finance: 'Finance', ecommerce: 'E-commerce',
                consulting: 'Consulting', healthcare: 'Healthcare', manufacturing: 'Manufacturing',
                education: 'Education', media: 'Media', telecom: 'Telecom', other: 'Other',
              },
            },
            roleLevel: {
              label: 'Position level',
              options: {
                intern: 'Intern', junior: 'Junior', mid: 'Mid-level',
                senior: 'Senior', lead_manager: 'Lead / Manager',
              },
            },
            experienceBand: {
              label: 'Years of experience',
              options: { '0-1': '0-1 years', '1-3': '1-3 years', '3-5': '3-5 years', '5-8': '5-8 years', '8+': '8+ years' },
            },
            targetRegion: {
              label: 'Target market / region',
              options: {
                turkiye: 'Türkiye', europe: 'European Union', uk_ireland: 'United Kingdom / Ireland',
                mena: 'Middle East / North Africa', north_america: 'North America', other: 'Other',
              },
            },
            employmentType: {
              label: 'Employment type',
              options: {
                full_time: 'Full-time', part_time: 'Part-time',
                freelance: 'Freelance / Contract', internship: 'Internship',
              },
            },
            workMode: {
              label: 'Target work model',
              options: { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' },
            },
            isCurrentlyEmployed: { label: 'Are you currently employed?' },
            searchStartedAt: { label: 'When did you begin your job search?' },
            searchStatus: {
              label: 'What is the current status?',
              options: {
                ongoing: 'Still ongoing',
                offer_accepted: 'Accepted an offer',
                offer_rejected: 'Rejected an offer',
                abandoned: 'Stopped searching',
              },
            },
            searchEndedAt: { label: 'When did the process end?' },
          },
        },
        step2: {
          title: 'Your application funnel',
          description: 'Approximate counts are enough. The goal is to identify where funnel conversion declines.',
          countFields: [
            { name: 'applicationsCount', label: 'How many applications did you submit?' },
            { name: 'responsesCount', label: 'How many responses did you receive?' },
            { name: 'hrInterviewsCount', label: 'How many companies invited you to a recruiter interview?' },
            { name: 'technicalInterviewsCount', label: 'How many companies invited you to a technical interview?' },
            { name: 'offersCount', label: 'How many offers did you receive?' },
          ],
          helperEyebrow: 'The numbers do not need to be exact',
          helperText: 'Approximate values are useful too. You can continue after a warning when referrals or direct outreach made your process unusual.',
        },
        step3: {
          title: 'Optional details',
          description: 'None of these fields are required to view your result. Add only the details that make the comparison more useful to you.',
          optionalNote: 'This step is entirely optional. You can skip it and view the result preview.',
          optional: 'Optional',
          salaryTitle: 'Salary comparison',
          salaryNote: 'Share an approximate monthly range instead of an exact salary.',
          preferNotToSay: 'Leave blank / prefer not to say',
          salaryCurrency: { label: 'Currency' },
          salaryFields: [
            { name: 'currentSalaryBand', label: 'Current or most recent salary range' },
            { name: 'expectedSalaryBand', label: 'Expected salary range' },
            { name: 'highestOfferBand', label: 'Highest offer received' },
          ],
          signalTitle: 'Factors affecting the benchmark',
          signalNote: 'A referral or portfolio can help interpret your results more accurately.',
          booleanOptions: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
          fields: {
            hadReferral: { label: 'Was at least one application referred?' },
            sharedPortfolio: { label: 'Did you share a portfolio or work sample?' },
            freeNote: {
              label: 'Anything else you would like to add?',
              placeholder: 'Do not include names, email addresses, or identifying information.',
            },
          },
        },
      },
      navigation: {
        back: 'Back',
        next: 'Continue',
        skip: 'Skip and view result',
        complete: 'Complete and view result',
        loading: 'Preparing…',
      },
      validation: {
        required: 'This field is required.',
        endDateRequired: 'An end month is required when the process has ended.',
        nonNegativeNumber: 'Enter a whole number equal to or greater than 0.',
        currencyRequired: 'Select a currency when sharing a salary range.',
        noteTooLong: 'The note must be 300 characters or fewer.',
        countOrder: 'These counts follow an unusual order. You can continue if this reflects your process.',
        summary: 'Check the highlighted fields before continuing.',
      },
      submitError: 'The preview could not be prepared. Please try again.',
      success: {
        mockLabel: 'Sample data · Not a real comparison',
        title: 'Your job-search preview is ready.',
        description:
          'Your information was not saved. Once production benchmark data is available, your comparison with similar profiles will appear here.',
        yourDurationLabel: 'Your search duration',
        communityDurationLabel: 'Illustrative peer-group median',
        yourTechnicalEffortLabel: 'For one technical interview',
        communityTechnicalEffortLabel: 'Illustrative cohort median',
        yourApplicationsLabel: 'Applications',
        conversionTitle: 'Your application flow',
        responseLabel: 'Responses',
        hrLabel: 'Recruiter',
        technicalLabel: 'Technical',
        offerLabel: 'Offers',
        dayUnit: 'days',
        applicationUnit: 'applications',
        cohortLabel: 'Comparison cohort',
        personalSignalLabel: 'Primary finding',
        applicationsPerTechnicalSuffix: 'applications for one technical interview',
        noTechnicalInterviewSignal: 'The process appears to have stopped before a technical interview.',
        responseRatePrefix: 'Of your applications,',
        responseRateSuffix: 'received a response.',
        previewNote: 'This is an illustrative preview built with sample values; your response is not saved in this prototype.',
      },
      explainer: {
        eyebrow: 'Survey purpose',
        title: 'Measure the core metrics of a job search.',
        intro:
          'This survey compares application volume, job-search duration, and application-to-offer conversion with similar candidate cohorts.',
        whyTitle: 'Why benchmark your job search?',
        reasons: [
          {
            title: 'Evaluate results in market context',
            description: 'Application and conversion rates for comparable profiles provide context for an individual result.',
          },
          {
            title: 'To build a realistic timeline',
            description: 'The median time from first application to offer helps you plan a job change using stronger evidence.',
          },
          {
            title: 'Identify where funnel conversion declines',
            description: 'Response, recruiter-screen, technical-interview, and offer rates identify the stage with the largest conversion loss.',
          },
        ],
        measurementTitle: 'What does this survey measure?',
        measurementDescription:
          'Results are grouped by role, industry, experience, target region, and work model. Personal information and documents are not part of the measurement.',
        metrics: [
          'Applications per offer',
          'Job-search duration',
          'Application-to-response rate',
          'Recruiter and technical interview rate',
          'Offer conversion',
          'Expectation and offer range',
        ],
        howTitle: 'How does it work?',
        steps: [
          { title: 'Describe your process', description: 'Share your role and core application numbers in about 2 minutes.' },
          { title: 'Match with similar profiles', description: 'Your result is compared with illustrative candidates in the same context.' },
          { title: 'Review funnel conversion', description: 'Review your timeline, application volume, and funnel conversion in one result.' },
        ],
        transparencyTitle: 'Illustrative preview for now',
        transparencyText:
          'This prototype does not save responses and uses sample values for peer benchmarks. Once the production data layer is available, only groups with a sufficient sample size will be published.',
      },
    },
    hrProcessForm: {
      trustPanel: {
        dataLabel: 'Anonymous Survey',
        title: 'Did they respond within the promised timeline?',
        description:
          'This prototype does not save responses. In production, response timelines and process-transparency data will enter an anonymous aggregate.',
        items: [
          'No registration required',
          'No name or email asked',
          'Company name is kept anonymous and added to the aggregate score',
        ],
      },
      stepIndicator: {
        progressLabel: 'Form progress',
        items: ['Company and role', 'Process and non-response', 'Evaluation'],
      },
      privacyRow: 'Anonymous · No names collected · No documents required',
      selectPlaceholder: 'Select',
      booleanOptions: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
      steps: {
        step1: {
          title: 'Company and role',
          description: 'Specify the company and the role you interviewed for.',
          fields: {
            companyName: { label: 'Company name', placeholder: 'e.g. Tech Corp' },
            appliedRole: { label: 'Position / role', placeholder: 'e.g. Frontend Developer' },
            processYear: {
              label: 'In what year did the process take place?',
              options: { '2024': '2024', '2025': '2025', '2026': '2026' },
            },
          },
        },
        step2: {
          title: 'Process and non-response',
          description: 'Compare the promised timeline with the actual timeline.',
          fields: {
            promisedTimeline: {
              label: 'Was a response timeline promised at the beginning of the process?',
              options: { yes: 'Yes, a timeline was provided', no: 'No, it was not specified', not_specified: 'I don’t remember' },
            },
            promisedDays: { label: 'In how many days did they say they would respond?' },
            actualDays: { label: 'How many days did it actually take them to respond?' },
            wasGhosted: { label: 'Were you ghosted (communication cut off without notice)?' },
            ghostedAfterStage: {
              label: 'After which stage were you ghosted?',
              options: { application: 'Application', hr_screen: 'Recruiter Interview', technical: 'Technical Interview', final: 'Final Interview' },
            },
            interviewerPrepared: { label: 'Were the interviewers prepared for the interview? (1-5)' },
            wasAskedIrrelevant: { label: 'Were you asked irrelevant or inappropriate questions?' },
            irrelevantTypes: {
              label: 'What kind of questions were asked?',
              options: { age: 'Age', marital_status: 'Marital status', salary_history: 'Salary history', personal_questions: 'Private life', other: 'Other' },
            },
          },
        },
        step3: {
          title: 'Evaluation',
          description: 'Rate the recruiting team and the transparency of the process.',
          fields: {
            rejectionShared: {
              label: 'Was a rejection reason shared?',
              options: { yes_detailed: 'Yes, they gave detailed feedback', yes_generic: 'Yes, but it was a standard template', no: 'No, no reason was given' },
            },
            feedbackUseful: { label: 'Was the feedback useful for your growth? (1-5)' },
            processTransparency: { label: 'Transparency of the process (1-5)' },
            hrProfessionalism: { label: 'Professionalism of the recruiting team (1-5)' },
            wouldRecommendProcess: {
              label: 'Would you recommend this company’s interview process to others?',
              options: { yes: 'Yes', no: 'No', unsure: 'Not sure' },
            },
            freeNote: {
              label: 'Any other details you want to add?',
              placeholder: 'Briefly describe the process without sharing names or identifying information.',
            },
          },
        },
      },
      navigation: {
        back: 'Back',
        next: 'Continue',
        complete: 'Complete and view result',
        loading: 'Preparing…',
      },
      validation: {
        required: 'This field is required.',
        nonNegativeNumber: 'Enter a whole number equal to or greater than 0.',
        noteTooLong: 'The note must be 500 characters or fewer.',
        timelineGapWarning: 'The actual timeline seems much longer than promised. Are you sure you entered it correctly?',
        summary: 'Check the highlighted fields before continuing.',
      },
      submitError: 'The preview could not be prepared. Please try again.',
      success: {
        title: 'Your process evaluation is ready.',
        description: 'Your information was not saved. In production, this evaluation will contribute to candidate-communication and process-transparency analytics.',
        ghostedLabel: 'Ghosting status',
        transparencyLabel: 'Transparency score',
        professionalismLabel: 'Professionalism score',
      },
      explainer: {
        eyebrow: 'Survey purpose',
        title: 'Convert individual candidate experiences into measurable process data.',
        intro:
          'This survey captures an application or interview process as an anonymous record so recurring recruiting practices can be analyzed in aggregate.',
        whyTitle: 'Why share a company experience?',
        reasons: [
          {
            title: 'Compare promised and actual response times',
            description: 'Whether a promised response timeline was met is a core candidate-experience metric.',
          },
          {
            title: 'Measure the non-response rate',
            description: 'Repeated non-response records help evaluate employer communication performance.',
          },
          {
            title: 'Evaluate feedback and process standards',
            description: 'Rejection reasons, interviewer preparation, and inappropriate-question reports help measure candidate-experience quality.',
          },
        ],
        measurementTitle: 'What does this survey measure?',
        measurementDescription:
          'Responses are interpreted through company, role, and process-year context. Personal names, private documents, and identifying details are not part of the measurement.',
        metrics: [
          'Promised response timeline',
          'Actual response timeline',
          'Ghosting stage',
          'Feedback quality',
          'Recruiting-team professionalism',
          'Process recommendation score',
        ],
        howTitle: 'How does it work?',
        steps: [
          { title: 'Place the process in context', description: 'Share the company, role, and year so the experience can be read in the right frame.' },
          { title: 'Compare promise and reality', description: 'Measure the promised response timeline against what actually happened.' },
          { title: 'Contribute to the dataset', description: 'Feedback, non-response, and professionalism data enter the anonymous aggregate.' },
        ],
        transparencyTitle: 'Moderation and sample threshold',
        transparencyText:
          'This prototype does not save responses. In production, company-level results will not be published without moderation and a sufficient sample size.',
      },
    },
  },
}
